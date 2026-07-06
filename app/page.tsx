import AcademicManagement from "@/features/AcademicManagement";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4">
      {/* Gọi component quản lý đào tạo mới ở đây */}
      <AcademicManagement />
    </main>
  );
}