import api from "@/config/axios";
import { useUserStore } from "@/store/userStore";
import { Chat } from "@/types/types";

export const ChatApi = {
  createChat: async (emails: string[]) => {
    const token = useUserStore.getState().firebaseToken || "";
    const response = await api.post(
      "/api/chats",
      { emails },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },
  getChatsWithMessages: async () => {
    const token = useUserStore.getState().firebaseToken || "";
    const response = await api.get("/api/chats/messages", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  modifyChat: async (chatId: string, chat: Chat) => {
    const token = useUserStore.getState().firebaseToken || "";
    const response = await api.put(`/api/chats/${chatId}`, chat, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  deleteChat: async (chatId: string) => {
    const token = useUserStore.getState().firebaseToken || "";
    const response = await api.delete(`/api/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
