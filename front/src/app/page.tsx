"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Zap, Lock, Globe } from "lucide-react";

export default function LandingPage() {
  const { status } = useSession();

  // Redirect to dashboard if already authenticated
  if (status === "authenticated") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-10 md:py-16 lg:py-24">
          <nav className="flex justify-between items-center mb-8 md:mb-16">
            <div className="text-xl md:text-2xl font-bold">QuickChat</div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs md:text-sm"
              onClick={() => signIn("google")}
            >
              Sign In
            </Button>
          </nav>

          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
                Connect and Chat in Real-Time
              </h1>
              <p className="text-base sm:text-lg md:text-xl opacity-90 mb-6 md:mb-8">
                A modern messaging platform with direct and group chats, online
                status tracking, and real-time typing indicators.
              </p>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-white/90 w-full sm:w-auto"
                onClick={() => signIn("google")}
              >
                <MessageCircle className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                <span className="text-sm md:text-base">
                  Get Started with Google
                </span>
              </Button>
            </div>

            <div className="md:w-1/2 flex justify-center w-full px-4">
              <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-xl border border-white/20">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start space-x-2 md:space-x-3">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="font-bold text-white text-sm md:text-base">
                        A
                      </span>
                    </div>
                    <div className="bg-white/20 rounded-lg p-2 md:p-3 text-white">
                      <p className="text-sm md:text-base">
                        Hey there! How's it going?
                      </p>
                      <p className="text-[10px] md:text-xs opacity-70 mt-1">
                        12:34 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 md:space-x-3 justify-end">
                    <div className="bg-white rounded-lg p-2 md:p-3 text-blue-600">
                      <p className="text-sm md:text-base">
                        I'm doing great! Just checking out this new chat app.
                      </p>
                      <p className="text-[10px] md:text-xs text-blue-400 mt-1">
                        12:35 PM
                      </p>
                    </div>
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-purple-500 flex items-center justify-center">
                      <span className="font-bold text-white text-sm md:text-base">
                        B
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-white/70 text-xs md:text-sm">
                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-green-400 rounded-full"></div>
                    <span>Alice is typing...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-10 md:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            Features
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">
                Direct Messaging
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                Connect one-on-one with friends and colleagues through private
                conversations.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">
                Group Chats
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                Create and manage group conversations with multiple
                participants.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md sm:col-span-2 md:col-span-1">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">
                Real-Time Features
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                See who's online and when someone is typing a message in
                real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl md:text-2xl font-bold">QuickChat</h2>
              <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
                Connect and chat with anyone, anywhere.
              </p>
            </div>

            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Lock className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-500 text-xs md:text-sm">
            &copy; {new Date().getFullYear()} QuickChat. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
