import { Chat, Message } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/types";

export interface initialStateTypes {
  user: User | null;
  chats: Record<
    string,
    {
      messages: Message[];
    }
  >;
  chatList: Chat[];
}

const initialState: initialStateTypes = {
  user: null,
  chats: {},
  chatList: [],
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.chats[action.payload.chatId].messages.push(action.payload);
    },
    editMessage: (state, action: PayloadAction<Message>) => {
      const index = state.chats[action.payload.chatId].messages.findIndex(
        (message) => message.messageId === action.payload.messageId
      );
      if (index !== -1) {
        state.chats[action.payload.chatId].messages[index] = action.payload;
      }
    },
    // update the message status from sending to delivered.
    updateMessageStatus: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        status: string;
      }>
    ) => {
      const index = state.chats[action.payload.chatId].messages.findIndex(
        (message) => message.messageId === action.payload.messageId
      );
      if (index !== -1) {
        state.chats[action.payload.chatId].messages[index].status =
          action.payload.status;
      }
    },
    deleteMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        senderId: string;
      }>
    ) => {
      const index = state.chats[action.payload.chatId].messages.findIndex(
        (message) => message.messageId === action.payload.messageId
      );
      if (index !== -1) {
        state.chats[action.payload.chatId].messages.splice(index, 1);
      }
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      state.chats[action.payload._id] = {
        messages: [],
      };
    },
    setChatList: (state, action: PayloadAction<Chat[]>) => {
      state.chatList = action.payload;
    },
  },
});

export const {
  setUser,
  addMessage,
  editMessage,
  updateMessageStatus,
  deleteMessage,
  addChat,
  setChatList,
} = globalSlice.actions;
export default globalSlice.reducer;


// Dummy data
export const dummyUser: User = {
  _id: "1",
  email: "user@example.com",
  userName: "You",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  lastSocketConnectedAt: new Date(),
  chats: ["1", "2", "3", "4", "5"],
  friends: ["2", "3", "4", "5", "6"],
};

export const dummyChats: Chat[] = [
  {
    _id: "1",
    type: "direct",
    name: "Swati - THN",
    description: "",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b5c0?w=40&h=40&fit=crop&crop=face",
    createdBy: "2",
    participants: [
      { user: "1", lastSeen: new Date() },
      { user: "2", lastSeen: new Date() },
    ],
    lastMessage: "typing...",
    lastMessageAt: new Date(),
    messages: ["1", "2"],
  },
  {
    _id: "2",
    type: "direct",
    name: "Chintu Voda",
    description: "",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    createdBy: "3",
    participants: [
      { user: "1", lastSeen: new Date() },
      { user: "3", lastSeen: new Date() },
    ],
    lastMessage: "In box top h center",
    lastMessageAt: new Date(Date.now() - 86400000), // Yesterday
    messages: ["3"],
  },
  {
    _id: "3",
    type: "direct",
    name: "Pinder whatzap",
    description: "",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    createdBy: "4",
    participants: [
      { user: "1", lastSeen: new Date() },
      { user: "4", lastSeen: new Date() },
    ],
    lastMessage: "K",
    lastMessageAt: new Date(Date.now() - 86400000), // Yesterday
    messages: ["4"],
  },
  {
    _id: "4",
    type: "group",
    name: "Priyanshu pune",
    description: "",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    createdBy: "5",
    participants: [
      { user: "1", lastSeen: new Date() },
      { user: "5", lastSeen: new Date() },
    ],
    lastMessage: "तमे आपको काम न पूरे अपने कैसरव्र भाई",
    lastMessageAt: new Date(Date.now() - 172800000), // 2 days ago
    messages: ["5"],
  },
  {
    _id: "5",
    type: "direct",
    name: "Harash-mumbai",
    description: "",
    avatar:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=40&h=40&fit=crop&crop=face",
    createdBy: "6",
    participants: [
      { user: "1", lastSeen: new Date() },
      { user: "6", lastSeen: new Date() },
    ],
    lastMessage: "w Aram se",
    lastMessageAt: new Date(Date.now() - 259200000), // 3 days ago
    messages: ["6"],
  },
];

export const dummyMessages: Message[] = [
  {
    messageId: "1",
    chatId: "1",
    senderId: "2",
    content: "Hey! Have you seen WhatsApp Web feature?",
    type: "text",
    status: "read",
    replyTo: "",
    sentAt: new Date(Date.now() - 3600000),
    readAt: new Date(Date.now() - 3000000),
    editedAt: new Date(),
  },
  {
    messageId: "2",
    chatId: "1",
    senderId: "1",
    content: "Yeah, Awwwwwwmmmm 😍😍😍",
    type: "text",
    status: "read",
    replyTo: "",
    sentAt: new Date(Date.now() - 3000000),
    readAt: new Date(Date.now() - 2900000),
    editedAt: new Date(),
  },
  {
    messageId: "3",
    chatId: "1",
    senderId: "2",
    content:
      "Find more details on http://theheaddrovers.com/ , I have just published an article about it.",
    type: "text",
    status: "read",
    replyTo: "",
    sentAt: new Date(Date.now() - 2800000),
    readAt: new Date(Date.now() - 2700000),
    editedAt: new Date(),
  },
];
