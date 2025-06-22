import api from "@/config/axios";
import { useUserStore } from "@/store/userStore";
import { Message, User } from "@/types/types";

export const MessageApi = {
  getAllMessages: async (): Promise<Message[]> => {
    const token = useUserStore.getState().firebaseToken || "";
    const response = await api.get("/api/message", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },
};
