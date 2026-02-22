import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, verifyPassword } from "@/lib/auth";
import { ensureSchema } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await ensureSchema();
        const user = await findUserByEmail(credentials.email);
        if (!user?.password_hash) return null;
        const ok = await verifyPassword(
          credentials.password,
          user.password_hash
        );
        if (!ok) return null;
        return {
          id: String(user.id),
          email: user.email,
          name: user.hospital_name,
          hospitalId: String(user.hospital_id),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.hospitalId = (user as { hospitalId?: string }).hospitalId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub ?? undefined;
        (session.user as { hospitalId?: string }).hospitalId =
          token.hospitalId as string | undefined;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
