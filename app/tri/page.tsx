// --- File: app/tri/page.tsx ---
import GiangVienDashboard from "@/features/GiangVienDashboard";
import { prisma } from "@/lib/db"; 
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Course } from "@prisma/client";

// 1. Khai báo khuôn mẫu lai để khớp với kiểu xử lý UI của Trí
type MappedCourse = Course & {
  content?: Array<{
    id: string;
    title: string;
    subItems: Array<{ id: string; title: string; content: string }>;
  }>;
};

export default async function TriPage() {
  const session = await getServerSession(authOptions);

  // 🎯 KIỂM TRA BẢO MẬT: Phân quyền Server-side đích thực
  if (!session || session.user.role !== "GIANG_VIEN") {
    redirect("/");
  }

  // 🚀 ĐÃ SỬA: Ép kiểu tường minh MappedCourse[] thay vì để trống [] dẫn đến bị any[]
  let mappedCourses: MappedCourse[] = []; 

  try {
    const rawCourses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Ép kiểu cho callback item để TypeScript hiểu rõ luồng map dữ liệu
    mappedCourses = rawCourses.map((course: Course): MappedCourse => ({
      ...course,
      content: [], 
    }));
  } catch (error) {
    console.error("Lỗi kéo database:", error);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Thanh chặn Auth hiển thị trên cùng Phân hệ Giảng viên */}
      <div className="bg-slate-900 text-white p-2 text-sm flex justify-between px-6 items-center shadow-md">
        <span>Xin chào Giảng viên: <strong>{session.user.fullName}</strong></span>
        <span className="bg-purple-600 px-3 py-1 rounded-full text-xs font-bold">GIANG_VIEN</span>
      </div>
      <GiangVienDashboard initialCourses={mappedCourses} />
    </main>
  );
}