// --- File: app/actions/user-actions.ts ---
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(data: { username: string; fullName: string; role: string; password: string }) {
  const user = await prisma.user.create({
    data: {
      username: data.username,
      fullName: data.fullName,
      role: data.role,
      password: data.password,
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