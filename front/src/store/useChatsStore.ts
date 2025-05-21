import { create } from "zustand";
import axios from "axios";
import Env from "@/lib/env";
import { getSocket } from "@/lib/socket.config";

interface ChatsStore {
  // User data
  currentUser: UserType | null;
  loadingUser: boolean;

  // Groups
  groups: GroupChatType[];
  loadingGroups: boolean;

  // Direct chats
  directChats: DirectChatType[];
  loadingDirectChats: boolean;

  // Active chat
  activeChatId: string | null;
  activeChatType: ChatType | null;
  messages: MessageType[];
  loadingMessages: boolean;

  // Status tracking
  onlineUsers: string[];
  typingUsers: { [key: string]: string[] };

  // Current chat members
  chatMembers: GroupChatUserType[];
  loadingChatMembers: boolean;

  // UI state
  sidebarOpen: boolean;

  // Actions
  fetchCurrentUser: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  fetchDirectChats: () => Promise<void>;
  setActiveChat: (chatId: string, chatType: ChatType) => Promise<void>;
  sendMessage: (message: string, file?: File) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  addDirectChat: (userId: number) => Promise<void>;
  searchUsers: (email: string) => Promise<UserType[]>;
  createGroup: (title: string, members: number[]) => Promise<void>;
  toggleSidebar: () => void;
  addUserToGroup: (groupId: string, userId: number) => Promise<void>;
  removeUserFromGroup: (groupId: string, memberId: number) => Promise<void>;
  joinGroup: (shareLink: string) => Promise<void>;
  updateOnlineStatus: (status: UserStatusType) => void;
  updateTypingStatus: (status: TypingStatusType) => void;
}

