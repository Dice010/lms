'use client';

import React from 'react';
import TriSinhVien from '@/features/tri-sinhvien'; // Hãy chắc chắn đường dẫn này đúng với cấu trúc thư mục của bạn

export default function TriPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Gọi component danh sách môn học vào đây */}
      <TriSinhVien />
    </div>
  );
}