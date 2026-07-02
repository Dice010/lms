"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, PlusCircle, LogOut, RefreshCw, ShieldOff,
  ShieldCheck, Search, ChevronDown,
} from "lucide-react";

// ------------------------------------
// Types & Mock Data
// ------------------------------------
type UserRole = "Sinh viên" | "Giảng viên" | "TBM" | "PDT";
type AccountStatus = "Hoạt động" | "Bị khóa" | "Chờ kích hoạt";

interface UserAccount {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  lastLogin: string;
}

const fakeUsers: UserAccount[] = [
  { id: 1,  name: "Nguyễn Thị Mai",    email: "mai.nguyen@sv.lms.edu.vn",   role: "Sinh viên",  status: "Hoạt động",     createdAt: "2025-01-05", lastLogin: "2025-06-20" },
  { id: 2,  name: "Trần Văn Hùng",     email: "hung.tran@sv.lms.edu.vn",    role: "Sinh viên",  status: "Hoạt động",     createdAt: "2025-01-05", lastLogin: "2025-06-22" },
  { id: 3,  name: "Lê Quang Khải",     email: "khai.le@gv.lms.edu.vn",      role: "Giảng viên", status: "Hoạt động",     createdAt: "2024-09-01", lastLogin: "2025-06-21" },
  { id: 4,  name: "Phạm Thị Dung",     email: "dung.pham@gv.lms.edu.vn",    role: "Giảng viên", status: "Bị khóa",       createdAt: "2024-09-01", lastLogin: "2025-04-10" },
  { id: 5,  name: "Hoàng Minh Tuấn",   email: "tuan.hoang@tbm.lms.edu.vn",  role: "TBM",        status: "Hoạt động",     createdAt: "2024-08-15", lastLogin: "2025-06-19" },
  { id: 6,  name: "Võ Thị Lan",        email: "lan.vo@pdt.lms.edu.vn",      role: "PDT",        status: "Hoạt động",     createdAt: "2024-08-10", lastLogin: "2025-06-18" },
  { id: 7,  name: "Bùi Đức Thắng",     email: "thang.bui@sv.lms.edu.vn",    role: "Sinh viên",  status: "Chờ kích hoạt", createdAt: "2025-06-25", lastLogin: "—" },
];

const ROLES: UserRole[] = ["Sinh viên", "Giảng viên", "TBM", "PDT"];

// ------------------------------------
// Helpers
// ------------------------------------
function StatusBadge({ status }: { status: AccountStatus }) {
  const map: Record<AccountStatus, "default" | "secondary" | "destructive" | "outline"> = {
    "Hoạt động":     "default",
    "Bị khóa":       "destructive",
    "Chờ kích hoạt": "secondary",
  };
  return <Badge variant={map[status]}>{status}</Badge>;
}

function RoleBadge({ role }: { role: UserRole }) {
  const colors: Record<UserRole, string> = {
    "Sinh viên":  "bg-blue-100 text-blue-700",
    "Giảng viên": "bg-purple-100 text-purple-700",
    "TBM":        "bg-amber-100 text-amber-700",
    "PDT":        "bg-teal-100 text-teal-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[role]}`}>
      {role}
    </span>
  );
}

