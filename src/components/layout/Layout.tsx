import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarWidth = "260px";

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* Desktop sidebar */}
      <div
        className="hidden lg:block fixed inset-y-0 left-0"
        style={{ width: sidebarWidth }}
      >
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div
        className="flex-1 flex flex-col overflow-hidden w-full"
        style={{
          marginLeft: window.innerWidth >= 1024 ? sidebarWidth : 0,
        }}
      >
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};
