"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/nav";
import { Role } from "@/generated/prisma/enums";
import { GraduationCap } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  userRole?: Role;
}

export function Sidebar({ isOpen, userRole }: SidebarProps) {
  const pathname = usePathname();

  // Filter routes based on role
  const routes = NAV_ITEMS.filter((item) =>
    !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 ease-in-out pt-16", // pt-16 accounts for navbar height
        isOpen ? "w-64" : "w-0 md:w-16 overflow-hidden"
      )}
    >
      <div className="flex flex-col h-full py-4">
        {/* Navigation Items */}
        <nav className="flex-1 space-y-2 px-2">
          {routes.map((route) => {
            const isActive = pathname === route.href;

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  !isOpen && "justify-center px-2"
                )}
                title={!isOpen ? route.title : undefined}
              >
                <route.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-primary")} />

                <span className={cn(
                  "transition-all duration-300",
                  isOpen ? "opacity-100" : "opacity-0 w-0 hidden md:block"
                )}>
                  {route.title}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Branding Footer inside Sidebar */}
        <div className={cn("p-4 border-t", !isOpen && "hidden md:flex justify-center")}>
          {isOpen ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>AASTU Exit System</span>
            </div>
          ) : (
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </aside>
  );
}
