"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Users, BookOpen, UserPlus, Check, X, Clock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Lấy Server Actions kết nối hạ tầng DB thực tế
import { getCourses, createCourse, updateCourseStatus } from "@/app/actions/course-actions";
import { getUsers } from "@/app/actions/user-actions";
import { Course } from "@prisma/client";

interface AcademicManagementProps {
  currentRole?: string;
}

interface ClassInfo {
  id: string;
  name: string;
  major: string;
  studentCount: number;
  maxCapacity: number;
}

type UICourse = Course & { assignedTeacher?: string | null };

// Giữ lại khung Mock cho Lớp học (Do Schema ưu tiên phẳng hóa nghiệp vụ Môn học & Bài kiểm tra trọn vẹn trước)
const initialClasses: ClassInfo[] = [
  { id: "CLS001", name: "SE2026_A", major: "Kỹ thuật phần mềm", studentCount: 35, maxCapacity: 40 },
  { id: "CLS002", name: "CS2026_B", major: "Khoa học máy tính", studentCount: 40, maxCapacity: 40 },
  { id: "CLS003", name: "AI2026_C", major: "Trí tuệ nhân tạo", studentCount: 28, maxCapacity: 35 },
];

export default function AcademicManagement({ currentRole = "PHONG_DAO_TAO" }: AcademicManagementProps) {
  // --- States ---
  const [classes, setClasses] = useState<ClassInfo[]>(initialClasses);
  const [subjects, setSubjects] = useState<UICourse[]>([]);
  
  // 🚀 DỮ LIỆU THẬT: State lưu trữ danh sách Giảng viên quét trực tiếp từ Database
  const [realTeachers, setRealTeachers] = useState<string[]>([]);

  // 🛠️ Đồng bộ dữ liệu real-time tránh lỗi vòng lặp cascading renders của ESLint
  const loadDatabaseData = useCallback(async () => {
    try {
      // 1. Đồng bộ danh sách Khóa học / Môn học từ Database
      const courseData = await getCourses();
      setSubjects(courseData);

      // 2. 🚀 QUÉT GIẢNG VIÊN THẬT: Lấy từ DB, lọc đúng role GIANG_VIEN đang hoạt động
      const allUsers = await getUsers();
      const teachers = allUsers
        .filter(u => u.role === "GIANG_VIEN" && u.status === "Hoạt động")
        .map(u => u.fullName);
      
      setRealTeachers(teachers.length > 0 ? teachers : ["Chưa có giảng viên nào trên hệ thống"]);
    } catch (error) {
      console.error("Lỗi lấy danh sách dữ liệu từ DB:", error);
    }
  }, []);

  useEffect(() => {
    const initFetch = async () => {
      await loadDatabaseData();
    };
    initFetch();
  }, [loadDatabaseData]);

  // States Form Tạo Lớp
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassMajor, setNewClassMajor] = useState("");
  const [newClassCapacity, setNewClassCapacity] = useState("");
  
  // States Form Đề Xuất Môn Mới
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  // States Form Phân Công Giảng Viên
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [chosenTeacher, setChosenTeacher] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  // --- Handlers ---
  const handleCreateClass = () => {
    if (!newClassName || !newClassMajor || !newClassCapacity) {
      alert("Vui lòng nhập đầy đủ thông tin lớp học!");
      return;
    }

    const newClass: ClassInfo = {
      id: `CLS00${classes.length + 1}`,
      name: newClassName,
      major: newClassMajor,
      studentCount: 0,
      maxCapacity: parseInt(newClassCapacity),
    };

    setClasses([newClass, ...classes]);
    setIsClassDialogOpen(false);
    setNewClassName("");
    setNewClassMajor("");
    setNewClassCapacity("");

    setToastMessage(`Thành công! Đã tạo lớp ${newClass.name}.`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleProposeSubject = async () => {
    if (!newSubjectCode || !newSubjectName) {
      alert("Vui lòng nhập đầy đủ thông tin môn học!");
      return;
    }

    try {
      await createCourse({
        title: newSubjectName,
        subject: newSubjectCode.toUpperCase()
      });

      await loadDatabaseData();
      setIsSubjectDialogOpen(false);
      setNewSubjectCode("");
      setNewSubjectName("");

      setToastMessage(`Đã gửi đề xuất môn học: ${newSubjectName}`);
      setTimeout(() => setToastMessage(""), 3000);
      
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi lưu vào database!");
    }
  };

  const handleSaveAssignment = () => {
    if (!chosenTeacher || chosenTeacher.startsWith("Chưa có")) {
      alert("Vui lòng chọn một giảng viên hợp lệ!");
      return;
    }

    setSubjects(prev => prev.map(subj => 
      subj.id === selectedSubjectId ? { ...subj, assignedTeacher: chosenTeacher } : subj
    ));

    setIsAssignDialogOpen(false);
    setToastMessage(`Thành công! Đã phân công ${chosenTeacher}.`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleApproveSubject = async (id: number) => {
    try {
      await updateCourseStatus(id, "Đã công bố");
      await loadDatabaseData();
      setToastMessage("Đã phê duyệt môn học áp dụng toàn trường!");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (error) {
      console.error(error);
      alert("Duyệt môn thất bại!");
    }
  };

  const handleRejectSubject = async (id: number) => {
    try {
      await updateCourseStatus(id, "Từ chối");
      await loadDatabaseData();
      setToastMessage("Đã từ chối áp dụng môn học đề xuất.");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (error) {
      console.error(error);
      alert("Từ chối môn thất bại!");
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      
      {/* 🟢 LUỒNG HIỂN THỊ DÀNH RIÊNG CHO PHÒNG ĐÀO TẠO */}
      {currentRole === "PHONG_DAO_TAO" && (
        <div className="space-y-6">
          {/* Tiêu đề */}
          <div className="flex flex-col gap-2 pb-6 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><BookOpen className="h-6 w-6" /></div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ban Điều Hành — Phòng Đào Tạo</h1>
            </div>
            <p className="text-muted-foreground ml-12">Quản lý danh sách lớp học và phê duyệt môn học toàn trường.</p>
          </div>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Danh sách lớp học</CardTitle>
                <CardDescription>Quản lý các lớp học và sĩ số sinh viên trường.</CardDescription>
              </div>
              <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Tạo lớp mới
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Tạo lớp học mới</DialogTitle>
                    <DialogDescription>Điền thông tin chi tiết để khởi tạo lớp học mới.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mã/Tên lớp</label>
                      <Input placeholder="VD: SE2026_A" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Chuyên ngành</label>
                      <Input placeholder="VD: Kỹ thuật phần mềm" value={newClassMajor} onChange={(e) => setNewClassMajor(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sĩ số tối đa</label>
                      <Input type="number" placeholder="VD: 40" value={newClassCapacity} onChange={(e) => setNewClassCapacity(e.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsClassDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleCreateClass} className="bg-emerald-600 hover:bg-emerald-700 text-white">Lưu thông tin</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="font-semibold text-slate-700">Mã Lớp</TableHead>
                      <TableHead className="font-semibold text-slate-700">Chuyên ngành</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Sĩ số hiện tại</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-semibold text-slate-900">{cls.name}</TableCell>
                        <TableCell className="text-slate-600">{cls.major}</TableCell>
                        <TableCell className="text-center">
                          <span className={cls.studentCount >= cls.maxCapacity ? "text-red-600 font-medium" : "text-slate-600"}>
                            {cls.studentCount} / {cls.maxCapacity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {cls.studentCount >= cls.maxCapacity ? (
                            <Badge variant="destructive" className="shadow-none">Đã đầy</Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 shadow-none">Đang tuyển</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-500" />
                Danh sách môn học mới chờ phê duyệt
              </CardTitle>
              <CardDescription>Phê duyệt hoặc từ chối áp dụng môn học do Trưởng Bộ Môn đẩy lên.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="font-semibold text-slate-700">ID Môn</TableHead>
                      <TableHead className="font-semibold text-slate-700">Tên môn học đề xuất</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Mã ngành</TableHead>
                      <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.filter(s => s.status === "Bản nháp").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-400 py-6 text-sm">
                          Hiện tại không có đề xuất môn học mới nào chờ phê duyệt.
                        </TableCell>
                      </TableRow>
                    ) : (
                      subjects.filter(s => s.status === "Bản nháp").map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-mono text-sm text-slate-600">MH_{subject.id}</TableCell>
                          <TableCell className="font-medium text-slate-900">{subject.title}</TableCell>
                          <TableCell className="text-center font-bold text-blue-600">{subject.subject}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 shadow-none">Chờ duyệt</Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-emerald-50 border-emerald-200" onClick={() => handleApproveSubject(subject.id)}>
                              <Check className="h-4 w-4 text-emerald-600" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-red-50 border-red-200" onClick={() => handleRejectSubject(subject.id)}>
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🟢 LUỒNG HIỂN THỊ DÀNH RIÊNG CHO TRƯỞNG BỘ MÔN */}
      {currentRole === "TRUONG_BO_MON" && (
        <div className="space-y-6">
          {/* Tiêu đề */}
          <div className="flex flex-col gap-2 pb-6 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users className="h-6 w-6" /></div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Điều Hành Khoa — Trưởng Bộ Môn</h1>
            </div>
            <p className="text-muted-foreground ml-12">Đề xuất khung môn học và phân công lịch giảng dạy cho Giảng viên.</p>
          </div>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" /> Quản lý & Phân công Giảng Viên
                  </CardTitle>
                  <CardDescription>Danh sách các môn học đã được thông qua và phân công nhân sự từ DB thật.</CardDescription>
                </div>
                <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="mr-2 h-4 w-4" /> Đề xuất môn mới
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Đề xuất môn học mới</DialogTitle>
                      <DialogDescription>Gửi thông tin môn học lên hệ thống chờ Phòng Đào Tạo phê duyệt.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Mã học phần (Chuyên ngành)</label>
                        <Input placeholder="VD: SWE201" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tên môn học</label>
                        <Input placeholder="VD: Kỹ thuật phần mềm cơ sở" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>Hủy</Button>
                      <Button onClick={handleProposeSubject} className="bg-blue-600 hover:bg-blue-700 text-white">Gửi đề xuất</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-white overflow-hidden mt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="font-semibold text-slate-700">Mã môn</TableHead>
                      <TableHead className="font-semibold text-slate-700">Tên môn học</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Chuyên ngành</TableHead>
                      <TableHead className="font-semibold text-slate-700">Giảng viên phụ trách</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.filter(s => s.status === "Đã công bố").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-400 py-6 text-sm">
                          Chưa có môn học nào được phê duyệt áp dụng chính thức.
                        </TableCell>
                      </TableRow>
                    ) : (
                      subjects.filter(s => s.status === "Đã công bố").map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-mono text-sm text-slate-600">MH_{subject.id}</TableCell>
                          <TableCell className="font-medium text-slate-900">{subject.title}</TableCell>
                          <TableCell className="text-center font-bold text-slate-600">{subject.subject}</TableCell>
                          <TableCell>
                            {subject.assignedTeacher ? (
                              <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 w-fit px-2.5 py-1 rounded-md">
                                <Users className="h-4 w-4" /> {subject.assignedTeacher}
                              </div>
                            ) : (
                              <span className="text-sm italic text-slate-400">Chưa phân công</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant={subject.assignedTeacher ? "outline" : "default"} 
                              size="sm"
                              className={!subject.assignedTeacher ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                              onClick={() => {
                                setSelectedSubjectId(subject.id);
                                setChosenTeacher(subject.assignedTeacher || "");
                                setIsAssignDialogOpen(true);
                              }}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              {subject.assignedTeacher ? "Đổi GV" : "Phân công"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" /> Lịch sử đề xuất môn học của bộ môn
              </CardTitle>
              <CardDescription>Bảng theo dõi tiến độ duyệt real-time từ Phòng Đào Tạo.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="font-semibold text-slate-700">ID</TableHead>
                      <TableHead className="font-semibold text-slate-700">Tên môn học</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Chuyên ngành</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Trạng thái phê duyệt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-400 py-6 text-sm">Chưa có lịch sử đề xuất nào.</TableCell>
                      </TableRow>
                    ) : (
                      subjects.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-mono text-sm text-slate-600">MH_{sub.id}</TableCell>
                          <TableCell className="font-medium text-slate-900">{sub.title}</TableCell>
                          <TableCell className="text-center font-mono text-sm">{sub.subject}</TableCell>
                          <TableCell className="text-right">
                            {sub.status === "Đã công bố" ? (
                              <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 shadow-none">Đã duyệt & Áp dụng</Badge>
                            ) : sub.status === "Từ chối" ? (
                              <Badge variant="destructive" className="shadow-none">Bị từ chối</Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 shadow-none">Đang xem xét</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🟢 POPUP PHÂN CÔNG GIẢNG VIÊN (SỬ DỤNG DỮ LIỆU DB THẬT) */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Phân công giảng viên</DialogTitle>
            <DialogDescription>Chọn một giảng viên thực tế trên hệ thống để đảm nhận môn học này.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Danh sách giảng viên:</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={chosenTeacher}
              onChange={(e) => setChosenTeacher(e.target.value)}
            >
              <option value="">-- Chọn Giảng Viên --</option>
              {realTeachers.map((teacher, index) => (
                <option key={index} value={teacher} disabled={teacher.startsWith("Chưa có")}>
                  {teacher}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveAssignment} className="bg-blue-600 hover:bg-blue-700 text-white">Xác nhận phân công</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UI THÔNG BÁO TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in z-50">
          <div className="bg-emerald-500/20 p-1 rounded-full"><Check className="h-5 w-5 text-emerald-400" /></div>
          <p className="font-medium text-sm">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}