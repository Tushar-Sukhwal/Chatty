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
  //Actions
  setChats: (
    chats: {
      chat: Chat;
      messages: Message[];
      unreadCount: number;
      lastMessage: Message;
    }[]
  ) => void;
  setActiveChat: (chat: Chat) => void;
  setActiveChatName: (name: string) => void;
}

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        chats: [],
        activeChat: null,
        activeChatName: null,
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
        setActiveChat: (chat: Chat) => {
          set({ activeChat: chat });
        },
        setActiveChatName: (name: string) => {
          set({ activeChatName: name });
        },
      }),
      {
        name: "chat-store",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