export const useChatsStore = create<ChatsStore>((set, get) => ({
  // Initial state
  currentUser: null,
  loadingUser: false,
  groups: [],
  loadingGroups: false,
  directChats: [],
  loadingDirectChats: false,
  activeChatId: null,
  activeChatType: null,
  messages: [],
  loadingMessages: false,
  onlineUsers: [],
  typingUsers: {},
  chatMembers: [],
  loadingChatMembers: false,
  sidebarOpen: true,

  // Fetch current user profile
  fetchCurrentUser: async () => {
    set({ loadingUser: true });
    try {
      const response = await axios.get(`${Env.BACKEND_URL}/api/users/profile`);
      set({ currentUser: response.data.user, loadingUser: false });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      set({ loadingUser: false });
    }
  },

  // Fetch all groups for the user
  fetchGroups: async () => {
    set({ loadingGroups: true });
    try {
      const response = await axios.get(`${Env.BACKEND_URL}/api/groups`);
      set({ groups: response.data.groups, loadingGroups: false });
    } catch (error) {
      console.error("Error fetching groups:", error);
      set({ loadingGroups: false });
    }
  },

  // Fetch all direct chats for the user
  fetchDirectChats: async () => {
    set({ loadingDirectChats: true });
    try {
      const response = await axios.get(`${Env.BACKEND_URL}/api/direct-chats`);
      set({
        directChats: response.data.directChats,
        loadingDirectChats: false,
      });
    } catch (error) {
      console.error("Error fetching direct chats:", error);
      set({ loadingDirectChats: false });
    }
  },

  // Set active chat and load messages
  setActiveChat: async (chatId: string, chatType: ChatType) => {
    const socket = getSocket();
    const userId = get().currentUser?.id.toString();

    // If switching chats, disconnect from previous chat room
    if (get().activeChatId && socket.connected) {
      socket.disconnect();
    }

    set({
      activeChatId: chatId,
      activeChatType: chatType,
      loadingMessages: true,
      messages: [],
    });

    // Connect to the appropriate room
    if (!socket.connected) {
      socket.auth = { room: chatId, userId };
      socket.connect();

      // Set up socket event listeners
      socket.on("message", (message: MessageType) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      });

      socket.on("typing_status", (status: TypingStatusType) => {
        get().updateTypingStatus(status);
      });

      socket.on("user_status", (status: UserStatusType) => {
        get().updateOnlineStatus(status);
      });
    }

    try {
      // Get chat messages
      let response;

      if (chatType === "direct") {
        response = await axios.get(
          `${Env.BACKEND_URL}/api/direct-chats/${chatId}/messages`
        );
      } else {
        response = await axios.get(
          `${Env.BACKEND_URL}/api/chats/group/${chatId}`
        );
      }

      // Get chat members if it's a group chat
      if (chatType === "group") {
        const membersResponse = await axios.get(
          `${Env.BACKEND_URL}/api/users/group/${chatId}/online`
        );
        set({ chatMembers: membersResponse.data.users });
      }

      set({ messages: response.data.messages, loadingMessages: false });
    } catch (error) {
      console.error("Error setting active chat:", error);
      set({ loadingMessages: false });
    }
  },

  // Send a message
  sendMessage: async (message: string, file?: File) => {
    const { activeChatId, activeChatType, currentUser } = get();

    if (!activeChatId || !currentUser) return;

    const socket = getSocket();

    try {
      const messageData: any = {
        id: crypto.randomUUID(),
        name: currentUser.name,
        message,
        created_at: new Date().toISOString(),
      };

      if (activeChatType === "direct") {
        messageData.direct_chat_id = activeChatId;
      } else {
        messageData.group_id = activeChatId;
      }

      if (file) {
        // Logic for file upload would go here
        // messageData.file = uploadedFileUrl;
      }

      socket.emit("message", messageData);

      // Add message to local state immediately for better UX
      set((state) => ({
        messages: [...state.messages, messageData],
      }));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  },

  // Typing indicators
  startTyping: () => {
    const socket = getSocket();
    socket.emit("typing");
  },

  stopTyping: () => {
    const socket = getSocket();
    socket.emit("stop_typing");
  },

  // Create a direct chat with a user
  addDirectChat: async (userId: number) => {
    try {
      const response = await axios.post(`${Env.BACKEND_URL}/api/direct-chats`, {
        receiverId: userId,
      });

      await get().fetchDirectChats();
      return response.data.chat;
    } catch (error) {
      console.error("Error adding direct chat:", error);
    }
  },

  // Search users by email
  searchUsers: async (email: string): Promise<UserType[]> => {
    try {
      const response = await axios.get(
        `${Env.BACKEND_URL}/api/users/search?email=${encodeURIComponent(email)}`
      );
      return response.data.users;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  },

  // Create a new group
  createGroup: async (title: string, members: number[]) => {
    try {
      await axios.post(`${Env.BACKEND_URL}/api/groups`, {
        title,
        members,
      });

      await get().fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  },

  // Toggle sidebar visibility
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Add a user to a group
  addUserToGroup: async (groupId: string, userId: number) => {
    try {
      await axios.post(`${Env.BACKEND_URL}/api/groups/${groupId}/members`, {
        userId,
      });

      // Refresh members list if this is the active chat
      if (get().activeChatId === groupId && get().activeChatType === "group") {
        const membersResponse = await axios.get(
          `${Env.BACKEND_URL}/api/users/group/${groupId}/online`
        );
        set({ chatMembers: membersResponse.data.users });
      }
    } catch (error) {
      console.error("Error adding user to group:", error);
    }
  },

  // Remove a user from a group
  removeUserFromGroup: async (groupId: string, memberId: number) => {
    try {
      await axios.delete(
        `${Env.BACKEND_URL}/api/groups/${groupId}/members/${memberId}`
      );

      // Refresh members list if this is the active chat
      if (get().activeChatId === groupId && get().activeChatType === "group") {
        const membersResponse = await axios.get(
          `${Env.BACKEND_URL}/api/users/group/${groupId}/online`
        );
        set({ chatMembers: membersResponse.data.users });
      }
    } catch (error) {
      console.error("Error removing user from group:", error);
    }
  },

  // Join a group via share link
  joinGroup: async (shareLink: string) => {
    try {
      await axios.get(`${Env.BACKEND_URL}/api/groups/join/${shareLink}`);
      await get().fetchGroups();
    } catch (error) {
      console.error("Error joining group:", error);
    }
  },

  // Update online status for a user
  updateOnlineStatus: (status: UserStatusType) => {
    const { userId, status: onlineStatus } = status;

    set((state) => {
      // Update online status for chat members
      const updatedChatMembers = state.chatMembers.map((member) => {
        if (member.user && member.user.id.toString() === userId) {
          return {
            ...member,
            user: {
              ...member.user,
              isOnline: onlineStatus === "online",
            },
          };
        }
        return member;
      });

      // Update online status for direct chats
      const updatedDirectChats = state.directChats.map((chat) => {
        if (chat.otherUser.id.toString() === userId) {
          return {
            ...chat,
            otherUser: {
              ...chat.otherUser,
              isOnline: onlineStatus === "online",
            },
          };
        }
        return chat;
      });

      // Update online users array
      let updatedOnlineUsers = [...state.onlineUsers];
      if (onlineStatus === "online" && !updatedOnlineUsers.includes(userId)) {
        updatedOnlineUsers.push(userId);
      } else if (onlineStatus === "offline") {
        updatedOnlineUsers = updatedOnlineUsers.filter((id) => id !== userId);
      }

      return {
        chatMembers: updatedChatMembers,
        directChats: updatedDirectChats,
        onlineUsers: updatedOnlineUsers,
      };
    });
  },

  // Update typing status
  updateTypingStatus: (status: TypingStatusType) => {
    const { users, roomId } = status;

    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [roomId]: users,
      },
    }));
  },
}));
