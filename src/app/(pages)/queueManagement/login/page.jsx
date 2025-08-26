"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Placeholder: store a fake token and redirect to admin
    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    localStorage.setItem("admin_token", "demo-token");
    router.push("/queueManagement/admin");
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-xl font-bold mb-2">เข้าสู่ระบบผู้ดูแล</h1>
        <p className="text-sm text-slate-500 mb-4">หน้าเข้าสู่ระบบแบบง่าย — จะเชื่อมกับระบบจริงภายหลัง</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="อีเมล"
            className="w-full p-3 border rounded-xl"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="รหัสผ่าน"
            type="password"
            className="w-full p-3 border rounded-xl"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex items-center justify-between">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl">
              เข้าสู่ระบบ
            </button>
            <Link href="/queueManagement/register" className="text-sm text-slate-600 underline">
              ลงทะเบียนพนักงาน
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
