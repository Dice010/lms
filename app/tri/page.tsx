"use client";

import { useState } from "react";
import GiangVienDashboard from "@/features/GiangVienDashboard";
import SinhVienDashboard  from "@/features/SinhVienDashboard";

type Tab = "giang-vien" | "sinh-vien";

export default function TriPage() {
  const [activeTab, setActiveTab] = useState<Tab>("giang-vien");

  const tabs: { key: Tab; label: string }[] = [
    { key: "giang-vien", label: "📚 Giảng Viên" },
    { key: "sinh-vien",  label: "🎓 Sinh Viên"  },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-52 shrink-0 border-r border-slate-200 bg-white pt-8 px-3">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Vai trò
        </p>
        <div className="flex flex-col gap-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`w-full rounded-md px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "giang-vien" && <GiangVienDashboard />}
        {activeTab === "sinh-vien"  && <SinhVienDashboard />}
      </div>
    </div>
  );
}