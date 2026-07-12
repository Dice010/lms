import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs"; // 🚀 Bơm công cụ băm mật khẩu

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Đang làm sạch bảng và nạp dữ liệu mẫu đã được băm bảo mật...");
  await prisma.user.deleteMany({});

  // Chuẩn bị mật khẩu băm của chuỗi '123'
  const hashedPassword = hashSync("123", 10); 

  const testUsers = [
    { username: "admin@lms.edu.vn", fullName: "Nguyễn Văn Admin", role: "ADMIN", password: hashedPassword, status: "Hoạt động" },
    { username: "hieutruong@lms.edu.vn", fullName: "Trần Thế Hiệu Trưởng", role: "HIEU_TRUONG", password: hashedPassword, status: "Hoạt động" },
    { username: "hr@lms.edu.vn", fullName: "Lê Thị Nhân Sự", role: "HR", password: hashedPassword, status: "Hoạt động" },
    { username: "daotao@lms.edu.vn", fullName: "Phạm Văn Đào Tạo", role: "PHONG_DAO_TAO", password: hashedPassword, status: "Hoạt động" },
    { username: "tbm@lms.edu.vn", fullName: "Hoàng Gia Bộ Môn", role: "TRUONG_BO_MON", password: hashedPassword, status: "Hoạt động" },
    { username: "giangvien@lms.edu.vn", fullName: "Đặng Thầy Giáo", role: "GIANG_VIEN", password: hashedPassword, status: "Hoạt động" },
    { username: "sinhvien@lms.edu.vn", fullName: "Nguyễn Học Sinh Viên", role: "SINH_VIEN", password: hashedPassword, status: "Hoạt động" },
  ];

  for (const user of testUsers) {
    await prisma.user.create({ data: user });
  }
  console.log("✅ Quá trình băm và Seeding mật khẩu hoàn tất!");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });