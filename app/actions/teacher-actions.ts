"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Lấy danh sách lớp học được phân công cho một giảng viên cụ thể
export async function getClassesForTeacher(teacherName: string) {
  try {
    const classes = await prisma.class.findMany({
      where: {
        // Trưởng Bộ Môn lưu tên GV vào cột này
        assignedLecturer: teacherName, 

        // 🔥 Đã xóa điều kiện status: "APPROVED" vì TBM đang set thành "Đang tuyển"
      },
    });
    return classes;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lớp của giảng viên:", error);
    return [];
  }
}

// ============================================================================
// QUẢN LÝ BÀI KIỂM TRA (EXAM)
// ============================================================================

// Lấy danh sách toàn bộ bài kiểm tra (Sắp xếp mới nhất lên đầu)
export async function getExams() {
  try {
    return await prisma.exam.findMany({
      orderBy: { id: "desc" },
    });
  } catch (error) {
    console.error("Lỗi lấy bài kiểm tra:", error);
    return [];
  }
}

// Tạo bài kiểm tra mới
// Đã bổ sung tham số questionData dạng chuỗi JSON tùy chọn
export async function createExam(data: {
  title: string;
  subject: string;
  duration: number;
  questions: number;
  openAt: string;
  questionData?: string; 
}) {
  const newExam = await prisma.exam.create({
    data: {
      title: data.title,
      subject: data.subject,
      duration: data.duration,
      questions: data.questions,
      openAt: data.openAt,
      questionData: data.questionData, // 🔥 Lưu nội dung câu hỏi vào DB
      status: "Bản nháp", // Mặc định khi tạo là bản nháp
    },
  });
  
  revalidatePath("/dashboard");
  return newExam;
}

// Xóa bài kiểm tra
export async function deleteExamDB(id: number) {
  await prisma.exam.delete({ where: { id } });
  revalidatePath("/dashboard");
}

// Công bố bài kiểm tra (Chuyển trạng thái sang "Đã công bố")
export async function publishExamDB(id: number) {
  await prisma.exam.update({
    where: { id },
    data: { status: "Đã công bố" },
  });
  revalidatePath("/dashboard");
}


// ============================================================================
// QUẢN LÝ KẾT QUẢ THI (EXAM RESULTS) - ĐƯỢC THÊM MỚI
// ============================================================================

// Lấy danh sách toàn bộ kết quả thi của sinh viên
export async function getExamResults() {
  try {
    return await prisma.examResult.findMany({
      orderBy: { submittedAt: "desc" },
    });
  } catch (error) {
    console.error("Lỗi lấy kết quả bài kiểm tra:", error);
    return [];
  }
}

// Thêm vào cuối file app/actions/teacher-actions.ts
export async function updateExamDB(id: number, data: { 
  title: string; 
  subject: string; 
  duration: number; 
  questions: number; 
  openAt: string; 
  questionData?: string; 
}) {
  const updatedExam = await prisma.exam.update({
    where: { id },
    data: {
      title: data.title,
      subject: data.subject,
      duration: data.duration,
      questions: data.questions,
      openAt: data.openAt,
      questionData: data.questionData,
    }
  });
  revalidatePath("/dashboard");
  return updatedExam;
}