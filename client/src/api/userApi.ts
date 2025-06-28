import api from "@/config/axios";
import { useUserStore } from "@/store/userStore";
import { User } from "@/types/types";
import { toast } from "sonner";

export const UserApi = {
  getMe: async (): Promise<User> => {
    const token = useUserStore.getState().socketToken || "";
    const response = await api.get("/api/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  searchUsersWithNameOrEmail: async (nameOrEmail: string): Promise<User[]> => {
    const token = useUserStore.getState().socketToken || "";
    const response = await api.get(
      `/api/user/get-user-by-username-or-email/${nameOrEmail}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },

  addUserToFriends: async (friendEmail: string): Promise<User> => {
    try {
      const token = useUserStore.getState().socketToken || "";
      const response = await api.post(
        `/api/user/add-user-to-friends/${friendEmail}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      toast.error("Failed to add user to friends");
      throw error;
    }
  },

  fetchOnlineUsers: async (): Promise<string[]> => {
    const token = useUserStore.getState().socketToken || "";
    const response = await api.get("/api/user/online-users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data.data);
    return response.data.data;
  },

  updateProfile: async (profileData: {
    name: string;
    userName: string;
    avatar?: string;
  }): Promise<User> => {
    try {
      const token = useUserStore.getState().socketToken || "";
      const response = await api.put("/api/user/update-profile", profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
      throw error;
    }
  },

  checkUsernameAvailability: async (
    userName: string
  ): Promise<{
    available: boolean;
    message: string;
  }> => {
    try {
      const token = useUserStore.getState().socketToken || "";
      const response = await api.get(`/api/user/check-username/${userName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to check username availability";
      throw new Error(errorMessage);
    }
  },

  uploadAvatar: async (file: File): Promise<string> => {
    try {
      const token = useUserStore.getState().socketToken || "";
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.post("/api/user/upload-avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data.avatar;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to upload avatar";
      toast.error(errorMessage);
      throw error;
    }
  },
};
