"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react"; // ✅ Import this
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { cn } from "@/lib/utils";
import { Role } from "@/generated/prisma/enums";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // ✅ Hook into the session context. This triggers re-renders on login/logout.
  const { data: session } = useSession();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 1. Define routes where the layout should be hidden
  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/auth");

  // 2. Auto-collapse logic
  useEffect(() => {
    if (isPublicPage) return;

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isPublicPage]);

  // 3. Early Return for Public Pages
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    );
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navigation */}
      <Navbar
        onMenuClick={toggleSidebar}
        user={session?.user} // Pass the live user data
      />

      {/* Side Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        userRole={session?.user?.role as Role} // Pass the live role
      />

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 pt-16 transition-all duration-300 ease-in-out flex flex-col",
          isSidebarOpen ? "md:ml-64" : "md:ml-16"
        )}
      >
        <div className="p-4 md:p-6 flex-1">
          {children}
        </div>
        <Footer />
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
