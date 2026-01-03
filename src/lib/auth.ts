// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { validate_password } from "./password-utils";

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
          label: "password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.universityId || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          // 1. Find the user
          const user = await prisma.user.findUnique({
            where: {
              universityId: credentials.universityId,
            },
          });

          if (!user) {
            throw new Error("Invalid University ID");
          }

          // 2. Find the password (Account table)
          const account = await prisma.account.findFirst({
            where: {
              userId: user.id,
            },
            select: {
              password: true,
            },
          });

          if (!account || !account.password) {
            throw new Error("Account setup incomplete (No password found)");
          }

          // 3. CRITICAL FIX: await the password validation
          const isValid = await validate_password(
            credentials.password,
            account.password,
          );

          if (!isValid) {
            throw new Error("Invalid Password");
          }

          // 4. Return the user object (this gets passed to the jwt callback)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            universityId: user.universityId,
            role: user.role,
          };
        } catch (error: any) {
          // Throwing error here allows NextAuth to display it on the error page
          console.error("Auth Error:", error.message);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/",
  },
  // 5. FIX: Callbacks must be inside the 'callbacks' object
  callbacks: {
    async jwt({ token, user }) {
      // The 'user' argument is only passed the first time they log in.
      // We persist these details into the JWT token.
      if (user) {
        token.id = user.id;
        token.universityId = user.universityId;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      // Pass properties from the JWT to the client-side Session object
      if (token && session.user) {
        session.user.id = token.id;
        session.user.universityId = token.universityId;
        session.user.role = token.role;
        session.user.name = token.name;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
