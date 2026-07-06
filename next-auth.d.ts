import { DefaultSession } from "next-auth";

// Định nghĩa đủ 7 roles của thầy yêu cầu
export type UserRole = "ADMIN" | "HIEU_TRUONG" | "HR" | "PHONG_DAO_TAO" | "TRUONG_BO_MON" | "GIANG_VIEN" | "SINH_VIEN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole; // Báo cho hệ thống biết Session có role
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole; // Báo cho hệ thống biết User có role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole; // Báo cho hệ thống biết Token có role
  }
}