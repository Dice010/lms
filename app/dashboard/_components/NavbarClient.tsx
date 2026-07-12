"use client";

// --- File: app/dashboard/_components/NavbarClient.tsx ---
import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle } from "lucide-react";

interface NavbarClientProps {
  user: {
    fullName?: string | null;
    username?: string | null;
    role?: string | null;
  };
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const handleLogout = async () => {
    // Ép NextAuth xóa sạch cookie phiên và đẩy người dùng về trang chủ
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex items-center gap-4">
      {/* Thông tin User */}
      <div className="flex items-center gap-2 text-right">
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-800">{user.fullName || "Thành viên"}</p>
          <p className="text-xs text-slate-500">{user.username}</p>
        </div>
        <UserCircle className="h-6 w-6 text-slate-400" />
      </div>

      {/* Nút Đăng xuất thực tế */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleLogout}
        className="text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors"
      >
        <LogOut className="mr-1.5 h-4 w-4" />
        Đăng xuất
      </Button>
    </div>
  );
}