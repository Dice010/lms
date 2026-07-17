"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Users, BookOpen, UserPlus, Check, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { getCourses, getClasses, createClass, assignLecturerToClass } from "@/app/actions/course-actions";
import { getUsers } from "@/app/actions/user-actions";
import { Course, Class } from "@prisma/client";

export default function TBMDashboard() {
  const { data: session } = useSession(); 
  const [currentUserFullName, setCurrentUserFullName] = useState(""); 

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Course[]>([]);
  const [realTeachers, setRealTeachers] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");

  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassMajor, setNewClassMajor] = useState("");
  const [newClassCapacity, setNewClassCapacity] = useState("");
  const [newClassSubjectCode, setNewClassSubjectCode] = useState(""); 

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [chosenTeacher, setChosenTeacher] = useState("");

  const loadDatabaseData = useCallback(async () => {
    try {
      const courseData = await getCourses();
      setSubjects(courseData);
      const classData = await getClasses();
      setClasses(classData);

      const allUsers = await getUsers();
      const teachers = allUsers
        .filter((u) => u.role === "GIANG_VIEN" && u.status === "Hoạt động")
        .map((u) => u.fullName);
      setRealTeachers(teachers.length > 0 ? teachers : ["Chưa có giảng viên nào trên hệ thống"]);

      const loggedInUser = allUsers.find(u => u.username === session?.user?.name || u.fullName === session?.user?.name);
      if (loggedInUser) {
        setCurrentUserFullName(loggedInUser.fullName);
      } else {
        setCurrentUserFullName(session?.user?.name || "TBM");
      }
    } catch (error) {
      console.error(error);
    }
  }, [session]);

  useEffect(() => {
    const initFetch = async () => {
      await loadDatabaseData();
    };
    initFetch();
  }, [loadDatabaseData]);

  const handleProposeClass = async () => {
    if (!newClassName || !newClassMajor || !newClassCapacity || !newClassSubjectCode) return alert("Điền đủ thông tin!");
    await createClass({
      name: newClassName.toUpperCase(), major: newClassMajor,
      maxCapacity: parseInt(newClassCapacity), subjectCode: newClassSubjectCode,
    });
    await loadDatabaseData();
    setIsClassDialogOpen(false);
    setNewClassName(""); setNewClassMajor(""); setNewClassCapacity(""); setNewClassSubjectCode("");
    setToastMessage(`Đã gửi đề xuất mở lớp ${newClassName.toUpperCase()} lên PĐT.`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSaveAssignment = async () => {
    if (!chosenTeacher || chosenTeacher.startsWith("Chưa có") || !selectedClassId) return alert("Chọn giảng viên hợp lệ!");
    await assignLecturerToClass(selectedClassId, chosenTeacher);
    await loadDatabaseData();
    setIsAssignDialogOpen(false);
    setToastMessage(`Thành công! Đã phân công GV ${chosenTeacher} vào lớp. Lớp đã Mở Tuyển!`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Hàm render Badge màu sắc thông minh
  const renderStatusBadge = (cls: Class) => {
    if (cls.studentCount >= cls.maxCapacity && cls.maxCapacity > 0) {
      return <Badge variant="destructive" className="shadow-none">Đã đầy</Badge>;
    }
    switch (cls.status) {
      case "Chờ PĐT duyệt": return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 shadow-none">Chờ PĐT duyệt</Badge>;
      case "Từ chối": return <Badge variant="destructive" className="shadow-none">Từ chối</Badge>;
      case "Chờ phân công TBM": return <Badge className="bg-blue-500 shadow-none">Chờ TBM</Badge>;
      case "Chờ phân công GV": return <Badge className="bg-purple-500 shadow-none">Chờ gán GV</Badge>;
      case "Đang tuyển": return <Badge className="bg-emerald-500 shadow-none">Đang tuyển</Badge>;
      default: return <Badge className="bg-slate-500 shadow-none">{cls.status}</Badge>;
    }
  };

  const myManagedClasses = classes.filter(cls => cls.assignedTbm === currentUserFullName);

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 pb-6 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trưởng Bộ Môn: {currentUserFullName}</h1>
          </div>
        </div>

        {/* TBM: Đề xuất mở lớp */}
        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Lịch sử Đề xuất Lớp học</CardTitle>
              <CardDescription>Các lớp học do bạn đề xuất mở dựa trên các Môn học đã thông qua.</CardDescription>
            </div>
            <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Đề xuất mở lớp
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Đề xuất lớp học mới</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-600">Chọn môn học (Bắt buộc)</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      value={newClassSubjectCode} 
                      onChange={(e) => setNewClassSubjectCode(e.target.value)}
                    >
                      <option value="">-- Chọn Môn học đã duyệt --</option>
                      {subjects.filter(s => s.status === "Đã công bố").map(s => (
                        <option key={s.id} value={s.subject}>{s.title} ({s.subject})</option>
                      ))}
                    </select>
                  </div>
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
                  <Button onClick={handleProposeClass} className="bg-blue-600 hover:bg-blue-700 text-white">Gửi đề xuất lớp</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="font-semibold text-slate-700">Mã Lớp</TableHead>
                    <TableHead className="font-semibold text-slate-700">Thuộc Môn</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Trạng thái (Từ PĐT)</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-6 text-sm">Chưa có đề xuất nào.</TableCell></TableRow>
                  ) : (
                    classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-semibold text-slate-900">{cls.name}</TableCell>
                        <TableCell className="font-mono text-slate-600">{cls.subjectCode}</TableCell>
                        <TableCell className="text-center">
                          {renderStatusBadge(cls)}
                        </TableCell>
                        <TableCell className="text-right">
                          {cls.status === "Từ chối" && cls.rejectReason && (
                             <span className="text-xs text-red-500 font-medium flex items-center justify-end gap-1">
                               <AlertCircle className="h-3 w-3" /> Lý do: {cls.rejectReason}
                             </span>
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

        {/* BẢNG 2: CHỈ HIỂN THỊ CÁC LỚP CỦA TBM NÀY ĐỂ GÁN GIẢNG VIÊN */}
        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" /> Quản lý Lớp & Phân công GV</CardTitle>
            <CardDescription>Chỉ hiển thị các lớp do PĐT giao cho bạn làm chủ nhiệm. Phân công Giảng viên tại đây.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-white overflow-hidden mt-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="font-semibold text-slate-700">Mã lớp</TableHead>
                    <TableHead className="font-semibold text-slate-700">Trạng thái lớp</TableHead>
                    <TableHead className="font-semibold text-slate-700">Giảng viên phụ trách</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myManagedClasses.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-6 text-sm">Bạn chưa được PĐT phân công quản lý lớp nào.</TableCell></TableRow>
                  ) : (
                    myManagedClasses.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-bold text-slate-900">
                          {cls.name} <br/><span className="font-mono font-normal text-xs text-slate-500">{cls.subjectCode}</span>
                        </TableCell>
                        <TableCell>
                          {/* 🔥 HIỆN THỊ TRẠNG THÁI ĐỂ TBM BIẾT */}
                          {renderStatusBadge(cls)}
                        </TableCell>
                        <TableCell>
                          {cls.assignedLecturer ? (
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 w-fit px-2.5 py-1 rounded-md">
                              <Users className="h-4 w-4" /> {cls.assignedLecturer}
                            </div>
                          ) : <span className="text-sm italic text-slate-400">Chưa phân công</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={cls.assignedLecturer ? "outline" : "default"} size="sm"
                            className={!cls.assignedLecturer ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                            onClick={() => { setSelectedClassId(cls.id); setChosenTeacher(cls.assignedLecturer || ""); setIsAssignDialogOpen(true); }}
                          >
                            <UserPlus className="mr-2 h-4 w-4" /> {cls.assignedLecturer ? "Đổi GV" : "Gán GV"}
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

      {/* POPUP GÁN GIẢNG VIÊN */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Phân công giảng viên</DialogTitle>
            <DialogDescription>Gán giảng viên phụ trách giảng dạy cho lớp này. Khi gán xong lớp sẽ chính thức <b>Đang tuyển</b>.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              value={chosenTeacher} onChange={(e) => setChosenTeacher(e.target.value)}
            >
              <option value="">-- Chọn Giảng Viên --</option>
              {realTeachers.map((teacher, idx) => (
                <option key={idx} value={teacher} disabled={teacher.startsWith("Chưa có")}>{teacher}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveAssignment} className="bg-purple-600 hover:bg-purple-700 text-white">Xác nhận phân công</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in z-50">
          <div className="bg-emerald-500/20 p-1 rounded-full"><Check className="h-5 w-5 text-emerald-400" /></div>
          <p className="font-medium text-sm">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}