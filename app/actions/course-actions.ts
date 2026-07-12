"use server";

// 1. Sửa lại cách import: Phải có dấu ngoặc nhọn { prisma }
import { prisma } from "@/lib/db"; 
import { revalidatePath } from "next/cache";

export async function createCourse(data: { title: string; subject: string }) {
  const today = new Date().toISOString().split('T')[0]; // Lấy ngày YYYY-MM-DD

  // Đổi db.course thành prisma.course
  const course = await prisma.course.create({
    data: {
      title: data.title,
      subject: data.subject,
      uploadedAt: today, 
      status: "Bản nháp", 
    },
  });
  
  revalidatePath("/giang-vien"); 
  return course;
}

export async function deleteCourse(id: number) {
  // Đổi db.course thành prisma.course
  await prisma.course.delete({
    where: { id: id },
  });
  revalidatePath("/tri"); 
}

// Hàm lấy dữ liệu (READ)
export async function getCourses() {
  try {
    // Đổi db.course thành prisma.course
    const courses = await prisma.course.findMany();
    return courses;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khóa học:", error);
    return [];
  }
}

// Thêm vào cuối file app/actions/course-actions.ts để Giảng viên bấm nút Công bố
export async function updateCourseStatus(id: number, status: string) {
  const course = await prisma.course.update({
    where: { id: id },
    data: { status: status },
  });
  return course;
}