import { DefaultSession, DefaultUser } from "next-auth";
import { Role, AccountType } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      avatarUrl?: string | null;
      role?: Role;
      xp?: number;
      rank?: number;
      streak?: number;
      accountType?: AccountType;
      points?: number;
      premiumUntil?: Date | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role?: Role;
    xp?: number;
    rank?: number;
    streak?: number;
    accountType?: AccountType;
    points?: number;
    premiumUntil?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
