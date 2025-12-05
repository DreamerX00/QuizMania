import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";
import env from "@/lib/env";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (!token?.sub) return session; // ✅ prevent crash if token missing

      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            xp: true,
            rank: true,
            streak: true,
            accountType: true,
            points: true,
            premiumUntil: true,
          },
        });

        if (dbUser && session.user) {
          session.user = {
            ...session.user,
            ...dbUser,
          };
        }
      } catch (error) {
        console.error("Error fetching user in session callback:", error);
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
      }
      // Store Google profile picture in token
      if (account?.provider === "google" && profile) {
        token.picture = (profile as { picture?: string }).picture;
      }
      return token;
    },
  },
  events: {
    async signOut() {
      // Clear any cached data on sign out
      console.log("User signed out");
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: env.NEXTAUTH_SECRET,
};
