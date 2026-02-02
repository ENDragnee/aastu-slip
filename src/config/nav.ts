import {
  Home,
  LayoutDashboard,
  History,
  Laptop2,
  CheckCircle,
  FileText,
  MessageSquare,
  Info,
} from "lucide-react";
import { Role } from "@/generated/prisma/enums";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles?: Role[]; // If undefined, accessible by all
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "About us",
    href: "/about-us",
    icon: Info,
  },
  {
    title: "Contact us",
    href: "/contact-us",
    icon: MessageSquare,
  },
  // --- Student Routes ---
  {
    title: "Request Exit",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [Role.STUDENT],
  },
  {
    title: "Request History",
    href: "/requests",
    icon: History,
    roles: [Role.STUDENT],
  },
  // --- Proctor Routes ---
  {
    title: "Dashboard",
    href: "/proctor/dashboard",
    icon: LayoutDashboard,
    roles: [Role.PROCTOR, Role.ADMIN],
  },
  {
    title: "History",
    href: "/proctor/history",
    icon: FileText,
    roles: [Role.PROCTOR, Role.ADMIN],
  },
  {
    title: "Activity Log",
    href: "/proctor/events",
    icon: History,
    roles: [Role.PROCTOR, Role.ADMIN],
  },
  // --- Gateway Routes ---
  {
    title: "Check Exit",
    href: "/gateway",
    icon: CheckCircle,
    roles: [Role.GATE, Role.ADMIN],
  },
  {
    title: "Laptops",
    href: "/gateway/laptops",
    icon: Laptop2,
    roles: [Role.GATE, Role.ADMIN],
  },
];
