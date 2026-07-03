"use client";

import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button }   from "@/components/ui/button";
import { Badge }    from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen, PlusCircle, Pencil, Trash2, Send,
  ClipboardList, Clock, BarChart2, Upload,
} from "lucide-react";

// ------------------------------------
// Mock Data — Bài giảng
// ------------------------------------
const fakeLessons = [
  { id: 1, title: "Giới thiệu về Lập trình OOP",  subject: "Lập trình Java", type: "Video", uploadedAt: "2025-06-01", status: "Đã công bố" },
  { id: 2, title: "Kế thừa và Đa hình",            subject: "Lập trình Java", type: "PDF",   uploadedAt: "2025-06-05", status: "Đã công bố" },
  { id: 3, title: "Design Pattern - Singleton",     subject: "Lập trình Java", type: "PPT",   uploadedAt: "2025-06-10", status: "Bản nháp"   },
  { id: 4, title: "Cấu trúc dữ liệu Stack",         subject: "CTDL & GT",      type: "Video", uploadedAt: "2025-05-20", status: "Đã công bố" },
  { id: 5, title: "Thuật toán sắp xếp",             subject: "CTDL & GT",      type: "PDF",   uploadedAt: "2025-05-25", status: "Bản nháp"   },
];

// ------------------------------------
// Mock Data — Bài kiểm tra
// ------------------------------------
const fakeExams = [
  { id: 1, title: "Kiểm tra giữa kỳ OOP",   subject: "Lập trình Java", duration: 60, questions: 30, openAt: "2025-06-15 08:00", status: "Đã công bố" },
  { id: 2, title: "Quiz chương 3 - Design",  subject: "Lập trình Java", duration: 20, questions: 10, openAt: "2025-06-20 10:00", status: "Bản nháp"   },
  { id: 3, title: "Kiểm tra cuối kỳ CTDL",  subject: "CTDL & GT",      duration: 90, questions: 40, openAt: "2025-07-01 07:30", status: "Bản nháp"   },
  { id: 4, title: "Quiz Stack & Queue",       subject: "CTDL & GT",      duration: 15, questions: 8,  openAt: "2025-06-25 14:00", status: "Đã công bố" },
];

// ------------------------------------
// Mock Data — Kết quả sinh viên
// ------------------------------------
const fakeResults = [
  { id: 1, examTitle: "Kiểm tra giữa kỳ OOP", student: "Nguyễn Thị Mai",  score: 8.5, submittedAt: "2025-06-15 09:00" },
  { id: 2, examTitle: "Kiểm tra giữa kỳ OOP", student: "Trần Văn Hùng",   score: 7.0, submittedAt: "2025-06-15 09:45" },
  { id: 3, examTitle: "Kiểm tra giữa kỳ OOP", student: "Lê Quốc Bảo",     score: 9.0, submittedAt: "2025-06-15 08:50" },
  { id: 4, examTitle: "Quiz Stack & Queue",    student: "Nguyễn Thị Mai",  score: 10,  submittedAt: "2025-06-25 14:12" },
  { id: 5, examTitle: "Quiz Stack & Queue",    student: "Phạm Thị Lan",    score: 6.5, submittedAt: "2025-06-25 14:30" },
];

type Lesson  = (typeof fakeLessons)[0];
type Exam    = (typeof fakeExams)[0];
type MainTab = "lessons" | "exams" | "results";

// ------------------------------------
// Helpers
// ------------------------------------
function StatusBadge({ status }: { status: string }) {
  return <Badge variant={status === "Đã công bố" ? "default" : "secondary"}>{status}</Badge>;
}

