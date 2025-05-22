"use client";

import React from "react";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { AuthProvider } from "./AuthProvider";

interface Props {
  children?: React.ReactNode;
}

export default function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </NextAuthSessionProvider>
  );
}