// ------------------------------------
// Main Component
// ------------------------------------
export default function HRDashboard() {
  const [users, setUsers]               = useState<UserAccount[]>(fakeUsers);
  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState<string>("Tất cả");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRole, setNewRole]           = useState<UserRole>("Sinh viên");
  const [form, setForm] = useState({ name: "", email: "", mssv: "", password: "", confirmPassword: "" });
  const passwordMismatch = form.password !== "" && form.confirmPassword !== "" && form.password !== form.confirmPassword;

  // Active tab: user list | account status


  /* ---- Computed ---- */
  const filtered = users.filter(u => {
    const matchRole   = roleFilter === "Tất cả" || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase())
                     || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  /* ---- Handlers ---- */
  const handleAddUser = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) return;
    if (form.password !== form.confirmPassword) return;
    const newUser: UserAccount = {
      id: users.length + 1,
      name: form.name,
      email: form.email,
      role: newRole,
      status: "Chờ kích hoạt",
      createdAt: new Date().toISOString().slice(0, 10),
      lastLogin: "—",
    };
    setUsers([...users, newUser]);
    setForm({ name: "", email: "", mssv: "", password: "", confirmPassword: "" });
    setShowAddDialog(false);
  };

  const handleForceLogout = (id: number) => {
    // In real app: call API to invalidate session
    alert(`Đã force logout user #${id}`);
  };

  const handleToggleLock = (id: number) => {
    setUsers(users.map(u =>
      u.id === id
        ? { ...u, status: u.status === "Bị khóa" ? "Hoạt động" : "Bị khóa" }
        : u
    ));
  };

  const handleActivate = (id: number) => {
    setUsers(users.map(u =>
      u.id === id ? { ...u, status: "Hoạt động" } : u
    ));
  };

  /* ---- Stats ---- */
  const stats = [
    { label: "Tổng tài khoản",  value: users.length },
    { label: "Đang hoạt động",  value: users.filter(u => u.status === "Hoạt động").length },
    { label: "Bị khóa",         value: users.filter(u => u.status === "Bị khóa").length },
    { label: "Chờ kích hoạt",   value: users.filter(u => u.status === "Chờ kích hoạt").length },
  ];

  /* ---- Render ---- */
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Users className="h-8 w-8 text-violet-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trang Nhân Sự — HR</h1>
          <p className="text-sm text-slate-500">Quản lý tài khoản & phân quyền người dùng LMS</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="flex flex-col gap-1 p-4">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-3xl font-bold text-slate-800">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quản Lý Tài Khoản — 1 bảng duy nhất */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Quản Lý Tài Khoản</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-8 w-52" placeholder="Tìm tên / email..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="relative">
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className="appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 pr-8 text-sm">
                <option>Tất cả</option>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700"
              onClick={() => setShowAddDialog(true)}>
              <PlusCircle className="mr-1 h-4 w-4" /> Tạo tài khoản
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="text-slate-400">{u.id}</TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{u.email}</TableCell>
                  <TableCell><RoleBadge role={u.role} /></TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell className="text-slate-400 text-sm">{u.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {u.status === "Hoạt động" && (
                        <Button size="sm" variant="outline" onClick={() => handleForceLogout(u.id)}>
                          <LogOut className="mr-1 h-3 w-3" /> Logout
                        </Button>
                      )}
                      {u.status === "Chờ kích hoạt" && (
                        <Button size="sm" variant="outline"
                          className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          onClick={() => handleActivate(u.id)}>
                          <RefreshCw className="mr-1 h-3 w-3" /> Kích hoạt
                        </Button>
                      )}
                      {u.status !== "Chờ kích hoạt" && (
                        <Button size="sm" variant="outline"
                          className={u.status === "Bị khóa"
                            ? "text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            : "text-red-600 border-red-300 hover:bg-red-50"}
                          onClick={() => handleToggleLock(u.id)}>
                          {u.status === "Bị khóa"
                            ? <><ShieldCheck className="mr-1 h-3 w-3" /> Mở khóa</>
                            : <><ShieldOff className="mr-1 h-3 w-3" /> Vô hiệu hóa</>}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-slate-400">
                    Không tìm thấy tài khoản nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog: Tạo tài khoản mới */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo Tài Khoản Người Dùng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Role select */}
            <div className="space-y-1">
              <Label>Vai trò</Label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(r => (
                  <button
                    key={r}
                    onClick={() => setNewRole(r)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
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

            <div className="space-y-1">
              <Label htmlFor="hr-name">Họ tên</Label>
              <Input id="hr-name" placeholder="Nguyễn Văn A"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="hr-email">Email</Label>
              <Input id="hr-email" type="email" placeholder="example@lms.edu.vn"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            {/* MSSV only for Sinh viên */}
            {newRole === "Sinh viên" && (
              <div className="space-y-1">
                <Label htmlFor="hr-mssv">MSSV</Label>
                <Input id="hr-mssv" placeholder="22110XXX"
                  value={form.mssv} onChange={e => setForm({ ...form, mssv: e.target.value })} />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="hr-password">Mật khẩu</Label>
              <Input id="hr-password" type="password" placeholder="Nhập mật khẩu"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="hr-confirm-password">Xác nhận mật khẩu</Label>
              <Input id="hr-confirm-password" type="password" placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              {passwordMismatch && (
                <p className="text-xs text-red-500">Mật khẩu xác nhận không khớp</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Hủy</Button>
            <Button className="bg-violet-600 hover:bg-violet-700"
              disabled={!form.name || !form.email || !form.password || !form.confirmPassword || passwordMismatch}
              onClick={handleAddUser}>
              Tạo tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
