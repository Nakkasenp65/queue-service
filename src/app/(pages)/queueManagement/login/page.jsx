"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }), // Keep email field for API compatibility
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "เข้าสู่ระบบล้มเหลว");
        return;
      }

      // Success: Cookie is set by the server, redirect to admin
      router.push("/queueManagement/admin");
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link
            href="/queueManagement"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </Link>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">เข้าสู่ระบบผู้ดูแล</h1>
            <p className="text-slate-600 text-sm">เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านจากระบบกลาง</p>
          </div>
        </motion.div>

        <motion.form onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ชื่อผู้ใช้</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                      error ? "border-red-300" : "border-slate-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="ชื่อผู้ใช้"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">รหัสผ่าน</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                      error ? "border-red-300" : "border-slate-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="รหัสผ่าน"
                  />
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              isSubmitting
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            } text-white`}
          >
            {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </motion.button>

          <div className="text-center text-sm text-slate-600">
            ยังไม่มีบัญชี?{" "}
            <Link href="/queueManagement/register" className="text-blue-500 font-medium">
              ลงทะเบียนพนักงาน
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
