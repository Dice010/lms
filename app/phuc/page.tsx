import AcademicManagement from "@/features/AcademicManagement";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function PhucPage() {
  const session = await getServerSession(authOptions);

  // 🎯 BẮT QUẢ TANG: Chưa đăng nhập hoặc sai Role mà dám gõ bừa link /phuc -> Kick ngay!
  if (!session || (session.user.role !== "PHONG_DAO_TAO" && session.user.role !== "TRUONG_BO_MON")) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-slate-900 text-white p-2 text-sm flex justify-between px-6 items-center shadow-md">
        <span>Xin chào Giáo vụ: <strong>{session.user.fullName}</strong></span>
        <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold">{session.user.role}</span>
      </div>
      <AcademicManagement />
    </main>
  );
}