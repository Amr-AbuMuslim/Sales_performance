import React, { useState } from "react";
import { Outlet } from "react-router-dom"; // 1. Import Outlet
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

// 2. We don't need LayoutProps with children anymore
export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-[260px]">
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:ml-[260px]">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          {/* 3. Replace {children} with <Outlet /> */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
