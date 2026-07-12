"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User } from "@prisma/client";
import { getUsers, createUser, toggleUserStatus } from "@/app/actions/user-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlusCircle, ShieldOff, ShieldCheck, Search, Shield } from "lucide-react";

// --- Cấu hình mã hóa Role chuyển đổi giữa UI và DB ---
const ROLES_UI = ["Sinh viên", "Giảng viên", "Trưởng bộ môn", "Phòng Đào Tạo", "HR", "Hiệu trưởng", "Admin"];

const mapRoleToDB = (uiRole: string) => {
  const mapping: Record<string, string> = {
    "Sinh viên": "SINH_VIEN", 
    "Giảng viên": "GIANG_VIEN", 
    "Trưởng bộ môn": "TRUONG_BO_MON",
    "Phòng Đào Tạo": "PHONG_DAO_TAO", 
    "HR": "HR", 
    "Hiệu trưởng": "HIEU_TRUONG", 
    "Admin": "ADMIN",
  };
  return mapping[uiRole] || "SINH_VIEN";
};

export default function HRDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("Tất cả");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRole, setNewRole] = useState<string>("Sinh viên");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const passwordMismatch = form.password !== "" && form.confirmPassword !== "" && form.password !== form.confirmPassword;

  // 1. Dùng useCallback để hàm load dữ liệu ổn định, không gây re-render vô tận
  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
    }
  }, []);

  // 2. Chạy async nội bộ trong useEffect để dứt điểm lỗi set-state-in-effect
  useEffect(() => {
    const initFetch = async () => {
      await loadUsers();
    };
    initFetch();
  }, [loadUsers]);

  // Logic tìm kiếm và lọc theo Role
  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "Tất cả" || u.role === mapRoleToDB(roleFilter);
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  // Thực hiện thêm mới User xuống Database
  const handleAddUser = async () => {
    if (!form.name || !form.email || !form.password || passwordMismatch) {
      alert("Vui lòng kiểm tra lại thông tin form!");
      return;
    }
    try {
      await createUser({
        username: form.email,
        fullName: form.name,
        role: mapRoleToDB(newRole),
        password: form.password,
      });
      await loadUsers(); // Refresh danh sách
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setShowAddDialog(false);
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tạo tài khoản!");
    }
  };

  // Thực hiện Khóa / Mở khóa tài khoản trực tiếp trên DB
  const handleToggleLock = async (id: number, currentStatus: string) => {
    try {
      await toggleUserStatus(id, currentStatus);
      await loadUsers(); // Refresh danh sách
    } catch (error) {
      console.error(error);
      alert("Lỗi cập nhật trạng thái!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Tiêu đề trang */}
      <div className="mb-8 flex items-center gap-3">
        <Users className="h-8 w-8 text-violet-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trang Nhân Sự — HR</h1>
          <p className="text-sm text-slate-500">Quản lý tài khoản hệ thống dữ liệu thực tế</p>
        </div>
      </div>

      {/* Khối thống kê (Stats) trực quan */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-slate-500">Tổng số tài khoản</p>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-emerald-600">Đang hoạt động</p>
            <p className="text-2xl font-bold text-emerald-700">{users.filter(u => u.status === "Hoạt động").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-red-600">Bị khóa / Vô hiệu hóa</p>
            <p className="text-2xl font-bold text-red-700">{users.filter(u => u.status === "Bị khóa").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Khu vực bảng danh sách */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Danh Sách Người Dùng</CardTitle>
          <div className="flex flex-wrap gap-2">
            {/* Thanh tìm kiếm */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-8 w-52" placeholder="Tìm tên / username..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Bộ lọc vai trò */}
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="Tất cả">Tất cả vai trò</option>
              {ROLES_UI.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {/* Nút kích hoạt Dialog */}
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setShowAddDialog(true)}>
              <PlusCircle className="mr-1 h-4 w-4" /> Tạo tài khoản
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Username / Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-slate-800">{u.fullName}</TableCell>
                  <TableCell className="text-slate-500">{u.username}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-100 text-slate-700">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === "Hoạt động" ? "default" : "destructive"}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleToggleLock(u.id, u.status)}>
                      {u.status === "Bị khóa" ? (
                        <>
                          <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" />
                          <span className="text-emerald-600">Mở khóa</span>
                        </>
                      ) : (
                        <>
                          <ShieldOff className="h-3 w-3 mr-1 text-red-600" />
                          <span className="text-red-600">Khóa</span>
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                    Không tìm thấy người dùng nào phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Dialog điền thông tin chi tiết đầy đủ của Toàn */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-violet-600" /> Tạo Tài Khoản Người Dùng
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Lựa chọn vai trò */}
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">Vai trò thành viên</Label>
              <div className="flex flex-wrap gap-1.5">
                {ROLES_UI.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNewRole(r)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      newRole === r
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Các trường nhập liệu */}
            <div className="grid gap-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" placeholder="VD: Nguyễn Văn A" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Username (Email đăng nhập)</Label>
              <Input id="email" type="email" placeholder="annguyen@lms.edu.vn" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu ban đầu</Label>
              <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              {passwordMismatch && (
                <p className="text-xs text-red-500 font-medium">Mật khẩu nhập lại chưa khớp trùng!</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setShowAddDialog(false)}>Hủy</Button>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={handleAddUser} disabled={passwordMismatch}>
              Xác nhận cấp thẻ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}