import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateUserWithEmailAndPassword,
  useSignInWithEmailAndPassword,
  useSignInWithGoogle,
  useSignOut,
} from "react-firebase-hooks/auth";
import { auth } from "@/config/firebase";
import api from "@/config/axios";
import { Chat, User } from "@/types/types";
import { useUserStore } from "@/store/userStore";
import { useChatStore } from "@/store/chatStore";

interface AuthResponse {
  user: User;
  token: string;
}

interface UseAuthReturn {
  // Authentication methods
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  signupWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Chat methods
  createChat: (userId: string) => Promise<Chat>;

  // Loading states
  emailLoginLoading: boolean;
  googleLoading: boolean;
  emailSignupLoading: boolean;
  signOutLoading: boolean;

  // Error states
  emailLoginError: any;
  googleError: any;
  emailSignupError: any;
  signOutError: any;

  // State
  user: User | null;
  firebaseToken: string | null;
  socketToken: string | null;
  isAuthenticated: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();

  // Firebase hooks
  const [signInWithEmailAndPassword, , emailLoginLoading, emailLoginError] =
    useSignInWithEmailAndPassword(auth);
  const [signInWithGoogle, , googleLoading, googleError] =
    useSignInWithGoogle(auth);
  const [
    createUserWithEmailAndPassword,
    ,
    emailSignupLoading,
    emailSignupError,
  ] = useCreateUserWithEmailAndPassword(auth);
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);

  // Store state
  const {
    user,
    firebaseToken,
    socketToken,
    setUser,
    setFirebaseToken,
    setSocketToken,
  } = useUserStore();

  // API call for backend authentication
  const authApiLogin = useCallback(
    async (token: string): Promise<AuthResponse> => {
      const response = await api.post(
        "/api/auth/login",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    []
  );

  // Chat API
  const createChat = useCallback(
    async (userId: string): Promise<Chat> => {
      if (!firebaseToken) {
        throw new Error("No authentication token available");
      }

      const response = await api.post(
        "/api/chats",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${firebaseToken}`,
          },
        }
      );
      return response.data;
    },
    [firebaseToken]
  );

  // Authentication success handler
  const handleAuthSuccess = useCallback(
    async (firebaseUser: any) => {
      const token = await firebaseUser.getIdToken();
      const authResponse = await authApiLogin(token);

      setUser(authResponse.user);
      setSocketToken(authResponse.token);
      setFirebaseToken(token);

      router.push("/dashboard");
    },
    [authApiLogin, setUser, setSocketToken, setFirebaseToken, router]
  );

  // Authentication methods
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await signInWithEmailAndPassword(email, password);

        if (result?.user) {
          await handleAuthSuccess(result.user);
        }
      } catch (error: any) {
        throw error;
      }
    },
    [signInWithEmailAndPassword, handleAuthSuccess]
  );

  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithGoogle();

      if (result?.user) {
        await handleAuthSuccess(result.user);
      }
    } catch (error: any) {
      throw error;
    }
  }, [signInWithGoogle, handleAuthSuccess]);

  const signupWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await createUserWithEmailAndPassword(email, password);

        if (result?.user) {
          await handleAuthSuccess(result.user);
        }
      } catch (error: any) {
        throw error;
      }
    },
    [createUserWithEmailAndPassword, handleAuthSuccess]
  );

  const signupWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithGoogle();

      if (result?.user) {
        await handleAuthSuccess(result.user);
      }
    } catch (error: any) {
      throw error;
    }
  }, [signInWithGoogle, handleAuthSuccess]);

  const logout = useCallback(async () => {
    try {
      await signOut();
      useUserStore.setState({
        user: null,
        socketToken: null,
        firebaseToken: null,
      });
      useChatStore.setState({ chats: [] });
      router.push("/login");
    } catch (error: any) {
      throw error;
    }
  }, [signOut, router]);

  return {
    // Methods
    loginWithEmail,
    loginWithGoogle,
    signupWithEmail,
    signupWithGoogle,
    logout,
    createChat,

    // Loading states
    emailLoginLoading,
    googleLoading,
    emailSignupLoading,
    signOutLoading,

    // Error states
    emailLoginError,
    googleError,
    emailSignupError,
    signOutError,

    // State
    user,
    firebaseToken,
    socketToken,
    isAuthenticated: !!user,
  };
};
