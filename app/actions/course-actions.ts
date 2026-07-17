"use server";

import { prisma } from "@/lib/db"; 
import { revalidatePath } from "next/cache";

// ==========================================
// 🟢 TẦNG XỬ LÝ CHO MÔN HỌC (COURSE/SUBJECT)
// ==========================================

export async function createCourse(data: { title: string; subject: string }) {
  const today = new Date().toISOString().split('T')[0]; // Lấy ngày YYYY-MM-DD

  const course = await prisma.course.create({
    data: {
      title: data.title,
      subject: data.subject,
      uploadedAt: today, 
      status: "Chờ duyệt", // Mặc định khi PĐT tạo môn sẽ là Chờ duyệt
    },
  });
  
  revalidatePath("/dashboard"); 
  return course;
}

export async function deleteCourse(id: number) {
  await prisma.course.delete({
    where: { id: id },
  });
  revalidatePath("/dashboard"); 
}

// Hàm lấy dữ liệu danh sách môn học
export async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { id: 'desc' } // Sắp xếp môn mới tạo lên đầu
    });
    return courses;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khóa học:", error);
    return [];
  }
}

// Hàm cập nhật trạng thái môn học (Hiệu trưởng duyệt / từ chối - TC06 & TC07)
// 🔥 ĐÃ THÊM THAM SỐ reason ĐỂ NHẬN LÝ DO TỪ CHỐI TỪ HIỆU TRƯỞNG
export async function updateCourseStatus(id: number, status: string, reason?: string) {
  const course = await prisma.course.update({
    where: { id: id },
    data: { 
      status: status,
      rejectReason: reason || null // Nếu duyệt thì xóa lý do cũ, nếu từ chối thì lưu lý do mới vào
    },
  });
  revalidatePath("/dashboard");
  return course;
}

// ==========================================
// 🟢 🔥 BỔ SUNG CÁC ACTIONS CHO LỚP HỌC (CLASS)
// ==========================================

// Hàm tạo lớp học mới dựa trên môn học đã được duyệt
export async function createClass(data: { name: string; major: string; maxCapacity: number; subjectCode: string }) {
  const newClass = await prisma.class.create({
    data: {
      name: data.name,
      major: data.major,
      maxCapacity: data.maxCapacity,
      subjectCode: data.subjectCode,
      status: "Chờ PĐT duyệt", // 🔥 Trưởng bộ môn tạo thì mặc định phải chờ duyệt
    },
  });
  revalidatePath("/dashboard");
  return newClass;
}

export async function getClasses() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { id: 'desc' }
    });
    return classes;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lớp học:", error);
    return [];
  }
}

// 🔥 HÀM MỚI: Dành riêng cho Phòng Đào Tạo bấm duyệt lớp
export async function updateClassStatus(id: number, status: string) {
  const updatedClass = await prisma.class.update({
    where: { id: id },
    data: { status: status },
  });
  revalidatePath("/dashboard");
  return updatedClass;
}

// Phân công Trưởng Bộ Môn cho Lớp (PĐT dùng)
export async function assignTbmToClass(classId: number, tbmName: string) {
  return await prisma.class.update({
    where: { id: classId },
    data: { 
      assignedTbm: tbmName,
      status: "Chờ phân công GV" // 🔥 Đổi trạng thái tự động
    }
  });
}

// Phân công Giảng Viên cho Lớp (TBM dùng - TC09)
export async function assignLecturerToClass(classId: number, lecturerName: string) {
  return await prisma.class.update({
    where: { id: classId },
    data: { 
      assignedLecturer: lecturerName,
      status: "Đang tuyển" // 🔥 Có GV rồi mới mở cửa đón Sinh viên
    }
  });
}

// PĐT Từ chối duyệt lớp (TC08)
export async function rejectClass(classId: number, reason: string) {
  return await prisma.class.update({
    where: { id: classId },
    data: { 
      status: "Từ chối", 
      rejectReason: reason 
    }
  });
}

// Lưu đăng ký lớp của sinh viên
export async function enrollClass(classId: number, studentEmail: string) {
  await prisma.enrollment.create({
    data: { classId, studentEmail }
  });
  return { success: true };
}

// Xóa đăng ký lớp
export async function unenrollClass(classId: number, studentEmail: string) {
  await prisma.enrollment.deleteMany({
    where: { classId, studentEmail }
  });
  return { success: true };
}

// Lấy danh sách ID lớp sinh viên đã đăng ký
export async function getEnrolledClasses(studentEmail: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentEmail }
  });
  // Thêm định nghĩa kiểu cho e để TypeScript hết báo lỗi implicitly 'any'
  return enrollments.map((e: { classId: number }) => e.classId); 
}