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
};
