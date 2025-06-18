import { Message } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "firebase/auth";

export interface initialStateTypes {
  user: User | null;
  chats: Record<
    string,
    {
      messages: Message[];
    }
  >;
}

const initialState: initialStateTypes = {
  user: null,
  chats: {},
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
  },
});

export const { setUser, addMessage, editMessage, updateMessageStatus } =
  globalSlice.actions;
export default globalSlice.reducer;
