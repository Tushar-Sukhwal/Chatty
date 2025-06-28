import api from "@/config/axios";
import { useUserStore } from "@/store/userStore";
import { Message, User, FileAttachment } from "@/types/types";
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

  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    const token = useUserStore.getState().socketToken || "";
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<FileUploadResponse>(
      "/api/message/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },
};

export interface FileUploadResponse {
  message: string;
  data: {
    file: FileAttachment;
    type: "image" | "video" | "document" | "audio";
  };
}
