"use client";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const ProtectedRouteWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, hasHydrated } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !user) {
      router.push("/login");
    }
  }, [user, hasHydrated, router]);

  // Use conditional rendering instead of early return
  return hasHydrated ? <>{children}</> : null;
};

export default ProtectedRouteWrapper;
