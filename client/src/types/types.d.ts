export interface User {
  _id: string;
  email: string;
  userName: string;
  avatar?: string;
  lastSocketConnectedAt: Date;
  chats: string[];
  friends: string[];
}

export interface Chat {
  chatId: string;
  chatName: string;
  chatType: string;
  chatMembers: string[];
  chatMessages: Message[];
  chatCreatedAt: Date;
  chatUpdatedAt: Date;
}

export interface Message {
  _id: string;
  content: string;
  sender: string;
  receiver: string;
  createdAt: Date;
}
