import { create } from "zustand";
import { createJSONStorage, subscribeWithSelector } from "zustand/middleware";
import { persist } from "zustand/middleware";
import { User } from "@/types/types";

interface UserStore {
  //State
  user: User | null;
  socketToken: string | null;
  firebaseToken: string | null;
  /** Indicates that the persisted state has been loaded on the client */
  hasHydrated: boolean;
  onlineUsers: string[] | null; // user ids
  //Actions
  setUser: (user: User | null) => void;
  setSocketToken: (token: string) => void;
  setFirebaseToken: (token: string) => void;
  setHasHydrated: (state: boolean) => void;
  setOnlineUsers: (users: string[] | null) => void;
}

export const useUserStore = create<UserStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        user: null,
        socketToken: null,
        firebaseToken: null,
        hasHydrated: false,
        onlineUsers: null,
        setUser: (user: User | null) => set({ user }),
        setSocketToken: (token: string) => set({ socketToken: token }),
        setFirebaseToken: (token: string) => set({ firebaseToken: token }),
        setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
        setOnlineUsers: (users: string[] | null) => set({ onlineUsers: users }),
      }),
      {
        name: "user-store",
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          // Flip the hydration flag after the persisted state has been merged
          state?.setHasHydrated(true);
        },
      }
    )
  )
);
