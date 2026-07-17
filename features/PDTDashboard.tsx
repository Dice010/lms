"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, BookOpen, AlertCircle, Check, UserPlus, XCircle, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { getCourses, createCourse, getClasses, updateClassStatus, assignTbmToClass, rejectClass } from "@/app/actions/course-actions";
import { getUsers } from "@/app/actions/user-actions";
import { Course, Class } from "@prisma/client";

type UICourse = Course & { assignedTeacher?: string | null, rejectReason?: string | null };

export default function PDTDashboard() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<UICourse[]>([]);
  const [tbms, setTbms] = useState<string[]>([]);
  
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const [isAssignTbmDialogOpen, setIsAssignTbmDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [chosenTbm, setChosenTbm] = useState("");

  const [isRejectClassDialogOpen, setIsRejectClassDialogOpen] = useState(false);
  const [rejectClassId, setRejectClassId] = useState<number | null>(null);
  const [rejectClassReason, setRejectClassReason] = useState("");

  const loadDatabaseData = useCallback(async () => {
    try {
      const courseData = await getCourses();
      setSubjects(courseData);
      const classData = await getClasses();
      setClasses(classData);

      const allUsers = await getUsers();
      const tbmList = allUsers
        .filter((u) => u.role === "TRUONG_BO_MON" && u.status === "Hoạt động")
        .map((u) => u.fullName);
      setTbms(tbmList.length > 0 ? tbmList : ["Chưa có Trưởng bộ môn nào"]);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const initFetch = async () => {
      await loadDatabaseData();
    };
    initFetch();
  }, [loadDatabaseData]);

  const handleProposeSubject = async () => {
    if (!newSubjectCode || !newSubjectName) return alert("Vui lòng nhập đủ thông tin!");
    await createCourse({ title: newSubjectName, subject: newSubjectCode.toUpperCase() });
    await loadDatabaseData();
    setIsSubjectDialogOpen(false);
    setNewSubjectCode(""); setNewSubjectName("");
    setToastMessage(`Đã gửi đề xuất môn học: ${newSubjectName}`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleApproveClass = async (id: number) => {
    await updateClassStatus(id, "Chờ phân công TBM");
    await loadDatabaseData();
    setToastMessage(`Đã duyệt mở lớp! Vui lòng giao lớp cho TBM.`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleRejectClassSubmit = async () => {
    if (!rejectClassReason.trim() || !rejectClassId) return alert("Vui lòng nhập lý do từ chối!");
    await rejectClass(rejectClassId, rejectClassReason);
    await loadDatabaseData();
    setIsRejectClassDialogOpen(false);
    setRejectClassReason("");
    setToastMessage(`Đã từ chối lớp học!`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSaveTbmAssignment = async () => {
    if (!chosenTbm || chosenTbm.startsWith("Chưa có") || !selectedClassId) {
      return alert("Vui lòng chọn một Trưởng bộ môn hợp lệ!");
    }
    await assignTbmToClass(selectedClassId, chosenTbm);
    await loadDatabaseData();
    setIsAssignTbmDialogOpen(false);
    setToastMessage(`Thành công! Đã giao lớp cho TBM ${chosenTbm}.`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Hàm render Badge màu sắc thông minh
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Chờ PĐT duyệt": return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 shadow-none">Chờ PĐT duyệt</Badge>;
      case "Từ chối": return <Badge variant="destructive" className="shadow-none">Từ chối</Badge>;
      case "Chờ phân công TBM": return <Badge className="bg-blue-500 hover:bg-blue-600 shadow-none">Chờ TBM</Badge>;
      case "Chờ phân công GV": return <Badge className="bg-purple-500 hover:bg-purple-600 shadow-none">Chờ gán GV</Badge>;
      case "Đang tuyển": return <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-none">Đang tuyển</Badge>;
      default: return <Badge className="bg-slate-500 shadow-none">{status}</Badge>;
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 pb-6 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <BookOpen className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ban Điều Hành — Phòng Đào Tạo</h1>
          </div>
        </div>

        {/* BẢNG 1: QUẢN LÝ MÔN HỌC (PĐT ĐỀ XUẤT) */}
        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Danh sách Môn Học Đề Xuất</CardTitle>
              <CardDescription>Theo dõi trạng thái duyệt từ Hiệu trưởng.</CardDescription>
            </div>
            <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Đề xuất môn mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Đề xuất môn học mới</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mã học phần</label>
                    <Input placeholder="VD: SWE201" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tên môn học</label>
                    <Input placeholder="VD: Kỹ thuật phần mềm cơ sở" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>Hủy</Button>
                  <Button onClick={handleProposeSubject} className="bg-emerald-600 hover:bg-emerald-700 text-white">Gửi đề xuất</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="font-semibold text-slate-700">Mã Môn</TableHead>
                    <TableHead className="font-semibold text-slate-700">Tên Môn Học</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Trạng thái phê duyệt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-slate-400 py-6 text-sm">Chưa có môn học nào.</TableCell></TableRow>
                  ) : (
                    subjects.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-mono text-sm font-bold text-blue-600">{sub.subject}</TableCell>
                        <TableCell className="font-medium text-slate-900">{sub.title}</TableCell>
                        <TableCell className="text-right">
                          {sub.status === "Đã công bố" ? (
                            <Badge className="bg-emerald-600 shadow-none">Đã duyệt (Áp dụng)</Badge>
                          ) : sub.status === "Từ chối" ? (
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="destructive" className="shadow-none">Bị từ chối</Badge>
                              {sub.rejectReason && (
                                <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> Phản hồi: {sub.rejectReason}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Chờ duyệt</Badge>
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
        
        {/* BẢNG 2: DUYỆT VÀ PHÂN CÔNG TBM (NÂNG CẤP CÓ CỘT TBM VÀ NÚT ĐỔI TBM) */}
        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="text-xl">Phê duyệt & Phân công Lớp học</CardTitle>
            <CardDescription>Duyệt lớp mới và giao quyền quản lý cho Trưởng Bộ Môn.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="font-semibold text-slate-700">Mã Lớp</TableHead>
                    <TableHead className="font-semibold text-slate-700">Thuộc Môn</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Tình trạng</TableHead>
                    <TableHead className="font-semibold text-slate-700">Trưởng Bộ Môn</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-semibold text-slate-900">{cls.name}</TableCell>
                      <TableCell className="font-mono text-slate-600">{cls.subjectCode}</TableCell>
                      <TableCell className="text-center">
                        {renderStatusBadge(cls.status)}
                      </TableCell>
                      
                      {/* 🔥 Cột hiển thị TBM đã được giao giống như Dashboard của TBM */}
                      <TableCell>
                        {cls.assignedTbm ? (
                          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 w-fit px-2.5 py-1 rounded-md">
                            <Users className="h-4 w-4" /> {cls.assignedTbm}
                          </div>
                        ) : <span className="text-sm italic text-slate-400">Chưa phân công</span>}
                      </TableCell>

                      <TableCell className="text-right">
                        {cls.status === "Chờ PĐT duyệt" ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApproveClass(cls.id)}>
                              <Check className="mr-1 h-4 w-4" /> Duyệt
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => { setRejectClassId(cls.id); setIsRejectClassDialogOpen(true); }}>
                              <XCircle className="mr-1 h-4 w-4" /> Từ chối
                            </Button>
                          </div>
                        ) : cls.status === "Từ chối" ? (
                           <span className="text-sm font-medium text-red-600 flex items-center justify-end gap-1">
                              Đã gửi lý do từ chối
                           </span>
                        ) : (
                          // 🔥 Đổi nút "Giao TBM" thành "Đổi TBM" nếu lớp đã có TBM
                          <Button
                            variant={cls.assignedTbm ? "outline" : "default"} size="sm"
                            className={!cls.assignedTbm ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                            onClick={() => { setSelectedClassId(cls.id); setChosenTbm(cls.assignedTbm || ""); setIsAssignTbmDialogOpen(true); }}
                          >
                            <UserPlus className="mr-2 h-4 w-4" /> {cls.assignedTbm ? "Đổi TBM" : "Giao TBM"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* POPUP TỪ CHỐI LỚP */}
      <Dialog open={isRejectClassDialogOpen} onOpenChange={setIsRejectClassDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2"><AlertCircle className="w-5 h-5"/> Từ chối đề xuất lớp</DialogTitle>
            <DialogDescription>Vui lòng cho Trưởng bộ môn biết lý do lớp này không được mở.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="VD: Thiếu phòng học, sai mã môn..." 
              value={rejectClassReason} 
              onChange={(e) => setRejectClassReason(e.target.value)} 
              className="border-red-200 focus-visible:ring-red-500"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectClassDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleRejectClassSubmit}>Xác nhận từ chối</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* POPUP PHÂN CÔNG / ĐỔI TBM */}
      <Dialog open={isAssignTbmDialogOpen} onOpenChange={setIsAssignTbmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Giao quyền quản lý lớp</DialogTitle>
            <DialogDescription>Chọn một Trưởng Bộ Môn để giao trách nhiệm phân công Giảng viên cho lớp này.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              value={chosenTbm} onChange={(e) => setChosenTbm(e.target.value)}
            >
              <option value="">-- Chọn Trưởng Bộ Môn --</option>
              {tbms.map((tbm, idx) => (
                <option key={idx} value={tbm} disabled={tbm.startsWith("Chưa có")}>{tbm}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignTbmDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveTbmAssignment} className="bg-blue-600 hover:bg-blue-700 text-white">Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in z-50">
          <div className="bg-emerald-500/20 p-1 rounded-full"><Check className="h-5 w-5 text-emerald-400" /></div>
          <p className="font-medium text-sm">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}