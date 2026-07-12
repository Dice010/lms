// --- File: next-auth.d.ts ---
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string; 
      fullName: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    fullName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    fullName: string;
  }
}