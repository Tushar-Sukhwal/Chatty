"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useChatsStore } from "@/store/useChatsStore";
import { Button } from "@/components/ui/button";
import { Loader2, Users, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function JoinGroupPage({
  params,
}: {
  params: { shareLink: string };
}) {
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  const { joinGroup } = useChatsStore();
  const router = useRouter();
  const { toast } = useToast();

  const handleJoinGroup = async () => {
    setIsJoining(true);
    try {
      await joinGroup(params.shareLink);
      setHasJoined(true);
      toast({
        title: "Success",
        description: "You have joined the group chat",
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description:
          "Failed to join the group. The link may be invalid or you're already a member.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
            <Users className="h-10 w-10 text-blue-600 dark:text-blue-300" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Join Group Chat
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You've been invited to join a group chat. Click below to join the
            conversation.
          </p>

          {hasJoined ? (
            <div className="w-full">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-md mb-4">
                <p>You have successfully joined the group!</p>
              </div>
              <Button
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={handleJoinGroup}
              disabled={isJoining}
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Join Group
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
