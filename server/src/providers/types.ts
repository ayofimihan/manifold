import type { ChatRequest } from '../chat.js';

export type ChatEvent =
  | { type: 'delta'; text: string }
  | { type: 'tool_use'; name: string; input: Record<string, unknown> }
  | { type: 'follow_ups'; questions: string[] }
  | { type: 'meta'; provider: string; model: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface Provider {
  id: string;
  model: string;
  run(req: ChatRequest, system: string): AsyncGenerator<ChatEvent>;
}

export function extractFollowUps(text: string): string[] {
  const m = text.match(/<follow_ups>(.*?)<\/follow_ups>/s);
  if (!m) return [];
  try {
    const arr = JSON.parse(m[1]);
    return Array.isArray(arr) ? arr.slice(0, 3) : [];
  } catch {
    return [];
  }
}
