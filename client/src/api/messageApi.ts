import api from "@/config/axios";
import { useUserStore } from "@/store/userStore";
import { Message, User } from "@/types/types";
import { toast } from "sonner";

export const MessageApi = {
  getAllMessages: async (): Promise<Message[]> => {
    const token = useUserStore.getState().socketToken || "";
    const response = await api.get("/api/message", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.message(response.data.message);
    return response.data.data;
  },
};