// ------------------------------------
// Main Component
// ------------------------------------
export default function GiangVienDashboard() {
  const [lessons, setLessons]     = useState<Lesson[]>(fakeLessons);
  const [exams, setExams]         = useState<Exam[]>(fakeExams);
  const [activeTab, setActiveTab] = useState<MainTab>("lessons");

  // Lesson dialog
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [editLesson, setEditLesson]             = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm]             = useState({ title: "", subject: "", type: "PDF" });

  // Exam dialog
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [editExam, setEditExam]             = useState<Exam | null>(null);
  const [examForm, setExamForm]             = useState({ title: "", subject: "", duration: "", questions: "", openAt: "" });

  /* ---- Handlers: Bài giảng ---- */
  const openAddLesson = () => {
    setEditLesson(null);
    setLessonForm({ title: "", subject: "", type: "PDF" });
    setShowLessonDialog(true);
  };
  const openEditLesson = (l: Lesson) => {
    setEditLesson(l);
    setLessonForm({ title: l.title, subject: l.subject, type: l.type });
    setShowLessonDialog(true);
  };
  const handleSaveLesson = () => {
    if (!lessonForm.title || !lessonForm.subject) return;
    if (editLesson) {
      setLessons(lessons.map(l => l.id === editLesson.id ? { ...l, ...lessonForm } : l));
    } else {
      setLessons([...lessons, {
        id: lessons.length + 1, ...lessonForm,
        uploadedAt: new Date().toISOString().slice(0, 10),
        status: "Bản nháp",
      }]);
    }
    setShowLessonDialog(false);
  };
  const handleDeleteLesson   = (id: number) => setLessons(lessons.filter(l => l.id !== id));
  const handlePublishLesson  = (id: number) => setLessons(lessons.map(l => l.id === id ? { ...l, status: "Đã công bố" } : l));

  /* ---- Handlers: Bài kiểm tra ---- */
  const openAddExam = () => {
    setEditExam(null);
    setExamForm({ title: "", subject: "", duration: "", questions: "", openAt: "" });
    setShowExamDialog(true);
  };
  const openEditExam = (e: Exam) => {
    setEditExam(e);
    setExamForm({ title: e.title, subject: e.subject, duration: String(e.duration), questions: String(e.questions), openAt: e.openAt });
    setShowExamDialog(true);
  };
  const handleSaveExam = () => {
    if (!examForm.title || !examForm.subject) return;
    if (editExam) {
      setExams(exams.map(e => e.id === editExam.id
        ? { ...e, title: examForm.title, subject: examForm.subject, duration: Number(examForm.duration), questions: Number(examForm.questions), openAt: examForm.openAt }
        : e));
    } else {
      setExams([...exams, {
        id: exams.length + 1,
        title: examForm.title, subject: examForm.subject,
        duration: Number(examForm.duration), questions: Number(examForm.questions),
        openAt: examForm.openAt, status: "Bản nháp",
      }]);
    }
    setShowExamDialog(false);
  };
  const handlePublishExam  = (id: number) => setExams(exams.map(e => e.id === id ? { ...e, status: "Đã công bố" } : e));
  const handleDeleteExam   = (id: number) => setExams(exams.filter(e => e.id !== id));

  /* ---- Stats ---- */
  const stats = [
    { label: "Tổng bài giảng",    value: lessons.length,                                        icon: <BookOpen      className="h-5 w-5 text-purple-500" /> },
    { label: "Đã công bố",        value: lessons.filter(l => l.status === "Đã công bố").length,  icon: <Send          className="h-5 w-5 text-emerald-500" /> },
    { label: "Tổng bài kiểm tra", value: exams.length,                                           icon: <ClipboardList className="h-5 w-5 text-blue-500"   /> },
    { label: "Kết quả đã chấm",   value: fakeResults.length,                                     icon: <BarChart2     className="h-5 w-5 text-amber-500"  /> },
  ];

  /* ---- Render ---- */
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trang Giảng Viên</h1>
          <p className="text-sm text-slate-500">Quản lý bài giảng & bài kiểm tra</p>
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
          { key: "lessons", label: "Quản Lý Bài Giảng",    icon: <BookOpen      className="h-4 w-4" /> },
          { key: "exams",   label: "Quản Lý Bài Kiểm Tra", icon: <ClipboardList className="h-4 w-4" /> },
          { key: "results", label: "Kết Quả Sinh Viên",     icon: <BarChart2     className="h-4 w-4" /> },
        ] as { key: MainTab; label: string; icon: React.ReactNode }[]).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "bg-purple-600 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Tab: Quản lý bài giảng */}
      {activeTab === "lessons" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh Sách Bài Giảng</CardTitle>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={openAddLesson}>
              <PlusCircle className="mr-1 h-4 w-4" /> Tạo bài học mới
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Ngày tải</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="text-slate-400">{l.id}</TableCell>
                    <TableCell className="font-medium">{l.title}</TableCell>
                    <TableCell className="text-slate-500">{l.subject}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {l.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">{l.uploadedAt}</TableCell>
                    <TableCell><StatusBadge status={l.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {l.status === "Bản nháp" && (
                          <Button size="sm" variant="outline"
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            onClick={() => handlePublishLesson(l.id)}>
                            <Send className="mr-1 h-3 w-3" /> Công bố
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openEditLesson(l)}>
                          <Pencil className="mr-1 h-3 w-3" /> Sửa
                        </Button>
                        <Button size="sm" variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleDeleteLesson(l.id)}>
                          <Trash2 className="mr-1 h-3 w-3" /> Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab: Quản lý bài kiểm tra */}
      {activeTab === "exams" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh Sách Bài Kiểm Tra</CardTitle>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={openAddExam}>
              <PlusCircle className="mr-1 h-4 w-4" /> Tạo bài kiểm tra
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Số câu</TableHead>
                  <TableHead>Mở lúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="text-slate-400">{e.id}</TableCell>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell className="text-slate-500">{e.subject}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-slate-600">
                        <Clock className="h-3 w-3" /> {e.duration} phút
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">{e.questions} câu</TableCell>
                    <TableCell className="text-slate-400 text-sm">{e.openAt}</TableCell>
                    <TableCell><StatusBadge status={e.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {e.status === "Bản nháp" && (
                          <Button size="sm" variant="outline"
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            onClick={() => handlePublishExam(e.id)}>
                            <Send className="mr-1 h-3 w-3" /> Công bố
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openEditExam(e)}>
                          <Pencil className="mr-1 h-3 w-3" /> Sửa
                        </Button>
                        <Button size="sm" variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleDeleteExam(e.id)}>
                          <Trash2 className="mr-1 h-3 w-3" /> Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab: Kết quả sinh viên */}
      {activeTab === "results" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kết Quả Bài Kiểm Tra</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Bài kiểm tra</TableHead>
                  <TableHead>Sinh viên</TableHead>
                  <TableHead className="text-center">Điểm</TableHead>
                  <TableHead>Nộp lúc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fakeResults.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-slate-400">{r.id}</TableCell>
                    <TableCell className="font-medium">{r.examTitle}</TableCell>
                    <TableCell className="text-slate-600">{r.student}</TableCell>
                    <TableCell className="text-center">
                      <span className={`text-lg font-bold ${
                        r.score >= 8 ? "text-emerald-600" : r.score >= 5 ? "text-amber-600" : "text-red-600"
                      }`}>{r.score}</span>
                      <span className="text-slate-400 text-xs"> /10</span>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">{r.submittedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog: Tạo/Sửa bài giảng */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editLesson ? "Chỉnh Sửa Bài Giảng" : "Tạo Bài Học Mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Tiêu đề bài học</Label>
              <Input placeholder="VD: Giới thiệu về OOP"
                value={lessonForm.title}
                onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Môn học</Label>
              <Input placeholder="VD: Lập trình Java"
                value={lessonForm.subject}
                onChange={e => setLessonForm({ ...lessonForm, subject: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Loại tài liệu</Label>
              <select value={lessonForm.type}
                onChange={e => setLessonForm({ ...lessonForm, type: e.target.value })}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                <option>PDF</option>
                <option>Video</option>
                <option>PPT</option>
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 p-4 text-slate-400">
              <Upload className="h-5 w-5" />
              <span className="text-sm">Nhấn để tải file lên (PDF, Video, PPT)</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLessonDialog(false)}>Hủy</Button>
            <Button className="bg-purple-600 hover:bg-purple-700"
              disabled={!lessonForm.title || !lessonForm.subject}
              onClick={handleSaveLesson}>
              {editLesson ? "Lưu thay đổi" : "Tạo bài học"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Tạo/Sửa bài kiểm tra */}
      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editExam ? "Chỉnh Sửa Bài Kiểm Tra" : "Tạo Bài Kiểm Tra Mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Tiêu đề</Label>
              <Input placeholder="VD: Kiểm tra giữa kỳ"
                value={examForm.title}
                onChange={e => setExamForm({ ...examForm, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Môn học</Label>
              <Input placeholder="VD: Lập trình Java"
                value={examForm.subject}
                onChange={e => setExamForm({ ...examForm, subject: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Thời gian (phút)</Label>
                <Input type="number" placeholder="60"
                  value={examForm.duration}
                  onChange={e => setExamForm({ ...examForm, duration: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Số câu hỏi</Label>
                <Input type="number" placeholder="30"
                  value={examForm.questions}
                  onChange={e => setExamForm({ ...examForm, questions: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Thời gian mở đề</Label>
              <Input placeholder="VD: 2025-07-01 08:00"
                value={examForm.openAt}
                onChange={e => setExamForm({ ...examForm, openAt: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExamDialog(false)}>Hủy</Button>
            <Button className="bg-purple-600 hover:bg-purple-700"
              disabled={!examForm.title || !examForm.subject}
              onClick={handleSaveExam}>
              {editExam ? "Lưu thay đổi" : "Tạo bài kiểm tra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
