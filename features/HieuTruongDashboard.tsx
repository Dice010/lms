"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Course } from "@prisma/client";
import { getUsers, createUser, toggleUserStatus } from "@/app/actions/user-actions";
import { getCourses, updateCourseStatus } from "@/app/actions/course-actions";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, BookOpen, PlusCircle, Users, Settings, ShieldOff, Search } from "lucide-react";

// --- Bộ chuyển đổi Role giữa UI và Database ---
const mapRoleToDB = (uiRole: string) => {
  const mapping: Record<string, string> = {
    "Sinh viên": "SINH_VIEN",
    "Giảng viên": "GIANG_VIEN",
    "TBM": "TRUONG_BO_MON",
    "PDT": "PHONG_DAO_TAO",
    "HR": "HR",
    "Hiệu trưởng": "HIEU_TRUONG",
  };
  return mapping[uiRole] || "SINH_VIEN";
};

type MainTab = "accounts" | "courses" | "manage";

// --- Helpers ---
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    "Chờ duyệt": "secondary",
    "Bản nháp": "secondary",
    "Đã công bố": "default",
    "Từ chối": "destructive",
    "Hoạt động": "default",
    "Bị khóa": "destructive",
  };
  return <Badge variant={map[status] ?? "outline"}>{status}</Badge>;
}

