"use client";

import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge }  from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap, BookOpen, ClipboardList, BarChart2,
  CheckCircle, Clock, PlusCircle, Play,
} from "lucide-react";

// ------------------------------------
// Mock Data — Lớp học có thể đăng ký
// ------------------------------------
const fakeAvailableClasses = [
  { id: 1, code: "CS301-01", name: "Trí Tuệ Nhân Tạo",   teacher: "GV Nguyễn Hữu Đức", schedule: "T2-T4 07:30", slots: 35, registered: 28, enrolled: false },
  { id: 2, code: "SE401-02", name: "Kiến Trúc Phần Mềm", teacher: "GV Trần Văn Minh",  schedule: "T3-T5 09:30", slots: 40, registered: 40, enrolled: false },
  { id: 3, code: "DS201-01", name: "Khoa Học Dữ Liệu",   teacher: "GV Lê Thị Hoa",     schedule: "T2-T6 13:30", slots: 30, registered: 15, enrolled: true  },
  { id: 4, code: "NW102-01", name: "Mạng Máy Tính",      teacher: "GV Phạm Quốc Bảo",  schedule: "T4-T6 07:30", slots: 35, registered: 20, enrolled: true  },
];

// ------------------------------------
// Mock Data — Bài kiểm tra của sinh viên
// ------------------------------------
const fakeMyExams = [
  { id: 1, title: "Kiểm tra giữa kỳ - Khoa Học Dữ Liệu", subject: "DS201", duration: 60, openAt: "2025-06-15 08:00", status: "Đã nộp",   score: 8.5  },
  { id: 2, title: "Quiz chương 2 - Mạng Máy Tính",        subject: "NW102", duration: 20, openAt: "2025-06-20 10:00", status: "Đã nộp",   score: 7.0  },
  { id: 3, title: "Kiểm tra cuối kỳ - Khoa Học Dữ Liệu", subject: "DS201", duration: 90, openAt: "2025-07-01 07:30", status: "Chưa làm", score: null },
  { id: 4, title: "Quiz Stack & Queue - Mạng",             subject: "NW102", duration: 15, openAt: "2025-07-05 14:00", status: "Chưa làm", score: null },
];

// ------------------------------------
// Mock Data — Bảng điểm
// ------------------------------------
const fakeGrades = [
  { id: 1, subject: "Khoa Học Dữ Liệu", code: "DS201", midterm: 8.5, final: null, avg: null, status: "Đang học"   },
  { id: 2, subject: "Mạng Máy Tính",    code: "NW102", midterm: 7.0, final: null, avg: null, status: "Đang học"   },
  { id: 3, subject: "Lập Trình Java",   code: "CS201", midterm: 9.0, final: 8.5,  avg: 8.7,  status: "Hoàn thành" },
  { id: 4, subject: "CTDL & Giải Thuật",code: "CS202", midterm: 6.5, final: 7.0,  avg: 6.8,  status: "Hoàn thành" },
];

type AvailableClass = (typeof fakeAvailableClasses)[0];
type MyExam         = (typeof fakeMyExams)[0];
type MainTab        = "classes" | "exams" | "grades";

