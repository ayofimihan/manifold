import { useEffect, useRef } from "react";
import { Sparkles, X, Send, RotateCcw, Square } from "lucide-react";
import { useChat } from "@/store/chat";
import { useDashboard } from "@/store/dashboard";
import { dealerById } from "@/data/dealers";
import { makeMessage, streamChat } from "@/lib/api";
import type { ConnectorId } from "@/types";
import { ChatMessageView } from "./ChatMessage";

const SUGGESTIONS = [
  "Why did leads drop this month?",
  "Compare channel ROAS for the last 30 days",
  "Which campaign should I scale up?",
  "Summarize marketing performance",
];

export function ChatDrawer() {
  const open = useChat((s) => s.open);
  const setOpen = useChat((s) => s.setOpen);
  const messages = useChat((s) => s.messages);
  const streaming = useChat((s) => s.streaming);
  const input = useChat((s) => s.input);
  const setInput = useChat((s) => s.setInput);
  const appendMessage = useChat((s) => s.appendMessage);
  const patchLast = useChat((s) => s.patchLast);
  const setStreaming = useChat((s) => s.setStreaming);
  const reset = useChat((s) => s.reset);
  const setProvider = useChat((s) => s.setProvider);

  const dealerId = useDashboard((s) => s.dealerId);
  const dealer = dealerById(dealerId);
  const enabledConnectors = useDashboard((s) => s.enabledConnectors);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    function onAsk(e: Event) {
      const text = (e as CustomEvent<string>).detail;
      if (typeof text === "string") ask(text);
    }
    window.addEventListener("chat:ask", onAsk);
    return () => window.removeEventListener("chat:ask", onAsk);
  });

  function ask(text: string) {
    if (!text.trim() || streaming) return;

    const userMsg = makeMessage("user", text.trim());
    appendMessage(userMsg);
    setInput("");

    const assistantMsg = makeMessage("assistant", "");
    appendMessage(assistantMsg);
    setStreaming(true);

    const ctx = {
      dealerId,
      enabledConnectors: (
        Object.keys(enabledConnectors) as ConnectorId[]
      ).filter((k) => enabledConnectors[k]),
      range: "L30D",
    };

    const ctrl = new AbortController();
    controllerRef.current = ctrl;

    let accumulator = "";
    const toolCalls: { tool: string; input: Record<string, unknown> }[] = [];

    streamChat(
      {
        messages: [...messages, userMsg].map(({ role, content }) => ({
          role,
          content,
        })),
        context: ctx,
      },
      ctrl.signal,
      {
        onDelta: (text) => {
          accumulator += text;
          patchLast({ content: accumulator });
        },
        onToolUse: (tool, input) => {
          toolCalls.push({ tool, input });
          patchLast({ toolCalls: [...toolCalls] });
        },
        onMeta: (id, model) => setProvider(id, model),
        onFollowUps: (qs) => patchLast({ followUps: qs }),
        onDone: () => setStreaming(false),
        onError: (err) => {
          patchLast({ content: accumulator + `\n\n[error: ${err.message}]` });
          setStreaming(false);
        },
      },
    );
  }

  function stop() {
    controllerRef.current?.abort();
    setStreaming(false);
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    ask(input);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ask Manifold"
      className="fixed inset-0 z-[60] flex sm:justify-end"
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close chat"
        className="absolute inset-0 bg-black/45 animate-fadeIn cursor-default"
      />
      <aside
        className="relative flex flex-col bg-bg-base shadow-2xl animate-slideIn w-full sm:w-[440px] lg:w-[480px] sm:hairline-l overflow-hidden"
        style={{
          height: "100dvh",
          maxHeight: "100dvh",
          overscrollBehavior: "contain",
        }}
      >
        <header
          className="px-4 hairline-b flex items-center justify-between shrink-0"
          style={{
            paddingTop: "max(0px, env(safe-area-inset-top))",
            minHeight: "3.5rem",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={14} className="text-accent" />
            <span className="text-md font-medium">Ask Manifold</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={reset}
              className="p-2 sm:p-1.5 text-text-tertiary hover:text-text-secondary -mr-1"
              aria-label="Reset conversation"
              title="Reset"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-2 sm:p-1.5 text-text-tertiary hover:text-text-secondary -mr-1"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-5"
        >
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-md text-text-primary font-medium">
                  Hi. What do you want to know?
                </h3>
                <p className="text-xs text-text-tertiary leading-relaxed">
                  Context is scoped to{" "}
                  <span className="text-text-secondary">{dealer.name}</span>.
                  Toggle data sources on the Connectors page to change what's
                  available.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="hairline px-3 py-3 sm:py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:border-accent/40 hover:bg-bg-raised active:bg-bg-raised transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => <ChatMessageView key={m.id} msg={m} />)
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="hairline-t p-3 shrink-0 bg-bg-surface/60"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="hairline focus-within:border-border-muted bg-bg-base flex items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={1}
              placeholder="Ask about KPIs, campaigns, alerts…"
              className="flex-1 bg-transparent px-3 py-2.5 text-[16px] sm:text-sm resize-none outline-none placeholder:text-text-tertiary max-h-32 min-h-[42px] sm:min-h-0"
              disabled={streaming}
            />
            {streaming ? (
              <button
                type="button"
                onClick={stop}
                className="m-1.5 px-3 h-9 sm:h-7 bg-bg-raised hairline text-text-secondary text-xs flex items-center gap-1.5 hover:text-danger hover:border-danger/40"
              >
                <Square size={12} fill="currentColor" />{" "}
                <span className="hidden sm:inline">Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="m-1.5 px-3 h-9 sm:h-7 bg-accent text-bg-base text-xs font-medium flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-hover"
              >
                <Send size={12} />{" "}
                <span className="hidden sm:inline">Send</span>
              </button>
            )}
          </div>
          <div className="hidden sm:flex items-center justify-between mt-2 num text-2xs text-text-muted">
            <span>Enter to send · Shift+Enter for newline</span>
            <span>
              {Object.values(enabledConnectors).filter(Boolean).length}/7
              sources
            </span>
          </div>
        </form>
      </aside>
    </div>
  );
}
