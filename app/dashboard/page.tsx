// --- File: app/dashboard/page.tsx ---
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

// 🔌 MÓC XÍCH TOÀN BỘ VŨ KHÍ UI CÓ SẴN CỦA TEAM VÀO ĐÂY
// (Leader lưu ý: Nhớ kiểm tra xem tên file và thư mục thật của nhóm có giống như thế này không nhé)
import HRDashboard from "@/features/HRDashboard"; // File HR của Toàn
import AdminDashboard from "@/features/AdminDashboard"; // File Admin của Toàn
import HieuTruongDashboard from "@/features/HieuTruongDashboard"; // File Hiệu trưởng của Toàn
import AcademicManagement from "@/features/AcademicManagement"; // File Quản lý của Phúc (Dùng chung PĐT & TBM)
import SinhVienDashboard from "@/features/SinhVienDashboard"; // File Sinh viên của Trí
import GiangVienDashboard from "@/features/GiangVienDashboard"; // File Giảng viên của Trí

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Gác cổng bảo vệ vòng trong
  if (!session || !session.user) {
    redirect("/");
  }

  const role = session.user.role;

  // 🎯 BỘ NÃO ĐIỀU HƯỚNG CHÍNH THỨC: Bốc đúng UI xịn của đồng đội ra hiển thị dưới Navbar chung
  switch (role) {
    case "ADMIN":
      return <AdminDashboard />;

    case "HIEU_TRUONG":
      return <HieuTruongDashboard />;

    case "HR":
      return <HRDashboard />;

    case "PHONG_DAO_TAO":
      // 🔥 GIẢI QUYẾT LỖI DÍNH CHUNG TAB CỦA PHÚC:
      // Ép file của Phúc biết người đang đăng nhập là Phòng Đào Tạo qua Prop
      return <AcademicManagement currentRole="PHONG_DAO_TAO" />;

    case "TRUONG_BO_MON":
      // Ép file của Phúc biết người đang đăng nhập là Trưởng Bộ Môn để tự ẩn/hiện tab đúng quyền
      return <AcademicManagement currentRole="TRUONG_BO_MON" />;

    case "GIANG_VIEN":
      return <GiangVienDashboard />;

    case "SINH_VIEN":
      return <SinhVienDashboard />;

    default:
      return (
        <div className="p-6 text-center text-red-500 font-medium">
          Cảnh báo bảo mật: Vai trò không hợp lệ!
        </div>
      );
  }
}