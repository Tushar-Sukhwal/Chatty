"use client";
import Image from "next/image";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, User } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useState } from "react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleSignupWithEmailAndPassword = async () => {
    const result = await signInWithEmailAndPassword(auth, "test@test.com", "test123");
    setUser(result.user);
    console.log("Signed up", result);
  };
  
  const handleSignupWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
    console.log("Signed up with Google", result);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-700">Sign Up</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button
          onClick={handleSignupWithEmailAndPassword}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition mb-3"
        >
          Sign up with Email
        </button>
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-200"></div>
          <span className="mx-2 text-gray-400 text-xs">or</span>
          <div className="flex-grow h-px bg-gray-200"></div>
        </div>
        <button
          onClick={handleSignupWithGoogle}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-lg transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <g>
              <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.13 2.36 30.45 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.41 13.13 17.74 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.14 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.44c-.54 2.9-2.18 5.36-4.65 7.01l7.2 5.6C43.98 37.13 46.14 31.36 46.14 24.55z"/>
              <path fill="#FBBC05" d="M10.67 28.29c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C.7 16.36 0 20.09 0 24c0 3.91.7 7.64 2.69 12.24l7.98-6.2z"/>
              <path fill="#EA4335" d="M24 48c6.45 0 12.13-2.13 16.19-5.81l-7.2-5.6c-2.01 1.35-4.59 2.16-8.99 2.16-6.26 0-11.59-3.63-13.33-8.79l-7.98 6.2C6.73 42.2 14.82 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </g>
          </svg>
          Sign up with Google
        </button>
      </div>
    </div>
  );
}
