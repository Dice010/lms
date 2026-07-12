"use client";

import { useState, useEffect } from "react";
import { Course } from "@prisma/client";
import { createCourse, deleteCourse, updateCourseStatus } from "@/app/actions/course-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  PlusCircle,
  Pencil,
  Trash2,
  Send,
  ClipboardList,
  Clock,
  BarChart2,
  ArrowLeft,
} from "lucide-react";

// ------------------------------------
// Type cho cấu trúc nội dung Bài Giảng & UI
// ------------------------------------
type SubSection = { id: string; title: string; content: string };
type MajorSection = { id: string; title: string; subItems: SubSection[] };

// Dùng Type từ Prisma Database
type Lesson = Course & {
  content?: MajorSection[]; // Bổ sung optional content cho UI thao tác
};

// ------------------------------------
// Mock Data — Bài kiểm tra & Kết quả (Giữ nguyên của Trí để show UI)
// ------------------------------------
const fakeExams = [
  { id: 1, title: "Kiểm tra giữa kỳ OOP", subject: "Lập trình Java", duration: 60, questions: 30, openAt: "2025-06-15 08:00", status: "Đã công bố" },
  { id: 2, title: "Quiz chương 3 - Design", subject: "Lập trình Java", duration: 20, questions: 10, openAt: "2025-06-20 10:00", status: "Bản nháp" },
  { id: 3, title: "Kiểm tra cuối kỳ CTDL", subject: "CTDL & GT", duration: 90, questions: 40, openAt: "2025-07-01 07:30", status: "Bản nháp" },
];

const fakeResults = [
  { id: 1, examTitle: "Kiểm tra giữa kỳ OOP", student: "Nguyễn Thị Mai", score: 8.5, submittedAt: "2025-06-15 09:00" },
  { id: 2, examTitle: "Kiểm tra giữa kỳ OOP", student: "Trần Văn Hùng", score: 7.0, submittedAt: "2025-06-15 09:45" },
  { id: 3, examTitle: "Kiểm tra giữa kỳ OOP", student: "Lê Quốc Bảo", score: 9.0, submittedAt: "2025-06-15 08:50" },
];

type Exam = (typeof fakeExams)[0];
type Result = (typeof fakeResults)[0];
type MainTab = "lessons" | "exams" | "results";

interface QuestionItem {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: "A" | "B" | "C" | "D";
}

// ------------------------------------
// Helpers
// ------------------------------------
function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "Đã công bố" ? "default" : "secondary"}>
      {status}
    </Badge>
  );
}

const toRoman = (num: number) => {
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return roman[num] || (num + 1).toString();
};

