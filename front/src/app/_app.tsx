"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function AuthInterceptor() {
  const { data: session } = useSession();

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

    // Clean up interceptor when component unmounts
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [session]);

  return null;
}
