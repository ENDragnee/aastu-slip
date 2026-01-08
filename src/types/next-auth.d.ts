// src/types/next-auth.d.ts
import { Role } from "@/generated/prisma/enums"; // Adjust path to your generated enums
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      universityId: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    universityId: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    universityId: string;
    role: Role;
    exp: number;
    token: string;
  }
}
