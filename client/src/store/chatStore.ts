import { Chat, Message } from "@/types/types";
import { create } from "zustand";
import { createJSONStorage, subscribeWithSelector } from "zustand/middleware";
import { persist } from "zustand/middleware";

interface ChatStore {
  // chats : [{Chat, [Messages]}]
  chats: {
    chat: Chat;
    messages: Message[];
    unreadCount: number;
    lastMessage: Message;
  }[];
  activeChat: Chat | null;
  activeChatName: string | null;
  messages: Message[];
  //Actions
  setChats: (
    chats: {
      chat: Chat;
      messages: Message[];
      unreadCount: number;
      lastMessage: Message;
    }[]
  ) => void;
  setActiveChat: (chat: Chat | null) => void;
  setActiveChatName: (name: string | null) => void;
  setMessages: (messages: Message[]) => void;
}

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        chats: [],
        activeChat: null,
        activeChatName: null,
        messages: [],
        setChats: (
          chats: {
            chat: Chat;
            messages: Message[];
            unreadCount: number;
            lastMessage: Message;
          }[]
        ) => {
          set({ chats: chats });
        },
        setActiveChat: (chat: Chat | null) => {
          set({ activeChat: chat });
        },
        setActiveChatName: (name: string | null) => {
          set({ activeChatName: name });
        },
        setMessages: (messages: Message[]) => {
          set({ messages: messages });
        },
      }),
      {
        name: "chat-store",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
