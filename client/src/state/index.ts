import { Message } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "firebase/auth";



export interface initialStateTypes {
  user : User | null;
  messages: Message[];
}

const initialState: initialStateTypes = {
  user: null,
  messages: [],
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const index = state.messages.findIndex(message => message._id === action.payload._id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    deleteMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(message => message._id !== action.payload);
    },
  },
});

export const { setUser, addMessage, updateMessage, deleteMessage } = globalSlice.actions;
export default globalSlice.reducer;
