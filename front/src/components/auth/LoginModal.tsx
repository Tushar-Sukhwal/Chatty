import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { DialogDescription } from "@radix-ui/react-dialog";

const handleGoogleLogin = async () => {
  signIn("google", {
    redirect: true,
    callbackUrl: "/",
  });
};

export default function LoginModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs md:text-sm h-8 md:h-10">
          Getting start
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-sm md:max-w-md p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">
            Welcome to QuickChat
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base mt-2">
            QuickChat makes it effortless to create secure chat links and start
            conversations in seconds.
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          className="mt-2 md:mt-4 text-sm md:text-base h-9 md:h-10"
        >
          <Image
            src="/images/google.png"
            className="mr-2 md:mr-4 h-5 w-5 md:h-6 md:w-6"
            width={24}
            height={24}
            alt="google"
          />
          Continue with Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}
