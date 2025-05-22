import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket.config";
import { Input } from "../ui/input";
import { v4 as uuidv4 } from "uuid";
export default function Chats({
  group,
  oldMessages,
  chatUser,
}: {
  group: GroupChatType;
  oldMessages: Array<MessageType> | [];
  chatUser?: GroupChatUserType;
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<MessageType>>(oldMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get the socket instance. Assume it's managed (connected/disconnected, room) by useChatsStore.
  const socket = getSocket();

  useEffect(() => {
    // Listener for new messages for this specific chat
    const handleNewMessage = (data: MessageType) => {
      // Ensure message is for the current group/chat before adding
      // TODO: Adjust this check if Chats.tsx is also used for direct chats (e.g., check data.direct_chat_id)
      if (data.group_id === group.id) {
        console.log("The message is", data);
        setMessages((prevMessages) => [...prevMessages, data]);
        scrollToBottom();
      }
    };

    socket.on("message", handleNewMessage);

    // Cleanup: remove only the listener this component added
    return () => {
      socket.off("message", handleNewMessage);
    };
  }, [group.id, socket]); // Add group.id and socket to dependencies

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return; // Prevent sending empty messages

    const payload: MessageType = {
      id: uuidv4(),
      message: message,
      name: chatUser?.name ?? "Unknown",
      created_at: new Date().toISOString(),
      group_id: group.id, // Assuming this component is for group chats
      // If used for direct chats, this logic needs adjustment for direct_chat_id
    };
    socket.emit("message", payload); // Emit to the currently joined room
    setMessage("");
    // Optimistically update messages
    setMessages((prevMessages) => [...prevMessages, payload]);
    scrollToBottom();
  };

  return (
    <div className="flex flex-col h-[94vh]  p-4">
      <div className="flex-1 overflow-y-auto flex flex-col-reverse">
        <div ref={messagesEndRef} />
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-sm rounded-lg p-2 ${
                msg.name === chatUser?.name
                  ? "bg-gradient-to-r from-blue-400 to-blue-600  text-white self-end"
                  : "bg-gradient-to-r from-gray-200 to-gray-300 text-black self-start"
              }`}
            >
              {msg.message}
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-2 flex items-center">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setMessage(e.target.value)}
        />
      </form>
    </div>
  );
}
