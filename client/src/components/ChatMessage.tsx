import { Sparkles, User, Wrench } from 'lucide-react';
import type { ChatMessage as ChatMsg } from '@/types';
import { cn } from '@/lib/cn';

export function ChatMessageView({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex gap-3 animate-fadeIn', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'shrink-0 size-7 hairline flex items-center justify-center',
          isUser ? 'bg-bg-raised text-text-secondary' : 'bg-accent/10 text-accent border-accent/30',
        )}
      >
        {isUser ? <User size={13} /> : <Sparkles size={13} />}
      </div>
      <div className={cn('flex-1 min-w-0 space-y-2', isUser && 'text-right')}>
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {msg.toolCalls.map((t, i) => (
              <span key={i} className="chip text-text-tertiary border-border-subtle">
                <Wrench size={9} /> {t.tool}
              </span>
            ))}
          </div>
        )}
        <div
          className={cn(
            'text-sm leading-relaxed whitespace-pre-wrap',
            isUser ? 'text-text-primary' : 'text-text-secondary',
          )}
        >
          {renderContent(msg.content)}
          {!msg.content && !isUser && <span className="inline-block w-1.5 h-3 bg-accent align-middle animate-pulse" />}
        </div>
        {msg.followUps && msg.followUps.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {msg.followUps.map((q, i) => (
              <FollowUp key={i} text={q} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FollowUp({ text }: { text: string }) {
  return (
    <button
      onClick={() => {
        const ev = new CustomEvent('chat:ask', { detail: text });
        window.dispatchEvent(ev);
      }}
      className="chip text-text-secondary border-border-subtle hover:border-accent/40 hover:text-accent"
    >
      {text}
    </button>
  );
}

function stripControlTags(text: string): string {
  return text
    .replace(/<follow_ups>[\s\S]*?<\/follow_ups>/g, '')
    .replace(/<function\b[^>]*>[\s\S]*?<\/function>/g, '')
    .replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '')
    .replace(/<\|python_tag\|>[\s\S]*?(?=$|\n)/g, '')
    .replace(/<follow_ups\b[\s\S]*$/, '')
    .replace(/<function\b[\s\S]*$/, '')
    .replace(/<tool_call\b[\s\S]*$/, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '');
}

function renderContent(text: string) {
  const cleaned = stripControlTags(text);
  const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={i} className="text-text-primary font-medium num">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}
