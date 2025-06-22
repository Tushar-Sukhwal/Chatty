import React from "react";
import ProtectedRouteWrapper from "../protectedRouteWrapper";

//set meta data
export const metadata = {};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRouteWrapper>{children}</ProtectedRouteWrapper>;
};

export default DashboardLayout;
