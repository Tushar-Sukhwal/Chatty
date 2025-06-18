"use client";

import React, { useEffect } from "react";
import StoreProvider, { useAppSelector } from "./redux";
import { useRouter } from "next/navigation";
// import Navbar from "@/components/Navbar";
// import Sidebar from "@/components/Sidebar";
// import AuthProvider from "./authProvider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const user = useAppSelector((state) => state.global.user);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  });

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
      {user ? (
        <>
          {/* <Sidebar /> */}
          <main className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg`}>
            {/* <Navbar /> */}
            {children}
          </main>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      {/* <AuthProvider> */}
      <DashboardLayout>{children}</DashboardLayout>
      {/* </AuthProvider> */}
    </StoreProvider>
  );
};

export default DashboardWrapper;
