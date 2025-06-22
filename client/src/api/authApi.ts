import api from "@/config/axios";
import { User } from "@/types/types";

export interface AuthResponse {
  user: User;
  token: string;
}

export const AuthApi = {
  signUp: async (firebaseToken: string): Promise<AuthResponse> => {
    const response = await api.post(
      "/api/auth/signup",
      {},
      {
        headers: {
          Authorization: `Bearer ${firebaseToken}`,
        },
      }
    );
    return response.data;
  },

  logIn: async (firebaseToken: string): Promise<AuthResponse> => {
    const response = await api.post(
      "/api/auth/login",
      {},
      {
        headers: {
          Authorization: `Bearer ${firebaseToken}`,
        },
      }
    );
    return response.data;
  },
};
