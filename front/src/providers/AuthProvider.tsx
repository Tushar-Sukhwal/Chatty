"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set up axios interceptor to add the auth token
    const interceptor = axios.interceptors.request.use(
      (config) => {
        // If session exists, add the token
        if (session?.user?.token) {
          config.headers.Authorization = `Bearer ${session.user.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    setIsInitialized(true);

    // Clean up interceptor when component unmounts
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [session?.user?.token]); // Only re-run if the token changes

  return <>{children}</>;
}
