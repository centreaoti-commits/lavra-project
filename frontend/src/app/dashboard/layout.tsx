"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/components/providers/auth-provider";
import { useWebSocket } from "@/hooks/use-websocket";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const { lastAlert } = useWebSocket(userId);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (lastAlert && Notification.permission === "granted") {
      new Notification(lastAlert.title, { body: lastAlert.message });
    }
  }, [lastAlert]);

  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-hidden bg-[#06060a]">
        {/* Animated mesh background */}
        <div className="mesh-bg fixed inset-0 z-0" />
        
        {/* Floating orbs */}
        <div className="orb fixed -top-32 -left-32 h-96 w-96 bg-purple-600/20 z-0" />
        <div className="orb fixed top-1/3 -right-48 h-80 w-80 bg-cyan-600/15 z-0" style={{ animationDelay: "5s" }} />
        <div className="orb fixed -bottom-32 left-1/3 h-72 w-72 bg-emerald-600/10 z-0" style={{ animationDelay: "10s" }} />
        
        {/* Grid overlay */}
        <div className="grid-bg fixed inset-0 z-0 opacity-50" />
        
        {/* Noise texture */}
        <div className="noise-overlay" />

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/80 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <div className="relative z-10">
          {/* Sidebar — hidden on mobile, shown on lg+ */}
          <div
            className={`
              fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
              lg:translate-x-0
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
            style={{ isolation: 'isolate' }}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>

          {/* Content area */}
          <div className="lg:pl-64">
            <Topbar onMenuClick={() => setSidebarOpen(true)} />
            <main className="p-4 sm:p-6 page-enter">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
