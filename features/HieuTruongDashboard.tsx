"use client";

import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap, BookOpen, PlusCircle, CheckCircle,
  XCircle, Eye, Users, Settings, LogOut, RefreshCw, ShieldOff,
  Search, ChevronDown, ShieldCheck,
} from "lucide-react";

// ------------------------------------
// Mock Data — Tài khoản cấp cao
// ------------------------------------
const fakeHighLevelAccounts = [
  { id: 1, name: "Nguyễn Văn An",  role: "Hiệu trưởng", email: "an.nguyen@lms.edu.vn",   createdAt: "2025-01-10" },
  { id: 2, name: "Trần Thị Bình",  role: "HR",           email: "binh.tran@lms.edu.vn",   createdAt: "2025-02-14" },
  { id: 3, name: "Lê Minh Cường",  role: "HR",           email: "cuong.le@lms.edu.vn",    createdAt: "2025-03-01" },
];

// ------------------------------------
// Mock Data — Môn học đề xuất
// ------------------------------------
const fakeCourseProposals = [
  { id: 1, code: "CS301", name: "Trí Tuệ Nhân Tạo",        credits: 3, department: "Khoa CNTT",      proposedBy: "TBM Nguyễn Hữu Đức",  description: "Giới thiệu các khái niệm cơ bản về AI, machine learning và deep learning.", submittedAt: "2025-06-10", status: "Chờ duyệt" },
  { id: 2, code: "SE401", name: "Kiến Trúc Phần Mềm",      credits: 4, department: "Khoa Phần Mềm",  proposedBy: "TBM Trần Văn Minh",    description: "Các mẫu thiết kế kiến trúc phần mềm hiện đại: Microservices, Event-Driven.", submittedAt: "2025-06-15", status: "Chờ duyệt" },
  { id: 3, code: "DS201", name: "Khoa Học Dữ Liệu Cơ Bản", credits: 3, department: "Khoa CNTT",      proposedBy: "TBM Lê Thị Hoa",       description: "Phân tích và trực quan hóa dữ liệu với Python và Pandas.", submittedAt: "2025-05-20", status: "Đã duyệt"  },
  { id: 4, code: "NW102", name: "Mạng Máy Tính Nâng Cao",  credits: 3, department: "Khoa Mạng",      proposedBy: "TBM Phạm Quốc Bảo",   description: "Giao thức mạng nâng cao, bảo mật mạng, SDN và NFV.", submittedAt: "2025-05-28", status: "Từ chối"   },
];

// ------------------------------------
// Mock Data — Người dùng hệ thống (Sinh viên, GV, TBM, PDT)
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
  { id: 1, name: "Nguyễn Thị Mai",  email: "mai.nguyen@sv.lms.edu.vn",  role: "Sinh viên",  status: "Hoạt động",     createdAt: "2025-01-05", lastLogin: "2025-06-20" },
  { id: 2, name: "Trần Văn Hùng",   email: "hung.tran@sv.lms.edu.vn",   role: "Sinh viên",  status: "Hoạt động",     createdAt: "2025-01-05", lastLogin: "2025-06-22" },
  { id: 3, name: "Lê Quang Khải",   email: "khai.le@gv.lms.edu.vn",     role: "Giảng viên", status: "Hoạt động",     createdAt: "2024-09-01", lastLogin: "2025-06-21" },
  { id: 4, name: "Phạm Thị Dung",   email: "dung.pham@gv.lms.edu.vn",   role: "Giảng viên", status: "Bị khóa",       createdAt: "2024-09-01", lastLogin: "2025-04-10" },
  { id: 5, name: "Hoàng Minh Tuấn", email: "tuan.hoang@tbm.lms.edu.vn", role: "TBM",        status: "Hoạt động",     createdAt: "2024-08-15", lastLogin: "2025-06-19" },
  { id: 6, name: "Võ Thị Lan",      email: "lan.vo@pdt.lms.edu.vn",     role: "PDT",        status: "Hoạt động",     createdAt: "2024-08-10", lastLogin: "2025-06-18" },
  { id: 7, name: "Bùi Đức Thắng",   email: "thang.bui@sv.lms.edu.vn",   role: "Sinh viên",  status: "Chờ kích hoạt", createdAt: "2025-06-25", lastLogin: "—" },
];

