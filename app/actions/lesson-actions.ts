"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getLessons() {
  try {
    return await prisma.lesson.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Lỗi lấy bài giảng:", error);
    return [];
  }
}

export async function createLesson(data: {
  title: string;
  courseId: number;
  courseName: string;
  content?: string;
}) {
  const lesson = await prisma.lesson.create({
    data: {
      title: data.title,
      courseId: data.courseId,
      courseName: data.courseName,
      content: data.content,
      status: "Bản nháp",
    },
  });
  revalidatePath("/dashboard");
  return lesson;
}

export async function updateLesson(
  id: number,
  data: { title: string; content: string }
) {
  await prisma.lesson.update({
    where: { id },
    data: { title: data.title, content: data.content },
  });
  revalidatePath("/dashboard");
}

export async function updateLessonStatus(id: number, status: string) {
  await prisma.lesson.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/dashboard");
}

export async function deleteLesson(id: number) {
  await prisma.lesson.delete({ where: { id } });
  revalidatePath("/dashboard");
}