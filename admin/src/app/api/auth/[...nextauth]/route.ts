import NextAuth from "next-auth";
// import { PrismaAdapter } from "@auth/prisma-adapter"; // Temporarily comment if not installed
import { prisma } from "@lib/prisma";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Create auth configuration
const authOptions: NextAuthConfig = {
  // adapter: PrismaAdapter(prisma), // Comment if adapter not available
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Your authorization logic here
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // Add your user validation logic
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });
        
        if (!user) return null;
        
        // Add password validation logic here
        // For example: compare hashed passwords
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          // other user fields
        };
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session , token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

// Export handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions }; // <-- यहाँ authOptions export करें