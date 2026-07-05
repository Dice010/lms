// --- TẦNG 2: BỘ ĐÀM DATABASE ---
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const prisma = new PrismaClient();

// --- TẦNG 3: TRẠM GÁC CỔNG (Đoạn code bạn vừa viết) ---
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        username: { type: "text", label: "Ten" },
        password: { type: "password", label: "Mat khau" },
      },
      async authorize(credentials) {
        if (credentials?.username === "admin")
          return { id: "888", role: "ADMIN" };
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Gắn role từ user vào token
      }
      return token;
    },

    // 2. In mặt thẻ (Chạy mỗi khi trang web cần đọc thông tin user)
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role; // Lấy role từ token đắp ra session
      }
      return session;
    }
  },
});

export { handler as GET, handler as POST };
