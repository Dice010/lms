// --- File: app/api/auth/[...nextauth]/route.ts ---
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../../lib/db"; 
import { compareSync } from "bcryptjs"; // 🚀 Bơm công cụ giải mã băm mật khẩu vào đây

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Tài khoản hệ thống",
      credentials: {
        username: { label: "Tên đăng nhập", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        // 🚀 THAY THẾ TOÀN BỘ LOGIC SO SÁNH: 
        // Dùng compareSync để check mật khẩu gõ vào với mật khẩu đã băm (hash) từ DB
        if (user && compareSync(credentials.password, user.password)) {
          return {
            id: user.id.toString(),
            name: user.username,
            fullName: user.fullName,
            role: user.role, 
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.fullName = user.fullName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.fullName = token.fullName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/', 
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };