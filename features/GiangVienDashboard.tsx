"use client";

import { useState, useEffect, useCallback } from "react";
import { Course, Exam, ExamResult } from "@prisma/client";
import { createCourse, deleteCourse, updateCourseStatus } from "@/app/actions/course-actions";
import { getExams, createExam, updateExamStatus, getExamResults } from "@/app/actions/exam-actions";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ClipboardList, BarChart2 } from "lucide-react";

type MainTab = "lessons" | "exams" | "results";

export default function GiangVienDashboard({ initialCourses = [] }: { initialCourses?: Course[] }) {
  const [lessons, setLessons] = useState<Course[]>(initialCourses);
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [activeTab, setActiveTab] = useState<MainTab>("lessons");


  // Load dữ liệu bài thi từ DB
  const loadExamData = useCallback(async () => {
    try {
      const dbExams = await getExams();
      const dbResults = await getExamResults();
      setExams(dbExams);
      setResults(dbResults);
    } catch (error) {
      console.error("Lỗi nạp dữ liệu bài thi:", error);
    }
  }, []);

  useEffect(() => {
    const initFetch = async () => {
      await loadExamData();
    };
    initFetch();
  }, [loadExamData]);

  // --- Handlers Bài Giảng (CRUD) ---
  const handlePublishLesson = async (id: number) => {
    await updateCourseStatus(id, "Đã công bố");
    const updated = await createCourse({ title: "", subject: "" }); // Logic fetch lại hoặc refetch
    // Để đơn giản và chính xác, bạn nên có hàm fetchCourses riêng
    window.location.reload(); 
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm("Xóa bài giảng này?")) return;
    await deleteCourse(id);
    setLessons(lessons.filter(l => l.id !== id));
  };

  // --- Handlers Bài Kiểm Tra ---
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [examForm, setExamForm] = useState({ title: "", subject: "", duration: "", questions: "", openAt: "" });

  const handleSaveExam = async () => {
    if (!examForm.title) return;
    await createExam({
      title: examForm.title,
      subject: examForm.subject,
      duration: parseInt(examForm.duration) || 60,
      questions: parseInt(examForm.questions) || 10,
      openAt: examForm.openAt
    });
    await loadExamData();
    setShowExamDialog(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8 flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trang Giảng Viên</h1>
          <p className="text-sm text-slate-500">Quản lý bài giảng & bài kiểm tra từ Database</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        {[
          { key: "lessons", label: "Quản Lý Bài Giảng", icon: <BookOpen className="h-4 w-4" /> },
          { key: "exams", label: "Quản Lý Bài Kiểm Tra", icon: <ClipboardList className="h-4 w-4" /> },
          { key: "results", label: "Kết Quả Sinh Viên", icon: <BarChart2 className="h-4 w-4" /> },
        ].map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key as MainTab)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${activeTab === t.key ? "bg-purple-600 text-white" : "bg-white border"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Tab Nội dung */}
      {activeTab === "lessons" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh Sách Bài Giảng</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.title}</TableCell>
                    <TableCell>{l.subject}</TableCell>
                    <TableCell><Badge>{l.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="mr-2" onClick={() => handlePublishLesson(l.id)}>Công bố</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteLesson(l.id)}>Xóa</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab Bài Thi */}
      {activeTab === "exams" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Bài Kiểm Tra</CardTitle>
            <Button size="sm" onClick={() => setShowExamDialog(true)}>Tạo bài thi</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{e.title}</TableCell>
                    <TableCell>{e.duration} phút</TableCell>
                    <TableCell><Badge>{e.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog tạo bài thi */}
      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tạo bài thi mới</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="Tiêu đề bài thi" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} />
            <Input placeholder="Môn học" value={examForm.subject} onChange={e => setExamForm({...examForm, subject: e.target.value})} />
            <Input type="number" placeholder="Thời gian (phút)" value={examForm.duration} onChange={e => setExamForm({...examForm, duration: e.target.value})} />
          </div>
          <DialogFooter>
            <Button onClick={handleSaveExam}>Lưu bài thi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}