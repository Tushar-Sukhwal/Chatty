import React from "react";
import ProtectedRouteWrapper from "../protectedRouteWrapper";

//set meta data
export const metadata = {
  title: "Chatty",
  description: "Chatty is a chat application",
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRouteWrapper>{children}</ProtectedRouteWrapper>;
};

export default DashboardLayout;