export default function HieuTruongDashboard() {
  // --- States lưu dữ liệu THẬT ---
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<MainTab>("accounts");
  const [manageSubTab, setManageSubTab] = useState<"list" | "status">("list");

  // Load Data từ DB
  const loadData = useCallback(async () => {
    try {
      const fetchedUsers = await getUsers();
      const fetchedCourses = await getCourses();
      setUsers(fetchedUsers);
      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  }, []);

  useEffect(() => {
    const initFetch = async () => {
      await loadData();
    };
    initFetch();
  }, [loadData]);

  // Phân loại Users
  const highLevelAccounts = users.filter(u => ["ADMIN", "HIEU_TRUONG", "HR"].includes(u.role));
  const systemUsers = users.filter(u => ["SINH_VIEN", "GIANG_VIEN", "TRUONG_BO_MON", "PHONG_DAO_TAO"].includes(u.role));

  // --- Form Tài Khoản Cấp Cao ---
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Hiệu trưởng", password: "", confirmPassword: "" });
  const accountPasswordMismatch = form.password !== "" && form.confirmPassword !== "" && form.password !== form.confirmPassword;

  const handleAddAccount = async () => {
    if (!form.name || !form.email || !form.password || accountPasswordMismatch) return;
    await createUser({ username: form.email, fullName: form.name, role: mapRoleToDB(form.role), password: form.password });
    await loadData();
    setForm({ name: "", email: "", role: "Hiệu trưởng", password: "", confirmPassword: "" });
    setShowAddAccount(false);
  };

  // --- Form Tài Khoản Người Dùng (SV, GV...) ---
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("Tất cả");
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newRole, setNewRole] = useState<string>("Sinh viên");
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const passwordMismatch = userForm.password !== "" && userForm.confirmPassword !== "" && userForm.password !== userForm.confirmPassword;

  const filteredUsers = systemUsers.filter(u => {
    const matchRole = roleFilter === "Tất cả" || u.role === mapRoleToDB(roleFilter);
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleAddUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password || passwordMismatch) return;
    await createUser({ username: userForm.email, fullName: userForm.name, role: mapRoleToDB(newRole), password: userForm.password });
    await loadData();
    setUserForm({ name: "", email: "", password: "", confirmPassword: "" });
    setShowAddUserDialog(false);
  };

  const handleToggleLock = async (id: number, status: string) => {
    await toggleUserStatus(id, status);
    await loadData();
  };

  // --- Phê Duyệt Môn Học ---
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const filteredCourses = filterStatus === "Tất cả" ? courses : courses.filter(c => c.status === filterStatus);

  const handleApproveCourse = async (id: number) => {
    await updateCourseStatus(id, "Đã công bố");
    await loadData();
  };

  const handleRejectCourse = async (id: number) => {
    await updateCourseStatus(id, "Từ chối");
    await loadData();
  };

  const stats = [
    { label: "Tài khoản cấp cao", value: highLevelAccounts.length, icon: <Users className="h-5 w-5 text-indigo-500" /> },
    { label: "Môn học chờ duyệt", value: courses.filter(c => c.status === "Bản nháp").length, icon: <BookOpen className="h-5 w-5 text-amber-500" /> },
    { label: "Tổng người dùng", value: systemUsers.length, icon: <Users className="h-5 w-5 text-blue-500" /> },
    { label: "Bị khóa", value: users.filter(u => u.status === "Bị khóa").length, icon: <ShieldOff className="h-5 w-5 text-red-500" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8 flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trang Quản Trị — Hiệu Trưởng</h1>
        </div>
      </div>

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

      {/* Tabs Menu */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: "accounts", label: "Tài Khoản Cấp Cao", icon: <Settings className="h-4 w-4" /> },
          { key: "courses", label: "Phê Duyệt Môn Học", icon: <BookOpen className="h-4 w-4" /> },
          { key: "manage", label: "Quản Lý Tài Khoản", icon: <Users className="h-4 w-4" /> },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as MainTab)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key ? "bg-emerald-600 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TÀI KHOẢN CẤP CAO */}
      {activeTab === "accounts" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh Sách Tài Khoản Cấp Cao</CardTitle>
            <Button size="sm" onClick={() => setShowAddAccount(true)}>
              <PlusCircle className="mr-1 h-4 w-4" /> Thêm tài khoản
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Username (Email)</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highLevelAccounts.map(acc => (
                  <TableRow key={acc.id}>
                    <TableCell className="font-medium">{acc.fullName}</TableCell>
                    <TableCell><Badge variant={acc.role === "HIEU_TRUONG" ? "default" : "secondary"}>{acc.role}</Badge></TableCell>
                    <TableCell className="text-slate-500">{acc.username}</TableCell>
                    <TableCell><StatusBadge status={acc.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: PHÊ DUYỆT MÔN HỌC */}
      {activeTab === "courses" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh Sách Môn Học Đề Xuất</CardTitle>
            <div className="flex gap-2">
              {["Tất cả", "Bản nháp", "Đã công bố", "Từ chối"].map(f => (
                <button key={f} onClick={() => setFilterStatus(f)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    filterStatus === f ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border"
                  }`}>{f}</button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã Môn</TableHead>
                  <TableHead>Tên Môn Học</TableHead>
                  <TableHead>Ngày Gửi</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead className="text-right">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm font-bold text-blue-600">{c.subject}</TableCell>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{c.uploadedAt}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell className="text-right">
                      {c.status === "Bản nháp" && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="destructive" onClick={() => handleRejectCourse(c.id)}>Từ chối</Button>
                          <Button size="sm" onClick={() => handleApproveCourse(c.id)}>Duyệt</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: QUẢN LÝ TÀI KHOẢN (SV, GV...) */}
      {activeTab === "manage" && (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button onClick={() => setManageSubTab("list")} className={`rounded-md px-4 py-1.5 text-sm font-medium ${manageSubTab === "list" ? "bg-emerald-600 text-white" : "bg-slate-100"}`}>Danh Sách</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input className="pl-8 w-52" placeholder="Tìm tên / email..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select 
                value={roleFilter} 
                onChange={e => setRoleFilter(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
              >
                <option value="Tất cả">Tất cả vai trò</option>
                {["Sinh viên", "Giảng viên", "TBM", "PDT"].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <Button size="sm" onClick={() => setShowAddUserDialog(true)}><PlusCircle className="mr-1 h-4 w-4" /> Tạo tài khoản</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Vai trò (DB)</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{u.username}</TableCell>
                    <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                    <TableCell><StatusBadge status={u.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className={u.status === "Bị khóa" ? "text-emerald-600" : "text-red-600"} onClick={() => handleToggleLock(u.id, u.status)}>
                        {u.status === "Bị khóa" ? "Mở khóa" : "Khóa"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog Tạo Account Cấp Cao */}
      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent>
          <DialogHeader><DialogTitle>Khởi Tạo Tài Khoản Cấp Cao</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1"><Label>Họ tên</Label><Input placeholder="VD: Trần Văn Hiệu Trưởng" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1"><Label>Email (Username)</Label><Input placeholder="hieutruong@lms.edu.vn" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1"><Label>Vai trò</Label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full rounded-md border p-2">
                <option>Hiệu trưởng</option>
                <option>HR</option>
              </select>
            </div>
            <div className="space-y-1"><Label>Mật khẩu</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            <div className="space-y-1"><Label>Xác nhận mật khẩu</Label><Input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              {accountPasswordMismatch && <p className="text-xs text-red-500">Mật khẩu không khớp</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAccount(false)}>Hủy</Button>
            <Button disabled={!form.name || !form.email || !form.password || accountPasswordMismatch} onClick={handleAddAccount}>Tạo tài khoản</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tạo Account Thường */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tạo Tài Khoản Người Dùng</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1"><Label>Vai trò</Label>
              <div className="flex gap-2">
                {["Sinh viên", "Giảng viên", "TBM", "PDT"].map(r => (
                  <button key={r} onClick={() => setNewRole(r)} className={`px-3 py-1 text-sm rounded-full ${newRole === r ? "bg-emerald-600 text-white" : "bg-slate-100"}`}>{r}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1"><Label>Họ tên</Label><Input value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} /></div>
            <div className="space-y-1"><Label>Email (Username)</Label><Input value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} /></div>
            <div className="space-y-1"><Label>Mật khẩu</Label><Input type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} /></div>
            <div className="space-y-1"><Label>Xác nhận</Label><Input type="password" value={userForm.confirmPassword} onChange={e => setUserForm({ ...userForm, confirmPassword: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>Hủy</Button>
            <Button disabled={!userForm.name || !userForm.email || !userForm.password || passwordMismatch} onClick={handleAddUser}>Tạo tài khoản</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}