"use client";

import React, { useState } from "react";
import { Plus, Users, BookOpen, UserPlus, Check, X, GraduationCap, Building, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- Type Definitions ---
interface ClassInfo {
  id: string;
  name: string;
  major: string;
  studentCount: number;
  maxCapacity: number;
}

interface Subject {
  id: string;
  name: string;
  credits: number;
  assignedTeacher: string | null;
}

interface NewSubject {
  id: string;
  code: string;
  name: string;
  credits: number;
  status: "Pending" | "Approved" | "Rejected";
  proposer: string;
}

// --- Initial Mock Data ---
const initialClasses: ClassInfo[] = [
  { id: "CLS001", name: "SE2026_A", major: "Kỹ thuật phần mềm", studentCount: 35, maxCapacity: 40 },
  { id: "CLS002", name: "CS2026_B", major: "Khoa học máy tính", studentCount: 40, maxCapacity: 40 },
  { id: "CLS003", name: "AI2026_C", major: "Trí tuệ nhân tạo", studentCount: 28, maxCapacity: 35 },
];

const initialSubjects: Subject[] = [
  { id: "SUBJ101", name: "Cấu trúc dữ liệu và giải thuật", credits: 3, assignedTeacher: "TS. Nguyễn Văn A" },
  { id: "SUBJ102", name: "Cơ sở dữ liệu", credits: 3, assignedTeacher: null },
  { id: "SUBJ103", name: "Mạng máy tính", credits: 3, assignedTeacher: null },
];

const initialNewSubjects: NewSubject[] = [
  { id: "NS01", code: "AI301", name: "Học máy ứng dụng", credits: 3, status: "Pending", proposer: "TBM Trí tuệ nhân tạo" },
  { id: "NS02", code: "SE402", name: "Kiểm thử phần mềm nâng cao", credits: 4, status: "Approved", proposer: "TBM Kỹ thuật phần mềm" },
  { id: "NS03", code: "CS105", name: "Nhập môn điện toán đám mây", credits: 3, status: "Pending", proposer: "TBM Khoa học máy tính" },
];

const mockTeachers = [
  "TS. Nguyễn Văn A",
  "ThS. Trần Thị B",
  "PGS.TS. Lê Văn C",
  "TS. Phạm Minh D"
];

export default function AcademicManagement() {
  // --- States ---
  const [classes, setClasses] = useState<ClassInfo[]>(initialClasses);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [newSubjects, setNewSubjects] = useState<NewSubject[]>(initialNewSubjects);

  // States Form Tạo Lớp
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassMajor, setNewClassMajor] = useState("");
  const [newClassCapacity, setNewClassCapacity] = useState("");
  
  // States Form Đề Xuất Môn Mới
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCredits, setNewSubjectCredits] = useState("");

  // States Form Phân Công Giảng Viên
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
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

  const handleProposeSubject = () => {
    if (!newSubjectCode || !newSubjectName || !newSubjectCredits) {
      alert("Vui lòng nhập đầy đủ thông tin môn học!");
      return;
    }

    const newSub: NewSubject = {
      id: `NS0${newSubjects.length + 1}`,
      code: newSubjectCode.toUpperCase(),
      name: newSubjectName,
      credits: parseInt(newSubjectCredits),
      status: "Pending",
      proposer: "TBM Kỹ thuật phần mềm", 
    };

    setNewSubjects([newSub, ...newSubjects]);
    setIsSubjectDialogOpen(false);
    setNewSubjectCode("");
    setNewSubjectName("");
    setNewSubjectCredits("");

    setToastMessage(`Thành công! Đã gửi đề xuất môn ${newSub.name}.`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSaveAssignment = () => {
    if (!chosenTeacher) {
      alert("Vui lòng chọn giảng viên!");
      return;
    }

    setSubjects(prev => prev.map(subj => 
      subj.id === selectedSubjectId ? { ...subj, assignedTeacher: chosenTeacher } : subj
    ));

    setIsAssignDialogOpen(false);
    setToastMessage(`Thành công! Đã phân công ${chosenTeacher}.`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleApproveSubject = (id: string) => {
    setNewSubjects((prevSubjects) =>
      prevSubjects.map((subject) =>
        subject.id === id ? { ...subject, status: "Approved" } : subject
      )
    );
  };

  const handleRejectSubject = (id: string) => {
    setNewSubjects((prevSubjects) =>
      prevSubjects.map((subject) =>
        subject.id === id ? { ...subject, status: "Rejected" } : subject
      )
    );
  };

  return (
    // Sử dụng flex-row và flex-nowrap để bắt buộc dàn thành 2 cột ngang
    <Tabs defaultValue="pdt" className="flex flex-row flex-nowrap w-full h-screen overflow-hidden bg-slate-50" orientation="vertical">
      
      {/* ========================================= */}
      {/* CỘT TRÁI: SIDEBAR MENU VAI TRÒ            */}
      {/* ========================================= */}
      <div className="w-64 bg-white border-r shrink-0 flex flex-col shadow-sm z-10 h-full overflow-y-auto">
        <div className="py-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-6 block">
            Lựa Chọn Vai Trò
          </span>
          
          <TabsList className="flex flex-col h-auto bg-transparent space-y-0 p-0 w-full items-start rounded-none">
            <TabsTrigger 
              value="pdt" 
              className="flex w-full items-center justify-start gap-3 px-6 py-4 text-sm font-medium text-slate-600 bg-transparent border-l-4 border-transparent rounded-none transition-none hover:bg-slate-50 hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
            >
              <Building className="h-5 w-5" />
              Phòng Đào Tạo
            </TabsTrigger>
            
            <TabsTrigger 
              value="tbm" 
              className="flex w-full items-center justify-start gap-3 px-6 py-4 text-sm font-medium text-slate-600 bg-transparent border-l-4 border-transparent rounded-none transition-none hover:bg-slate-50 hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
            >
              <GraduationCap className="h-5 w-5" />
              Trưởng Bộ Môn
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* ========================================= */}
      {/* CỘT PHẢI: NỘI DUNG CHÍNH                  */}
      {/* ========================================= */}
      <div className="flex-1 w-full h-full overflow-y-auto p-8">
        
        {/* Header tổng */}
        <div className="flex flex-col gap-2 pb-6 mb-6 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <BookOpen className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trang Quản Trị — Đào Tạo</h1>
          </div>
          <p className="text-muted-foreground ml-12">
            Hệ thống Quản lý Học tập (LMS) — Phân quyền thao tác chuyên môn.
          </p>
        </div>

        {/* TAB 1: PHÒNG ĐÀO TẠO */}
        <TabsContent value="pdt" className="m-0 space-y-6 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Danh sách lớp học</CardTitle>
                <CardDescription>Quản lý các lớp học và sĩ số sinh viên.</CardDescription>
              </div>
              
              <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-slate-900 hover:bg-slate-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo lớp mới
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Tạo lớp học mới</DialogTitle>
                    <DialogDescription>Điền thông tin chi tiết để khởi tạo lớp học.</DialogDescription>
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
                    <Button onClick={handleCreateClass}>Lưu thông tin</Button>
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

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Danh sách môn học mới đề xuất
              </CardTitle>
              <CardDescription>Phê duyệt các môn học mới do các Trưởng bộ môn đề xuất.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="font-semibold text-slate-700">Mã môn</TableHead>
                      <TableHead className="font-semibold text-slate-700">Tên môn học</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Số TC</TableHead>
                      <TableHead className="font-semibold text-slate-700">Người đề xuất</TableHead>
                      <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newSubjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-mono text-sm text-slate-600">{subject.code}</TableCell>
                        <TableCell className="font-medium text-slate-900">{subject.name}</TableCell>
                        <TableCell className="text-center text-slate-600">{subject.credits}</TableCell>
                        <TableCell className="text-sm text-slate-500">{subject.proposer}</TableCell>
                        <TableCell>
                          {subject.status === "Approved" ? (
                            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 shadow-none">Đã duyệt</Badge>
                          ) : subject.status === "Rejected" ? (
                            <Badge variant="destructive" className="shadow-none">Từ chối</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 shadow-none">Chờ duyệt</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" disabled={subject.status !== "Pending"} onClick={() => handleApproveSubject(subject.id)}>
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8" disabled={subject.status !== "Pending"} onClick={() => handleRejectSubject(subject.id)}>
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: TRƯỞNG BỘ MÔN */}
        <TabsContent value="tbm" className="m-0 space-y-6 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Quản lý & Đề xuất môn học
                  </CardTitle>
                  <CardDescription>TBM đề xuất môn học mới và phân công giảng viên giảng dạy.</CardDescription>
                </div>
                
                <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-slate-900 hover:bg-slate-800">
                      <Plus className="mr-2 h-4 w-4" />
                      Đề xuất môn mới
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Đề xuất môn học mới</DialogTitle>
                      <DialogDescription>Gửi thông tin môn học lên Phòng Đào Tạo phê duyệt.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Mã môn học</label>
                        <Input placeholder="VD: SWE201" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tên môn học</label>
                        <Input placeholder="VD: Kỹ thuật phần mềm cơ sở" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Số tín chỉ</label>
                        <Input type="number" placeholder="VD: 3" value={newSubjectCredits} onChange={(e) => setNewSubjectCredits(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>Hủy</Button>
                      <Button onClick={handleProposeSubject}>Gửi đề xuất</Button>
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
                      <TableHead className="font-semibold text-slate-700 text-center">Số tín chỉ</TableHead>
                      <TableHead className="font-semibold text-slate-700">Giảng viên phụ trách</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-mono text-sm text-slate-600">{subject.id}</TableCell>
                        <TableCell className="font-medium text-slate-900">{subject.name}</TableCell>
                        <TableCell className="text-center text-slate-600">{subject.credits}</TableCell>
                        <TableCell>
                          {subject.assignedTeacher ? (
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 w-fit px-2.5 py-1 rounded-md">
                              <Users className="h-4 w-4" />
                              {subject.assignedTeacher}
                            </div>
                          ) : (
                            <span className="text-sm italic text-slate-400">Chưa phân công</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant={subject.assignedTeacher ? "outline" : "default"} 
                            size="sm"
                            className={!subject.assignedTeacher ? "bg-slate-900 hover:bg-slate-800" : ""}
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Theo dõi trạng thái môn học đã đề xuất
              </CardTitle>
              <CardDescription>Danh sách các môn do ông đề xuất và phản hồi từ Phòng Đào Tạo.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="font-semibold text-slate-700">Mã môn</TableHead>
                      <TableHead className="font-semibold text-slate-700">Tên môn học</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Số TC</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Trạng thái phê duyệt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newSubjects.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-mono text-sm text-slate-600">{sub.code}</TableCell>
                        <TableCell className="font-medium text-slate-900">{sub.name}</TableCell>
                        <TableCell className="text-center text-slate-600">{sub.credits}</TableCell>
                        <TableCell className="text-right">
                          {sub.status === "Approved" ? (
                            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 shadow-none">Đồng ý áp dụng</Badge>
                          ) : sub.status === "Rejected" ? (
                            <Badge variant="destructive" className="shadow-none">Không phê duyệt</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 shadow-none">Đang chờ xem xét</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>

      {/* POPUP PHÂN CÔNG GIẢNG VIÊN */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Phân công giảng viên</DialogTitle>
            <DialogDescription>Chọn một giảng viên phù hợp thuộc bộ môn để đảm nhận môn học này.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Danh sách giảng viên:</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={chosenTeacher}
              onChange={(e) => setChosenTeacher(e.target.value)}
            >
              <option value="">-- Chọn Giảng Viên --</option>
              {mockTeachers.map((teacher, index) => (
                <option key={index} value={teacher}>{teacher}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveAssignment} className="bg-blue-600 hover:bg-blue-700">Xác nhận phân công</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UI THÔNG BÁO NỔI TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in z-50">
          <div className="bg-white/20 p-1 rounded-full">
            <Check className="h-5 w-5 text-white" />
          </div>
          <p className="font-medium">{toastMessage}</p>
        </div>
      )}
    </Tabs>
  );
}