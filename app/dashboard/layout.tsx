// --- File: app/dashboard/layout.tsx ---
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/navigation";
import NavbarClient from "./_components/NavbarClient"; // Khối client xử lý nút đăng xuất

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Trạm gác cổng bảo vệ vòng ngoài ở Layout: Chưa đăng nhập? Đá bay về trang chủ!
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 2. Navbar dùng chung cho cả 7 Roles */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo / Tên hệ thống */}
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              LMS Portal 7-Roles
            </span>
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
              <span className="rounded-md bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                Môi trường: {session.user.role}
              </span>
            </nav>
          </div>

          {/* Khối bên phải: Tên người dùng và Nút đăng xuất truyền dữ liệu sang Client Component */}
          <NavbarClient user={session.user} />
        </div>
      </header>

      {/* 3. Toàn bộ nội dung Dashboard của các Role sẽ hiển thị ở đây */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}