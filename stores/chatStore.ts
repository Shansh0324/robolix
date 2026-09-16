import { create } from "zustand";
import type { ChatMessageResponse } from "@/modules/chat/types/chat.types";

interface ChatState {
  messages: ChatMessageResponse[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  setMessages: (messages: ChatMessageResponse[]) => void;
  addMessage: (message: ChatMessageResponse) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (isLoading) => set({ isLoading }),
  setSending: (isSending) => set({ isSending }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], error: null }),
}));