// ============================================================================
// COMPONENT CHÍNH
// ============================================================================
export default function GiangVienDashboard({ initialCourses = [] }: { initialCourses?: Course[] }) {
  // 🚀 DỮ LIỆU THẬT: Nhận courses từ DB
  const [lessons, setLessons] = useState<Lesson[]>(initialCourses);

  const [currentView, setCurrentView] = useState<"dashboard" | "lesson_editor">("dashboard");
  const [exams, setExams] = useState<Exam[]>(fakeExams);
  const [activeTab, setActiveTab] = useState<MainTab>("lessons");
  const [results, setResults] = useState<Result[]>(fakeResults);

  // ------------------------------------
  // States cho Form Bài Giảng
  // ------------------------------------
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", subject: "" });
  const [lessonSections, setLessonSections] = useState<MajorSection[]>([]);

  // ------------------------------------
  // States cho Form Bài Kiểm Tra
  // ------------------------------------
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [examForm, setExamForm] = useState({ title: "", subject: "", duration: "", questions: "", openAt: "" });

  const emptyQuestion = (): QuestionItem => ({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", answer: "A" });
  const [questionList, setQuestionList] = useState<QuestionItem[]>([emptyQuestion()]);

  const addQuestion = () => setQuestionList([...questionList, emptyQuestion()]);
  const removeQuestion = (idx: number) => setQuestionList(questionList.filter((_, i) => i !== idx));
  const updateQuestion = (idx: number, field: keyof QuestionItem, value: string) => {
    setQuestionList(questionList.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  };

  // ============================================================================
  // DATABASE ACTIONS: BÀI GIẢNG (KẾT NỐI API THẬT)
  // ============================================================================
  const openAddLesson = () => {
    setEditLesson(null);
    setLessonForm({ title: "", subject: "" });
    setLessonSections([]);
    setCurrentView("lesson_editor");
  };

  const openEditLesson = (l: Lesson) => {
    setEditLesson(l);
    setLessonForm({ title: l.title, subject: l.subject });
    setLessonSections(l.content || []);
    setCurrentView("lesson_editor");
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title || !lessonForm.subject) return;

    try {
      if (editLesson) {
        // UI MOCK: Sửa trên giao diện tạm thời (Chưa có API Update môn)
        setLessons(lessons.map((l) => l.id === editLesson.id ? { ...l, ...lessonForm, content: lessonSections } : l));
      } else {
        // 🚀 DATABASE THẬT: Thêm môn học
        const newCourse = await createCourse({
          title: lessonForm.title,
          subject: lessonForm.subject,
        });

        setLessons([...lessons, { ...newCourse, content: lessonSections }]);
      }
      setCurrentView("dashboard");
    } catch (error) {
      console.error("Lỗi khi lưu vào Database:", error);
      alert("Lỗi khi lưu vào Database!");
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài giảng này?")) return;
    try {
      await deleteCourse(id); // 🚀 DATABASE THẬT: Xóa
      setLessons(lessons.filter(l => l.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Xóa thất bại!");
    }
  };

  const handlePublishLesson = async (id: number) => {
    try {
      await updateCourseStatus(id, "Đã công bố"); // 🚀 DATABASE THẬT: Công bố
      setLessons(lessons.map((l) => (l.id === id ? { ...l, status: "Đã công bố" } : l)));
    } catch (error) {
      console.error("Lỗi khi công bố:", error);
      alert("Lỗi khi công bố bài giảng!");
    }
  };

  // --- Logic thêm/xóa/sửa cấu trúc bài học UI ---
  const addMajorSection = () => setLessonSections([...lessonSections, { id: Date.now().toString(), title: "", subItems: [] }]);
  const removeMajorSection = (idx: number) => setLessonSections(lessonSections.filter((_, i) => i !== idx));
  const updateMajorSectionTitle = (idx: number, title: string) => {
    const newSecs = [...lessonSections];
    newSecs[idx].title = title;
    setLessonSections(newSecs);
  };
  const addSubSection = (majorIdx: number) => {
    const newSecs = [...lessonSections];
    newSecs[majorIdx].subItems.push({ id: Date.now().toString(), title: "", content: "" });
    setLessonSections(newSecs);
  };
  const removeSubSection = (majorIdx: number, subIdx: number) => {
    const newSecs = [...lessonSections];
    newSecs[majorIdx].subItems = newSecs[majorIdx].subItems.filter((_, i) => i !== subIdx);
    setLessonSections(newSecs);
  };
  const updateSubSection = (majorIdx: number, subIdx: number, field: "title" | "content", value: string) => {
    const newSecs = [...lessonSections];
    newSecs[majorIdx].subItems[subIdx][field] = value;
    setLessonSections(newSecs);
  };

  // ============================================================================
  // MOCK ACTIONS: BÀI KIỂM TRA (UI)
  // ============================================================================
  const openAddExam = () => {
    setEditExam(null);
    setExamForm({ title: "", subject: "", duration: "", questions: "", openAt: "" });
    setQuestionList([emptyQuestion()]);
    setShowExamDialog(true);
  };

  const openEditExam = (e: Exam) => {
    setEditExam(e);
    setExamForm({ title: e.title, subject: e.subject, duration: String(e.duration), questions: String(e.questions), openAt: e.openAt });
    setQuestionList([emptyQuestion()]);
    setShowExamDialog(true);
  };

  const handleSaveExam = () => {
    if (!examForm.title || !examForm.subject) return;
    if (editExam) {
      setExams(exams.map((e) => e.id === editExam.id ? { ...e, title: examForm.title, subject: examForm.subject, duration: Number(examForm.duration), questions: Number(examForm.questions), openAt: examForm.openAt } : e));
    } else {
      setExams([...exams, { id: exams.length + 1, title: examForm.title, subject: examForm.subject, duration: Number(examForm.duration), questions: Number(examForm.questions), openAt: examForm.openAt, status: "Bản nháp" }]);
    }
    setShowExamDialog(false);
  };

  const handlePublishExam = (id: number) => setExams(exams.map((e) => (e.id === id ? { ...e, status: "Đã công bố" } : e)));
  const handleDeleteExam = (id: number) => setExams(exams.filter((e) => e.id !== id));

  // ---- Stats ----
  const stats = [
    { label: "Tổng bài giảng", value: lessons.length, icon: <BookOpen className="h-5 w-5 text-purple-500" /> },
    { label: "Đã công bố", value: lessons.filter((l) => l.status === "Đã công bố").length, icon: <Send className="h-5 w-5 text-emerald-500" /> },
    { label: "Tổng bài kiểm tra", value: exams.length, icon: <ClipboardList className="h-5 w-5 text-blue-500" /> },
    { label: "Kết quả đã chấm", value: results.length, icon: <BarChart2 className="h-5 w-5 text-amber-500" /> },
  ];

  // ============================================================================
  // RENDER MÀN HÌNH SOẠN BÀI (FULL PAGE EDITOR)
  // ============================================================================
  if (currentView === "lesson_editor") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-slate-500 hover:text-slate-800" onClick={() => setCurrentView("dashboard")}>
                <ArrowLeft className="h-5 w-5 mr-2" /> Quay lại
              </Button>
              <div className="h-6 w-px bg-slate-200"></div>
              <h1 className="text-xl font-bold text-slate-800">{editLesson ? "Chỉnh Sửa Bài Giảng" : "Tạo Bài Học Mới"}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setCurrentView("dashboard")}>Hủy</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" disabled={!lessonForm.title || !lessonForm.subject} onClick={handleSaveLesson}>
                {editLesson ? "Lưu thay đổi" : "Lưu bài học"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base">Tiêu đề bài học <span className="text-red-500">*</span></Label>
                <Input placeholder="VD: Giới thiệu về OOP" className="h-12 text-base" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Môn học <span className="text-red-500">*</span></Label>
                <Input placeholder="VD: Lập trình Java" className="h-12 text-base" value={lessonForm.subject} onChange={(e) => setLessonForm({ ...lessonForm, subject: e.target.value })} />
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Nội dung chi tiết</h3>
                  <p className="text-sm text-slate-500">Soạn thảo cấu trúc bài giảng của bạn bên dưới.</p>
                </div>
                <Button className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200" onClick={addMajorSection}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Thêm phần lớn (I, II, III)
                </Button>
              </div>

              {lessonSections.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-500">Chưa có nội dung nào.</p>
                  <p className="text-sm text-slate-400">Hãy nhấn &quot;Thêm phần lớn&quot; để bắt đầu soạn bài.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {lessonSections.map((majorSec, mIdx) => (
                    <div key={majorSec.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm">
                      <div className="mb-6 flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-black text-lg">
                          {toRoman(mIdx)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <Input placeholder="Tiêu đề phần (VD: Khái niệm cơ bản)" className="font-bold text-lg h-12 bg-white" value={majorSec.title} onChange={(e) => updateMajorSectionTitle(mIdx, e.target.value)} />
                        </div>
                        <Button variant="ghost" size="icon" className="h-12 w-12 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => removeMajorSection(mIdx)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="ml-16 space-y-4">
                        {majorSec.subItems.map((subItem, sIdx) => (
                          <div key={subItem.id} className="relative rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="absolute right-3 top-3">
                              <Button variant="ghost" size="sm" className="h-8 text-red-400 hover:text-red-600 px-3" onClick={() => removeSubSection(mIdx, sIdx)}>Xóa mục này</Button>
                            </div>
                            <div className="space-y-4 pr-24">
                              <div className="flex items-center gap-3">
                                <span className="text-base font-bold text-slate-400">{sIdx + 1}.</span>
                                <Input placeholder="Tiêu đề mục nhỏ" className="h-10 text-base font-medium" value={subItem.title} onChange={(e) => updateSubSection(mIdx, sIdx, "title", e.target.value)} />
                              </div>
                              <Textarea placeholder="Soạn nội dung chi tiết cho mục này..." className="min-h-37.5 text-base p-4 resize-y leading-relaxed" value={subItem.content} onChange={(e) => updateSubSection(mIdx, sIdx, "content", e.target.value)} />
                            </div>
                          </div>
                        ))}
                        <div className="pt-2">
                          <Button size="sm" variant="ghost" className="text-slate-600 hover:text-purple-700 hover:bg-purple-100 text-sm font-medium" onClick={() => addSubSection(mIdx)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Thêm mục nhỏ
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER MÀN HÌNH DASHBOARD (GIAO DIỆN CHÍNH)
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8 flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trang Giảng Viên</h1>
          <p className="text-sm text-slate-500">Quản lý bài giảng & bài kiểm tra</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
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

      <div className="mb-4 flex gap-2">
        {(
          [
            { key: "lessons", label: "Quản Lý Bài Giảng", icon: <BookOpen className="h-4 w-4" /> },
            { key: "exams", label: "Quản Lý Bài Kiểm Tra", icon: <ClipboardList className="h-4 w-4" /> },
            { key: "results", label: "Kết Quả Sinh Viên", icon: <BarChart2 className="h-4 w-4" /> },
          ] as { key: MainTab; label: string; icon: React.ReactNode }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key ? "bg-purple-600 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "lessons" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh Sách Bài Giảng (DB Thật)</CardTitle>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={openAddLesson}>
              <PlusCircle className="mr-1 h-4 w-4" /> Tạo bài học mới
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#ID</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-slate-500">Chưa có bài giảng nào được tạo.</TableCell>
                  </TableRow>
                ) : (
                  lessons.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-slate-400">{l.id}</TableCell>
                      <TableCell className="font-medium">{l.title}</TableCell>
                      <TableCell className="text-slate-500">{l.subject}</TableCell>
                      <TableCell className="text-slate-400 text-sm">{l.uploadedAt}</TableCell>
                      <TableCell><StatusBadge status={l.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {l.status === "Bản nháp" && (
                            <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300 hover:bg-emerald-50" onClick={() => handlePublishLesson(l.id)}>
                              <Send className="mr-1 h-3 w-3" /> Công bố
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => openEditLesson(l)}>
                            <Pencil className="mr-1 h-3 w-3" /> Sửa
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleDeleteLesson(l.id)}>
                            <Trash2 className="mr-1 h-3 w-3" /> Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "exams" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh Sách Bài Kiểm Tra (UI Mock)</CardTitle>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={openAddExam}>
              <PlusCircle className="mr-1 h-4 w-4" /> Tạo bài kiểm tra
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Mở lúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell className="text-slate-500">{e.subject}</TableCell>
                    <TableCell><span className="flex items-center gap-1 text-sm text-slate-600"><Clock className="h-3 w-3" /> {e.duration} phút</span></TableCell>
                    <TableCell className="text-slate-400 text-sm">{e.openAt}</TableCell>
                    <TableCell><StatusBadge status={e.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {e.status === "Bản nháp" && (
                          <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300 hover:bg-emerald-50" onClick={() => handlePublishExam(e.id)}>
                            <Send className="mr-1 h-3 w-3" /> Công bố
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openEditExam(e)}><Pencil className="mr-1 h-3 w-3" /> Sửa</Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleDeleteExam(e.id)}><Trash2 className="mr-1 h-3 w-3" /> Xóa</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "results" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Kết Quả Bài Kiểm Tra (UI Mock)</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bài kiểm tra</TableHead>
                  <TableHead>Sinh viên</TableHead>
                  <TableHead className="text-center">Điểm</TableHead>
                  <TableHead>Nộp lúc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.examTitle}</TableCell>
                    <TableCell className="text-slate-600">{r.student}</TableCell>
                    <TableCell className="text-center">
                      <span className={`text-lg font-bold ${r.score >= 8 ? "text-emerald-600" : r.score >= 5 ? "text-amber-600" : "text-red-600"}`}>{r.score}</span>
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

      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editExam ? "Chỉnh Sửa Bài Kiểm Tra" : "Tạo Bài Kiểm Tra Mới"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1"><Label>Tiêu đề</Label><Input placeholder="VD: Kiểm tra giữa kỳ" value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} /></div>
            <div className="space-y-1"><Label>Môn học</Label><Input placeholder="VD: Lập trình Java" value={examForm.subject} onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Thời gian (phút)</Label><Input type="number" placeholder="60" value={examForm.duration} onChange={(e) => setExamForm({ ...examForm, duration: e.target.value })} /></div>
              <div className="space-y-1"><Label>Số câu hỏi</Label><Input type="number" placeholder="30" value={examForm.questions} onChange={(e) => setExamForm({ ...examForm, questions: e.target.value })} /></div>
            </div>
            <div className="space-y-1"><Label>Thời gian mở đề</Label><Input placeholder="VD: 2025-07-01 08:00" value={examForm.openAt} onChange={(e) => setExamForm({ ...examForm, openAt: e.target.value })} /></div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700">Câu hỏi & Đáp án</Label>
                <Button type="button" size="sm" variant="outline" className="text-purple-600 border-purple-300 hover:bg-purple-50" onClick={addQuestion}><PlusCircle className="mr-1 h-3 w-3" /> Thêm câu</Button>
              </div>
              <div className="space-y-4">
                {questionList.map((q, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-600">Câu {idx + 1}</span>
                      {questionList.length > 1 && <button onClick={() => removeQuestion(idx)} className="text-red-400 hover:text-red-600 text-xs">✕ Xóa</button>}
                    </div>
                    <Textarea placeholder={`Nội dung câu hỏi ${idx + 1}...`} rows={2} value={q.question} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateQuestion(idx, "question", e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      {(["A", "B", "C", "D"] as const).map((opt) => (
                        <div key={opt} className="flex items-center gap-1">
                          <span className={`text-xs font-bold w-5 ${q.answer === opt ? "text-emerald-600" : "text-slate-400"}`}>{opt}.</span>
                          <Input placeholder={`Đáp án ${opt}`} className="text-xs h-8" value={q[`option${opt}` as keyof QuestionItem] as string} onChange={(e) => updateQuestion(idx, `option${opt}` as keyof QuestionItem, e.target.value)} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Đáp án đúng:</span>
                      {(["A", "B", "C", "D"] as const).map((opt) => (
                        <button key={opt} type="button" onClick={() => updateQuestion(idx, "answer", opt)} className={`rounded px-2 py-0.5 text-xs font-bold transition-colors ${q.answer === opt ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExamDialog(false)}>Hủy</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" disabled={!examForm.title || !examForm.subject} onClick={handleSaveExam}>{editExam ? "Lưu thay đổi" : "Tạo bài kiểm tra"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}