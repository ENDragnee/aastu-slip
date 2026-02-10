import {
  Home,
  LayoutDashboard,
  History,
  Laptop2,
  CheckCircle,
  FileText,
  MessageSquare,
  Info,
  Bed,
  Building,
  MapPin,
  DoorOpen,
  Package,
  UploadCloud,
} from "lucide-react";
import { Role } from "@/generated/prisma/enums";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles?: Role[]; // If undefined, accessible by all
}

export const NAV_ITEMS: NavItem[] = [
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
    roles: [Role.PROCTOR],
  },
  {
    title: "History",
    href: "/proctor/history",
    icon: FileText,
    roles: [Role.PROCTOR],
  },
  {
    title: "Activity Log",
    href: "/proctor/events",
    icon: History,
    roles: [Role.PROCTOR],
  },
  {
    title: "Admin Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: [Role.ADMIN],
  },
  {
    title: "All Laptops",
    href: "/admin/laptops",
    icon: Laptop2,
    roles: [Role.ADMIN],
  },
  {
    title: "Blocks",
    href: "/admin/blocks",
    icon: Building, // Import from lucide-react
    roles: [Role.ADMIN],
  },
  {
    title: "Bulk Assignment",
    href: "/admin/dorms/assignment",
    icon: UploadCloud, // Import from lucide-react
    roles: [Role.ADMIN],
  },
  {
    title: "Dormitories",
    href: "/admin/dorms",
    icon: Bed, // Import from lucide-react
    roles: [Role.ADMIN],
  },
  {
    title: "Gateways",
    href: "/admin/gateways",
    icon: DoorOpen, // Import from lucide-react
    roles: [Role.ADMIN],
  },
  {
    title: "Global Requests",
    href: "/admin/requests",
    icon: FileText,
    roles: [Role.ADMIN],
  },
  {
    title: "Locations",
    href: "/admin/locations",
    icon: MapPin, // Import from lucide-react
    roles: [Role.ADMIN],
  },
  {
    title: "Properties",
    href: "/admin/properties",
    icon: Package,
    roles: [Role.ADMIN],
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
    roles: [Role.GATE],
  },
  {
    title: "About us",
    href: "/about-us",
    icon: Info,
  },
];
