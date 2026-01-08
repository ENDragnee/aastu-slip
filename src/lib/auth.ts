// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { validate_password } from "./password-utils";
import { randomBytes } from "crypto";
import { getUserAgent } from "./user-agent";

const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours (seconds)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        universityId: {
          label: "ID",
          type: "text",
          placeholder: "ETS0000/00",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.universityId || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // 1. Find user
        const user = await prisma.user.findUnique({
          where: { universityId: credentials.universityId },
        });

        if (!user) {
          throw new Error("Invalid University ID");
        }

        // 2. Find account password
        const account = await prisma.account.findFirst({
          where: { userId: user.id },
          select: { password: true },
        });

        if (!account?.password) {
          throw new Error("Account setup incomplete");
        }

        // 3. Validate password
        const isValid = await validate_password(
          credentials.password,
          account.password,
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        // 4. Return user (goes into JWT callback)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          universityId: user.universityId,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
  },

  jwt: {
    maxAge: SESSION_MAX_AGE,
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in only
      if (user) {
        const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
        const sessionToken = randomBytes(32).toString("hex");
        const userAgent = await getUserAgent();

        // Create DB session ONCE
        await prisma.session.create({
          data: {
            token: sessionToken,
            userId: user.id,
            userAgent: userAgent.userAgent,
            ipAddress: userAgent.ip,
            expiresAt,
          },
        });

        token.token = sessionToken;
        token.exp = Math.floor(expiresAt.getTime() / 1000);
        token.id = user.id;
        token.universityId = user.universityId;
        token.role = user.role;
        token.name = user.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.universityId = token.universityId;
        session.user.role = token.role;
        session.user.name = token.name;
        session.expires = new Date(token.exp * 1000).toISOString();
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
