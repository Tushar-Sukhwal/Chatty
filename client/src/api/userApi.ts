import api from "@/config/axios";
import { useUserStore } from "@/store/userStore";
import { User } from "@/types/types";

export const UserApi = {
  searchUsersWithNameOrEmail: async (nameOrEmail: string): Promise<User[]> => {
    const token = useUserStore.getState().firebaseToken || "";
    const response = await api.get(
      `/api/user/get-user-by-username-or-email/${nameOrEmail}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
  
  addUserToFriends: async (userId: string): Promise<void> => {
    const token = useUserStore.getState().firebaseToken || "";
    const response = await api.post(`/api/user/add-user-to-friends/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
