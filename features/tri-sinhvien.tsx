'use client';

import React, { useState } from 'react';

// ==========================================
// TYPES & INTERFACES DEFINITION
// ==========================================
interface CourseClass {
  id: string;
  classCode: string;
  subjectName: string;
  schedule: string;
  currentEnrolled: number;
  maxCapacity: number;
  registrationStatus: 'Not Registered' | 'Registered';
}

// ==========================================
// MOCK DATA (DỮ LIỆU GIẢ LẬP)
// ==========================================
const INITIAL_CLASSES_DATA: CourseClass[] = [
  {
    id: '1',
    classCode: 'TY1 - 38',
    subjectName: 'Giải phẫu bệnh Thú y',
    schedule: 'Thứ 2 (07:30 - 11:00) | Phòng H2.1',
    currentEnrolled: 38,
    maxCapacity: 40,
    registrationStatus: 'Not Registered',
  },
  {
    id: '2',
    classCode: 'TY2 - 38',
    subjectName: 'Dược lý học Thú y',
    schedule: 'Thứ 4 (13:00 - 16:30) | Phòng H1.4',
    currentEnrolled: 40,
    maxCapacity: 40,
    registrationStatus: 'Not Registered',
  },
  {
    id: '3',
    classCode: 'TY3 - 38',
    subjectName: 'Ngoại khoa Thú y',
    schedule: 'Thứ 6 (07:30 - 11:00) | Phòng Lab 3',
    currentEnrolled: 15,
    maxCapacity: 35,
    registrationStatus: 'Not Registered',
  },
  {
    id: '4',
    classCode: 'TY4 - 38',
    subjectName: 'Bệnh truyền nhiễm súc vật',
    schedule: 'Thứ 7 (08:00 - 11:30) | Hội trường A',
    currentEnrolled: 29,
    maxCapacity: 30,
    registrationStatus: 'Not Registered',
  },
];

export default function TriSinhVien() {
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>(INITIAL_CLASSES_DATA);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  // ==========================================
  // HANDLER FUNCTIONS
  // ==========================================
  const handleRegister = (classId: string) => {
    const targetClass = courseClasses.find((c) => c.id === classId);
    if (!targetClass) return;

    // Kiểm tra "Tranh nhau đăng ký" - Nếu lớp đã đạt giới hạn tối đa
    if (targetClass.currentEnrolled >= targetClass.maxCapacity) {
      alert(`Đăng ký thất bại! Lớp [${targetClass.classCode}] đã đạt số lượng giới hạn.`);
      return;
    }

    // Tiến hành cập nhật trạng thái giả lập (Mock logic)
    setCourseClasses((prevClasses) =>
      prevClasses.map((item) =>
        item.id === classId
          ? {
              ...item,
              registrationStatus: 'Registered',
              currentEnrolled: item.currentEnrolled + 1,
            }
          : item
      )
    );

    alert(`Đăng ký thành công môn học: ${targetClass.subjectName}! Hệ thống đã thêm bạn vào danh sách lớp.`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      
      {/* */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-sm">
        <span className="font-semibold">Thông báo:</span> Cổng đăng ký học phần học kỳ mới đang mở. Sinh viên lưu ý theo dõi sát thời gian và số lượng chỗ trống để đăng ký kịp thời.
      </div>

      {/* */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Danh sách Lớp Học Phần Đang Mở</h2>
          <p className="text-xs text-gray-500">Nhấp chuột vào hàng bất kỳ để xem chi tiết thời gian học và thực hiện đăng ký học phần.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Lọc nhanh học phần:</label>
          <select className="w-full sm:w-48 bg-white border border-gray-200 text-gray-800 rounded-md px-3 py-1.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option>Tất cả lớp học</option>
            {courseClasses.map((c) => (
              <option key={c.id} value={c.classCode}>{c.classCode}</option>
            ))}
          </select>
        </div>
      </div>

      {/* */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-sm text-left">
            
            {/* */}
            <thead>
              <tr className="bg-blue-500 text-white font-medium border-b border-gray-200 text-center">
                <th className="p-3 w-16 font-semibold">STT</th>
                <th className="p-3 w-32 font-semibold">Mã Lớp</th>
                <th className="p-3 text-left font-semibold px-6">Tên Môn Học / Học Phần</th>
                <th className="p-3 w-40 font-semibold">Trạng Thái Đăng Ký</th>
              </tr>
            </thead>

            {/* */}
            <tbody className="divide-y divide-gray-100">
              {courseClasses.map((item, index) => {
                const isExpanded = expandedClassId === item.id;
                const isFull = item.currentEnrolled >= item.maxCapacity;

                return (
                  <React.Fragment key={item.id}>
                    {/* Primary Row */}
                    <tr
                      onClick={() => setExpandedClassId(isExpanded ? null : item.id)}
                      className={`cursor-pointer transition-colors text-center ${
                        isExpanded ? 'bg-blue-50/60' : 'hover:bg-gray-50/80'
                      }`}
                    >
                      <td className="p-3 text-gray-500 font-medium">{index + 1}</td>
                      <td className="p-3 font-semibold text-blue-600 tracking-wide">{item.classCode}</td>
                      <td className="p-3 text-left font-medium text-gray-800 px-6">{item.subjectName}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.registrationStatus === 'Registered'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.registrationStatus === 'Registered' ? 'Đã ở trong lớp' : 'Chưa đăng ký'}
                        </span>
                      </td>
                    </tr>

                    {/* */}
                    {isExpanded && (
                      <tr className="bg-gray-50/50 transition-all">
                        <td colSpan={4} className="p-4 border-t border-b border-gray-200/60 px-8">
                          <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            
                            {/* Class Logistics Information */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-700">
                                <span className="text-base">🕒</span>
                                <span className="font-semibold text-gray-900 w-28 inline-block">Thời gian học:</span>
                                <span className="text-gray-600">{item.schedule}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-700">
                                <span className="text-base">👥</span>
                                <span className="font-semibold text-gray-900 w-28 inline-block">Số lượng:</span>
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${isFull ? 'text-red-500' : 'text-blue-600'}`}>
                                    {item.currentEnrolled} / {item.maxCapacity}
                                  </span>
                                  <span className="text-xs text-gray-400">sinh viên đã đăng ký</span>
                                  {isFull && (
                                    <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                      (Lớp đã đầy - Tranh slot thất bại)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Button Group */}
                            <div className="w-full sm:w-auto pt-2 sm:pt-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Không cho kích hoạt đóng dòng khi nhấn nút
                                  handleRegister(item.id);
                                }}
                                disabled={item.registrationStatus === 'Registered' || isFull}
                                className={`w-full sm:w-auto px-5 py-2 rounded-md font-bold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                  item.registrationStatus === 'Registered'
                                    ? 'bg-green-600 text-white cursor-not-allowed shadow-none'
                                    : isFull
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border border-gray-300'
                                    : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95 focus:ring-orange-400'
                                }`}
                              >
                                {item.registrationStatus === 'Registered' ? '✓ Đăng Ký Thành Công' : 'Đăng Ký Học Phần'}
                              </button>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}