const ROLES: UserRole[] = ["Sinh viên", "Giảng viên", "TBM", "PDT"];

type Account     = (typeof fakeHighLevelAccounts)[0];
type Proposal    = (typeof fakeCourseProposals)[0];
type MainTab      = "accounts" | "courses" | "manage";

// ------------------------------------
// Helpers
// ------------------------------------
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    "Chờ duyệt": "secondary",
    "Đã duyệt":  "default",
    "Từ chối":   "destructive",
    "Hoạt động": "default",
    "Bị khóa": "destructive",
    "Chờ kích hoạt": "secondary",
  };
  return <Badge variant={map[status] ?? "outline"}>{status}</Badge>;
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
export default function HieuTruongDashboard() {
  const [accounts, setAccounts]     = useState<Account[]>(fakeHighLevelAccounts);
  const [proposals, setProposals]   = useState<Proposal[]>(fakeCourseProposals);
  const [users, setUsers]           = useState<UserAccount[]>(fakeUsers);
  const [activeTab, setActiveTab]   = useState<MainTab>("accounts");
  const [manageSubTab, setManageSubTab] = useState<"list" | "status">("list");

  // Account dialog (tài khoản cấp cao)
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Hiệu trưởng", password: "", confirmPassword: "" });
  const accountPasswordMismatch = form.password !== "" && form.confirmPassword !== "" && form.password !== form.confirmPassword;

  // Course dialog
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  // User dialog (Sinh viên / GV / TBM / PDT)
  const [search, setSearch]               = useState("");
  const [roleFilter, setRoleFilter]       = useState<string>("Tất cả");
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newRole, setNewRole]             = useState<UserRole>("Sinh viên");
  const [userForm, setUserForm] = useState({ name: "", email: "", mssv: "", password: "", confirmPassword: "" });
  const passwordMismatch = userForm.password !== "" && userForm.confirmPassword !== "" && userForm.password !== userForm.confirmPassword;

  /* ---- Handlers: Tài khoản cấp cao ---- */
  const handleAddAccount = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) return;
    if (form.password !== form.confirmPassword) return;
    setAccounts([...accounts, {
      id: accounts.length + 1,
      name: form.name, email: form.email, role: form.role,
      createdAt: new Date().toISOString().slice(0, 10),
    }]);
    setForm({ name: "", email: "", role: "Hiệu trưởng", password: "", confirmPassword: "" });
    setShowAddAccount(false);
  };

  /* ---- Handlers: Môn học ---- */
  const handleApprove = (id: number) => {
    setProposals(proposals.map(p => p.id === id ? { ...p, status: "Đã duyệt" } : p));
    setShowCourseDetail(false);
  };

  const handleReject = (id: number) => {
    setProposals(proposals.map(p => p.id === id ? { ...p, status: "Từ chối" } : p));
    setRejectNote("");
    setShowCourseDetail(false);
  };

  const filteredProposals = filterStatus === "Tất cả"
    ? proposals : proposals.filter(p => p.status === filterStatus);

  /* ---- Handlers: Người dùng hệ thống ---- */
  const filteredUsers = users.filter(u => {
    const matchRole   = roleFilter === "Tất cả" || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase())
                     || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleAddUser = () => {
    if (!userForm.name || !userForm.email || !userForm.password || !userForm.confirmPassword) return;
    if (userForm.password !== userForm.confirmPassword) return;
    setUsers([...users, {
      id: users.length + 1,
      name: userForm.name,
      email: userForm.email,
      role: newRole,
      status: "Chờ kích hoạt",
      createdAt: new Date().toISOString().slice(0, 10),
      lastLogin: "—",
    }]);
    setUserForm({ name: "", email: "", mssv: "", password: "", confirmPassword: "" });
    setShowAddUserDialog(false);
  };

  const handleForceLogout = (id: number) => {
    alert(`Đã force logout user #${id}`);
  };

  const handleToggleLock = (id: number) => {
    setUsers(users.map(u =>
      u.id === id ? { ...u, status: u.status === "Bị khóa" ? "Hoạt động" : "Bị khóa" } : u
    ));
  };

  const handleActivate = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: "Hoạt động" } : u));
  };

  /* ---- Stats ---- */
  const stats = [
    { label: "Tài khoản cấp cao", value: accounts.length,                                       icon: <Users className="h-5 w-5 text-indigo-500" /> },
    { label: "Môn học chờ duyệt", value: proposals.filter(p => p.status === "Chờ duyệt").length, icon: <BookOpen className="h-5 w-5 text-amber-500" /> },
    { label: "Tổng người dùng",   value: users.length,                                           icon: <Users className="h-5 w-5 text-blue-500" /> },
    { label: "Bị khóa",           value: users.filter(u => u.status === "Bị khóa").length,        icon: <ShieldOff className="h-5 w-5 text-red-500" /> },
  ];

  /* ---- Render ---- */
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trang Hiệu Trưởng</h1>
          <p className="text-sm text-slate-500">Hệ Thống Quản Lý Học Tập (LMS) — Toàn quyền hệ thống</p>
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
      <div className="mb-4 flex flex-wrap gap-2">
        {([
          { key: "accounts", label: "Tài Khoản Cấp Cao",  icon: <Settings className="h-4 w-4" /> },
          { key: "courses",  label: "Phê Duyệt Môn Học",  icon: <BookOpen className="h-4 w-4" /> },
          { key: "manage",   label: "Quản Lý Tài Khoản",  icon: <Users className="h-4 w-4" /> },
        ] as { key: MainTab; label: string; icon: React.ReactNode }[]).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "bg-emerald-600 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Tab: Tài khoản cấp cao */}
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
                  <TableHead>#</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map(acc => (
                  <TableRow key={acc.id}>
                    <TableCell className="text-slate-400">{acc.id}</TableCell>
                    <TableCell className="font-medium">{acc.name}</TableCell>
                    <TableCell>
                      <Badge variant={acc.role === "Hiệu trưởng" ? "default" : "secondary"}>
                        {acc.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">{acc.email}</TableCell>
                    <TableCell className="text-slate-400">{acc.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab: Phê duyệt môn học */}
      {activeTab === "courses" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Danh Sách Môn Học Đề Xuất</CardTitle>
            <div className="flex gap-2">
              {["Tất cả", "Chờ duyệt", "Đã duyệt", "Từ chối"].map(f => (
                <button key={f} onClick={() => setFilterStatus(f)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    filterStatus === f
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}>{f}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã MH</TableHead>
                  <TableHead>Tên môn học</TableHead>
                  <TableHead>Tín chỉ</TableHead>
                  <TableHead>Đề xuất bởi</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.code}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-center">{p.credits}</TableCell>
                    <TableCell className="text-slate-500">{p.proposedBy}</TableCell>
                    <TableCell className="text-slate-400 text-sm">{p.submittedAt}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline"
                          onClick={() => { setSelectedProposal(p); setShowCourseDetail(true); }}>
                          <Eye className="mr-1 h-3 w-3" /> Xem
                        </Button>
                        {p.status === "Chờ duyệt" && (
                          <>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(p.id)}>Từ chối</Button>
                            <Button size="sm" onClick={() => handleApprove(p.id)}>Duyệt</Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProposals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-slate-400">
                      Không có đề xuất nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab: Quản lý tài khoản (gộp Danh sách + Trạng thái) */}
      {activeTab === "manage" && (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button onClick={() => setManageSubTab("list")}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  manageSubTab === "list"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>Danh Sách</button>
              <button onClick={() => setManageSubTab("status")}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  manageSubTab === "status"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>Trạng Thái</button>
            </div>
            {manageSubTab === "list" && (
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
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setShowAddUserDialog(true)}>
                  <PlusCircle className="mr-1 h-4 w-4" /> Tạo tài khoản
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {manageSubTab === "list" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Đăng nhập cuối</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="text-slate-400">{u.id}</TableCell>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-slate-500 text-sm">{u.email}</TableCell>
                      <TableCell><RoleBadge role={u.role} /></TableCell>
                      <TableCell><StatusBadge status={u.status} /></TableCell>
                      <TableCell className="text-slate-400 text-sm">{u.createdAt}</TableCell>
                      <TableCell className="text-slate-400 text-sm">{u.lastLogin}</TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-slate-400">
                        Không tìm thấy tài khoản nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
            {manageSubTab === "status" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Đăng nhập cuối</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell><RoleBadge role={u.role} /></TableCell>
                      <TableCell><StatusBadge status={u.status} /></TableCell>
                      <TableCell className="text-slate-400 text-sm">{u.lastLogin}</TableCell>
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
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog: Thêm tài khoản cấp cao */}
      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent>
          <DialogHeader><DialogTitle>Khởi Tạo Tài Khoản Cấp Cao</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Họ tên</Label>
              <Input placeholder="Nguyễn Văn X" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input placeholder="example@lms.edu.vn" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Vai trò</Label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                <option>Hiệu trưởng</option>
                <option>HR</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ht-acc-password">Mật khẩu</Label>
              <Input id="ht-acc-password" type="password" placeholder="Nhập mật khẩu"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ht-acc-confirm-password">Xác nhận mật khẩu</Label>
              <Input id="ht-acc-confirm-password" type="password" placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              {accountPasswordMismatch && <p className="text-xs text-red-500">Mật khẩu xác nhận không khớp</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAccount(false)}>Hủy</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!form.name || !form.email || !form.password || !form.confirmPassword || accountPasswordMismatch}
              onClick={handleAddAccount}>Tạo tài khoản</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Chi tiết môn học */}
      <Dialog open={showCourseDetail} onOpenChange={setShowCourseDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Chi Tiết Đề Xuất Môn Học</DialogTitle></DialogHeader>
          {selectedProposal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 text-sm">
                {[
                  ["Mã môn học", selectedProposal.code],
                  ["Số tín chỉ", String(selectedProposal.credits)],
                  ["Khoa", selectedProposal.department],
                  ["Đề xuất bởi", selectedProposal.proposedBy],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="font-medium text-slate-700">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-slate-400 uppercase tracking-wide">Tên môn học</p>
                <p className="text-lg font-semibold text-slate-800">{selectedProposal.name}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-slate-400 uppercase tracking-wide">Mô tả</p>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedProposal.description}</p>
              </div>
              {selectedProposal.status === "Chờ duyệt" && (
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Ghi chú từ chối (nếu có)</Label>
                  <Textarea placeholder="Lý do từ chối..." value={rejectNote}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectNote(e.target.value)} rows={3} />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Trạng thái:</span>
                <StatusBadge status={selectedProposal.status} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCourseDetail(false)}>Đóng</Button>
            {selectedProposal?.status === "Chờ duyệt" && (
              <>
                <Button variant="destructive" onClick={() => handleReject(selectedProposal.id)}>
                  <XCircle className="mr-1 h-4 w-4" /> Từ chối
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(selectedProposal.id)}>
                  <CheckCircle className="mr-1 h-4 w-4" /> Phê duyệt
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Tạo tài khoản người dùng (Sinh viên / GV / TBM / PDT) */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tạo Tài Khoản Người Dùng</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Vai trò</Label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(r => (
                  <button key={r} onClick={() => setNewRole(r)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      newRole === r ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="admin-user-name">Họ tên</Label>
              <Input id="admin-user-name" placeholder="Nguyễn Văn A"
                value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="admin-user-email">Email</Label>
              <Input id="admin-user-email" type="email" placeholder="example@lms.edu.vn"
                value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
            </div>

            {newRole === "Sinh viên" && (
              <div className="space-y-1">
                <Label htmlFor="admin-user-mssv">MSSV</Label>
                <Input id="admin-user-mssv" placeholder="22110XXX"
                  value={userForm.mssv} onChange={e => setUserForm({ ...userForm, mssv: e.target.value })} />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="admin-user-password">Mật khẩu</Label>
              <Input id="admin-user-password" type="password" placeholder="Nhập mật khẩu"
                value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="admin-user-confirm-password">Xác nhận mật khẩu</Label>
              <Input id="admin-user-confirm-password" type="password" placeholder="Nhập lại mật khẩu"
                value={userForm.confirmPassword} onChange={e => setUserForm({ ...userForm, confirmPassword: e.target.value })} />
              {passwordMismatch && <p className="text-xs text-red-500">Mật khẩu xác nhận không khớp</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>Hủy</Button>
            <Button
              disabled={!userForm.name || !userForm.email || !userForm.password || !userForm.confirmPassword || passwordMismatch}
              className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddUser}>
              Tạo tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
