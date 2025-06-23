import api from "@/config/axios";
import { User } from "@/types/types";
import { toast } from "sonner";

export interface AuthResponse {
  user: User;
  token: string;
}

export const AuthApi = {
  signUp: async (firebaseToken: string): Promise<AuthResponse | null> => {
    try {
      const response = await api.post(
        "/api/auth/signup",
        {},
        {
          headers: {
            Authorization: `Bearer ${firebaseToken}`,
          },
        }
      );

      toast.message(response.data.message);
      return response.data;
    } catch (error: any) {
      toast.error(error.response.data.message);
      return null;
    }
  },

  logIn: async (firebaseToken: string): Promise<AuthResponse | null> => {
    try {
      const response = await api.post(
        "/api/auth/login",
        {},
        {
          headers: {
            Authorization: `Bearer ${firebaseToken}`,
          },
        }
      );
      toast.message(response.data.message);
      return response.data;
    } catch (error: any) {
      toast.error(error.response.data.message);
      return null;
    }
  },
};
