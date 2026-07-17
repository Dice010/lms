import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 🚀 1. IMPORT TRẠM PHÁT SÓNG VÀO ĐÂY
import { Providers } from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Tiện tay đổi luôn title dự án cho chuyên nghiệp nhé Leader!
export const metadata: Metadata = {
  title: "Hệ thống LMS - 7 Roles",
  description: "Dự án Quản lý học tập LMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi" // Đổi sang "vi" cho chuẩn dự án Tiếng Việt
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* 🚀 2. BỌC TRẠM PHÁT SÓNG QUANH TOÀN BỘ ỨNG DỤNG */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
