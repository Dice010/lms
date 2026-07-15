"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- ACTIONS CHO BÀI KIỂM TRA (EXAM) ---
export async function getExams() {
  return await prisma.exam.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createExam(data: { title: string; subject: string; duration: number; questions: number; openAt: string }) {
  const exam = await prisma.exam.create({
    data: {
      title: data.title,
      subject: data.subject,
      duration: data.duration,
      questions: data.questions,
      openAt: data.openAt,
      status: "Bản nháp"
    }
  });
  revalidatePath("/dashboard");
  return exam;
}

export async function updateExamStatus(id: number, status: string) {
  const exam = await prisma.exam.update({
    where: { id },
    data: { status: status }
  });
  revalidatePath("/dashboard");
  return exam;
}

// --- ACTIONS CHO KẾT QUẢ THI (EXAM RESULT) ---
export async function getExamResults() {
  return await prisma.examResult.findMany();
}

export async function submitExamResult(data: { examTitle: string; student: string; score: number }) {
  const today = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const result = await prisma.examResult.create({
    data: {
      examTitle: data.examTitle,
      student: data.student,
      score: data.score,
      submittedAt: today
    }
  });
  revalidatePath("/dashboard");
  return result;
}