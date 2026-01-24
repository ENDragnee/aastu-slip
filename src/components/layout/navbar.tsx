"use client";

import { signOut } from "next-auth/react";
import {
  Menu, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeSwitcher } from "@/components/layout/theme-switcher"; // ✅ Import your component
import { Role } from "@/generated/prisma/enums";

interface NavbarProps {
  onMenuClick: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    role: Role;
    image?: string | null;
  };
}

export function Navbar({ onMenuClick, user }: NavbarProps) {

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-card/80 backdrop-blur-md px-4 flex items-center justify-between transition-colors duration-300">

      {/* Left: Toggle & Brand */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-bold text-lg hidden sm:inline-block text-primary">
          AASTU Slip
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">

        {/* ✅ Theme Switcher added here */}
        <ThemeSwitcher />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs font-bold text-secondary mt-1">
                    {user.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/sign-in" })}>
                <LogOut className="mr-2 h-4 w-4 text-destructive" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm">Sign In</Button>
        )}
      </div>
    </header>
  );
}
