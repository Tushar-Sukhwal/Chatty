import React from "react";
import { Button } from "../ui/button";
import { Smile } from "lucide-react";
import { Paperclip } from "lucide-react";
import { Input } from "../ui/input";
import { Camera } from "lucide-react";
import { Send } from "lucide-react";

const chatAreaFooter = () => {
  //this will show the input field and send button this should be sticky at the bottom of the chat area
  return (
    <div className="fixed bottom-0 w-full">
      <form className="p-4 bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input placeholder="Type a message" className="flex-1" />
          <Button type="button" variant="ghost" size="icon">
            <Camera className="h-5 w-5" />
          </Button>
          <Button type="submit" variant="ghost" size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default chatAreaFooter;
