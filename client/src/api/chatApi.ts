import api from "@/config/axios";
import { useUserStore } from "@/store/userStore";
import { Chat } from "@/types/types";
import { toast } from "sonner";

export const ChatApi = {
  createChat: async (emails: string[], chatName: string) => {
    const token = useUserStore.getState().socketToken || "";
    const response = await api.post(
      "/api/chat",
      { emails, chatName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    toast.message(response.data.message);
    return response.data.data;
  },
  getChatsWithMessages: async () => {
    const token = useUserStore.getState().socketToken || "";
    const response = await api.get("/api/chats/messages", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  modifyChat: async (chatId: string, chat: Chat) => {
    const token = useUserStore.getState().socketToken || "";
    const response = await api.put(`/api/chats/${chatId}`, chat, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  deleteChat: async (chatId: string) => {
    const token = useUserStore.getState().socketToken || "";
    const response = await api.delete(`/api/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
