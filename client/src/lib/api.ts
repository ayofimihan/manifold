import type { ChatMessage } from '@/types';
import type { ConnectorId, DealerId } from '@/types';

export interface ChatContext {
  dealerId: DealerId;
  enabledConnectors: ConnectorId[];
  range: string;
}

export interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  context: ChatContext;
}

export interface StreamHandlers {
  onDelta: (text: string) => void;
  onToolUse?: (tool: string, input: Record<string, unknown>) => void;
  onFollowUps?: (qs: string[]) => void;
  onMeta?: (provider: string, model: string) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
}

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) return path;
  return new URL(path, `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}`).toString();
}

export async function streamChat(req: ChatRequest, signal: AbortSignal, handlers: StreamHandlers) {
  const res = await fetch(apiUrl('/api/chat'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  });

  if (!res.ok || !res.body) {
    handlers.onError?.(new Error(`Chat request failed: ${res.status}`));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      if (!chunk.startsWith('data:')) continue;
      const json = chunk.slice(5).trim();
      if (!json) continue;
      try {
        const evt = JSON.parse(json);
        if (evt.type === 'delta') handlers.onDelta(evt.text);
        else if (evt.type === 'tool_use') handlers.onToolUse?.(evt.name, evt.input);
        else if (evt.type === 'follow_ups') handlers.onFollowUps?.(evt.questions);
        else if (evt.type === 'meta') handlers.onMeta?.(evt.provider, evt.model);
        else if (evt.type === 'done') handlers.onDone?.();
        else if (evt.type === 'error') handlers.onError?.(new Error(evt.message));
      } catch {
        // skip malformed event
      }
    }
  }
  handlers.onDone?.();
}

export function makeMessage(role: ChatMessage['role'], content = ''): ChatMessage {
  return { id: crypto.randomUUID(), role, content, createdAt: Date.now() };
}
