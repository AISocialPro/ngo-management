import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        
        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          // For demo/testing: Create user if doesn't exist
          // In production, remove this and only allow existing users
          const hashedPassword = await bcrypt.hash(password, 10);
          
          const newUser = await prisma.user.create({
            data: {
              email,
              name: email.split('@')[0],
              role: (credentials.role as string) || "STAFF",
              isActive: true, // Auto-activate for demo
            }
          });
          
          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
          };
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error("Account is pending admin approval");
        }

        // For demo: Accept any password
        // In production, verify password:
        // const isValid = await bcrypt.compare(password, user.password);
        // if (!isValid) throw new Error("Invalid password");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Allow all sign-ins for demo
      // In production, add additional checks here
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);