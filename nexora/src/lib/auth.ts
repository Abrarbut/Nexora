import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    vendorProfileId?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role: Role;
      vendorProfileId?: string | null;
    };
  }
  interface JWT {
    id: string;
    role: Role;
    vendorProfileId?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as never,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { vendorProfile: true },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          vendorProfileId: user.vendorProfile?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: Role }).role;
        token.vendorProfileId = (user as { vendorProfileId?: string | null }).vendorProfileId ?? null;
      }

      // Allow session updates (e.g., after vendor approval)
      if (trigger === "update" && session) {
        const s = session as Record<string, unknown>;
        token.role = (s.role as Role) ?? token.role;
        token.vendorProfileId =
          (s.vendorProfileId as string | null) ?? token.vendorProfileId;
      }

      return token;
    },

    async session({ session, token }) {
      const t = token as Record<string, unknown>;
      session.user.id = t.id as string;
      session.user.role = t.role as Role;
      session.user.vendorProfileId = (t.vendorProfileId as string | null) ?? null;
      return session;
    },
  },
});
