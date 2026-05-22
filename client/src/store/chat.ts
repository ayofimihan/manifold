import { create } from 'zustand';
import type { ChatMessage } from '@/types';

interface ChatState {
  open: boolean;
  messages: ChatMessage[];
  streaming: boolean;
  input: string;
  provider: { id: string; model: string } | null;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  setInput: (v: string) => void;
  appendMessage: (m: ChatMessage) => void;
  patchLast: (patch: Partial<ChatMessage>) => void;
  setStreaming: (v: boolean) => void;
  setProvider: (id: string, model: string) => void;
  reset: () => void;
}

export const useChat = create<ChatState>((set) => ({
  open: false,
  messages: [],
  streaming: false,
  input: '',
  provider: null,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
  setInput: (input) => set({ input }),
  appendMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  patchLast: (patch) =>
    set((s) => {
      if (s.messages.length === 0) return s;
      const next = s.messages.slice();
      next[next.length - 1] = { ...next[next.length - 1], ...patch };
      return { messages: next };
    }),
  setStreaming: (streaming) => set({ streaming }),
  setProvider: (id, model) => set({ provider: { id, model } }),
  reset: () => set({ messages: [] }),
}));
