"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hashSync } from "bcryptjs"; // 🚀 Bổ sung công cụ băm mật khẩu

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(data: { username: string; fullName: string; role: string; password: string }) {
  // 🚀 Băm mật khẩu người dùng nhập vào trước khi nhét xuống Database
  const hashedPassword = hashSync(data.password, 10); 

  const user = await prisma.user.create({
    data: {
      username: data.username,
      fullName: data.fullName,
      role: data.role,
      password: hashedPassword, // Lưu mật khẩu đã băm
    },
  });
  revalidatePath("/dashboard");
  return user;
}

export async function toggleUserStatus(id: number, currentStatus: string) {
  const newStatus = currentStatus === "Bị khóa" ? "Hoạt động" : "Bị khóa";
  const user = await prisma.user.update({
    where: { id },
    data: { status: newStatus },
  });
  revalidatePath("/dashboard");
  return user;
}