// ------------------------------------
// Main Component
// ------------------------------------
export default function SinhVienDashboard() {
  const [classes, setClasses]     = useState<AvailableClass[]>(fakeAvailableClasses);
  const [activeTab, setActiveTab] = useState<MainTab>("classes");

  // Exam confirm dialog
  const [showExamDialog, setShowExamDialog]   = useState(false);
  const [selectedExam, setSelectedExam]       = useState<MyExam | null>(null);

  // Class detail dialog
  const [showClassDetail, setShowClassDetail] = useState(false);
  const [selectedClass, setSelectedClass]     = useState<AvailableClass | null>(null);

  /* ---- Handlers ---- */
  const handleEnroll = (id: number) => {
    setClasses(classes.map(c => c.id === id ? { ...c, enrolled: true, registered: c.registered + 1 } : c));
    setShowClassDetail(false);
  };
  const handleUnenroll = (id: number) => {
    setClasses(classes.map(c => c.id === id ? { ...c, enrolled: false, registered: c.registered - 1 } : c));
  };

  /* ---- Stats ---- */
  const enrolledCount = classes.filter(c => c.enrolled).length;
  const pendingExams  = fakeMyExams.filter(e => e.status === "Chưa làm").length;
  const doneExams     = fakeMyExams.filter(e => e.status === "Đã nộp").length;
  const completedAvg  = fakeGrades.filter(g => g.avg !== null);
  const avgScore      = completedAvg.length
    ? completedAvg.reduce((sum, g) => sum + (g.avg ?? 0), 0) / completedAvg.length
    : 0;

  const stats = [
    { label: "Lớp đã đăng ký",   value: enrolledCount,       icon: <BookOpen      className="h-5 w-5 text-blue-500"    /> },
    { label: "Bài KT chưa làm",  value: pendingExams,         icon: <Clock         className="h-5 w-5 text-amber-500"   /> },
    { label: "Bài KT đã nộp",    value: doneExams,            icon: <CheckCircle   className="h-5 w-5 text-emerald-500" /> },
    { label: "Điểm TB tích lũy", value: avgScore.toFixed(1),  icon: <BarChart2     className="h-5 w-5 text-purple-500"  /> },
  ];

  /* ---- Render ---- */
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trang Sinh Viên</h1>
          <p className="text-sm text-slate-500">Đăng ký lớp học, làm bài kiểm tra & xem bảng điểm</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-slate-500">{s.label}</CardTitle>
              {s.icon}
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-3xl font-bold text-slate-800">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        {([
          { key: "classes", label: "Đăng Ký Lớp Học", icon: <PlusCircle    className="h-4 w-4" /> },
          { key: "exams",   label: "Bài Kiểm Tra",     icon: <ClipboardList className="h-4 w-4" /> },
          { key: "grades",  label: "Bảng Điểm",        icon: <BarChart2     className="h-4 w-4" /> },
        ] as { key: MainTab; label: string; icon: React.ReactNode }[]).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Tab: Đăng ký lớp học */}
      {activeTab === "classes" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh Sách Lớp Học</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã lớp</TableHead>
                  <TableHead>Tên môn học</TableHead>
                  <TableHead>Giảng viên</TableHead>
                  <TableHead>Lịch học</TableHead>
                  <TableHead>Sĩ số</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.code}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-slate-500">{c.teacher}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{c.schedule}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${c.registered >= c.slots ? "text-red-500" : "text-slate-600"}`}>
                        {c.registered}/{c.slots}
                      </span>
                    </TableCell>
                    <TableCell>
                      {c.enrolled
                        ? <Badge variant="default">Đã đăng ký</Badge>
                        : c.registered >= c.slots
                          ? <Badge variant="destructive">Hết chỗ</Badge>
                          : <Badge variant="secondary">Còn chỗ</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline"
                          onClick={() => { setSelectedClass(c); setShowClassDetail(true); }}>
                          <BookOpen className="mr-1 h-3 w-3" /> Chi tiết
                        </Button>
                        {c.enrolled
                          ? <Button size="sm" variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => handleUnenroll(c.id)}>
                              Hủy đăng ký
                            </Button>
                          : <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
                              disabled={c.registered >= c.slots}
                              onClick={() => handleEnroll(c.id)}>
                              Đăng ký
                            </Button>
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab: Bài kiểm tra */}
      {activeTab === "exams" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh Sách Bài Kiểm Tra</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Môn</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Mở lúc</TableHead>
                  <TableHead className="text-center">Điểm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fakeMyExams.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="text-slate-400">{e.id}</TableCell>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{e.subject}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-slate-600">
                        <Clock className="h-3 w-3" /> {e.duration} phút
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">{e.openAt}</TableCell>
                    <TableCell className="text-center">
                      {e.score !== null
                        ? <span className={`text-lg font-bold ${e.score >= 8 ? "text-emerald-600" : e.score >= 5 ? "text-amber-600" : "text-red-600"}`}>
                            {e.score}
                          </span>
                        : <span className="text-slate-400">—</span>
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={e.status === "Đã nộp" ? "default" : "secondary"}>
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {e.status === "Chưa làm" && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => { setSelectedExam(e); setShowExamDialog(true); }}>
                          <Play className="mr-1 h-3 w-3" /> Làm bài
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab: Bảng điểm */}
      {activeTab === "grades" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bảng Điểm Tổng Hợp</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã MH</TableHead>
                  <TableHead>Tên môn học</TableHead>
                  <TableHead className="text-center">Điểm GK</TableHead>
                  <TableHead className="text-center">Điểm CK</TableHead>
                  <TableHead className="text-center">Điểm TB</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fakeGrades.map(g => (
                  <TableRow key={g.id}>
                    <TableCell className="font-mono text-sm">{g.code}</TableCell>
                    <TableCell className="font-medium">{g.subject}</TableCell>
                    <TableCell className="text-center font-medium text-slate-700">
                      {g.midterm ?? <span className="text-slate-400">—</span>}
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-700">
                      {g.final !== null ? g.final : <span className="text-slate-400">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {g.avg !== null
                        ? <span className={`text-lg font-bold ${g.avg >= 8 ? "text-emerald-600" : g.avg >= 5 ? "text-amber-600" : "text-red-600"}`}>
                            {g.avg}
                          </span>
                        : <span className="text-slate-400">—</span>
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={g.status === "Hoàn thành" ? "default" : "secondary"}>
                        {g.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog: Chi tiết lớp học */}
      <Dialog open={showClassDetail} onOpenChange={setShowClassDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Chi Tiết Lớp Học</DialogTitle></DialogHeader>
          {selectedClass && (
            <div className="space-y-2 py-2 text-sm">
              {[
                ["Mã lớp",     selectedClass.code],
                ["Tên môn",    selectedClass.name],
                ["Giảng viên", selectedClass.teacher],
                ["Lịch học",   selectedClass.schedule],
                ["Sĩ số",      `${selectedClass.registered}/${selectedClass.slots}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowClassDetail(false)}>Đóng</Button>
            {selectedClass && !selectedClass.enrolled && selectedClass.registered < selectedClass.slots && (
              <Button className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleEnroll(selectedClass.id)}>
                Đăng ký lớp này
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Xác nhận làm bài */}
      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Xác Nhận Làm Bài</DialogTitle></DialogHeader>
          {selectedExam && (
            <div className="space-y-3 py-2">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <p className="font-semibold text-amber-800 mb-2">⚠️ Lưu ý trước khi làm bài</p>
                <ul className="space-y-1 text-amber-700 text-xs list-disc list-inside">
                  <li>Thời gian làm bài: <strong>{selectedExam.duration} phút</strong></li>
                  <li>Bài thi sẽ tự động nộp khi hết giờ</li>
                  <li>Không được rời khỏi trang trong khi làm bài</li>
                </ul>
              </div>
              <p className="text-sm text-slate-600">
                Bạn có chắc muốn bắt đầu: <strong>{selectedExam.title}</strong>?
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExamDialog(false)}>Hủy</Button>
            <Button className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowExamDialog(false)}>
              <Play className="mr-1 h-4 w-4" /> Bắt đầu làm bài
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
