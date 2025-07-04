import { create } from "zustand";
import { createJSONStorage, subscribeWithSelector } from "zustand/middleware";
import { persist } from "zustand/middleware";

interface UiStore {
  isSidebarOpen: boolean;
  isAddFriendModalOpen: boolean;
  isCreateChatModalOpen: boolean;
  isChatAreaInfoModalOpen: boolean;
  isDarkMode: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  setIsAddFriendModalOpen: (isAddFriendModalOpen: boolean) => void;
  setIsCreateChatModalOpen: (isCreateChatModalOpen: boolean) => void;
  setIsChatAreaInfoModalOpen: (isChatAreaInfoModalOpen: boolean) => void;
  setIsDarkMode: (isDarkMode: boolean) => void;
  toggleDarkMode: () => void;
}

export const useUiStore = create<UiStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        isSidebarOpen: false,
        isAddFriendModalOpen: false,
        isCreateChatModalOpen: false,
        isChatAreaInfoModalOpen: false,
        isDarkMode: false,
        setIsSidebarOpen: (isSidebarOpen: boolean) => set({ isSidebarOpen }),
        setIsAddFriendModalOpen: (isAddFriendModalOpen: boolean) =>
          set({ isAddFriendModalOpen }),
        setIsCreateChatModalOpen: (isCreateChatModalOpen: boolean) =>
          set({ isCreateChatModalOpen }),
        setIsChatAreaInfoModalOpen: (isChatAreaInfoModalOpen: boolean) =>
          set({ isChatAreaInfoModalOpen }),
        setIsDarkMode: (isDarkMode: boolean) => set({ isDarkMode }),
        toggleDarkMode: () =>
          set((state) => ({ isDarkMode: !state.isDarkMode })),
      }),
      {
        name: "ui-store",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
