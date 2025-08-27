"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function EmployeeRegisterPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const validate = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("กรุณากรอกอีเมลที่ถูกต้อง");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/employees/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        await Swal.fire({
          icon: "success",
          title: "ส่งอีเมลสำเร็จ!",
          text: "กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันการลงทะเบียน",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#3b82f6",
        });
        router.push("/queueManagement");
      } else {
        setError(data.error || "เกิดข้อผิดพลาดในการส่งอีเมล");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
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
            <h1 className="text-2xl font-bold text-slate-900 mb-1">ลงทะเบียนพนักงาน</h1>
            <p className="text-slate-600 text-sm">กรอกอีเมลเพื่อเริ่มต้น — เติมข้อมูลที่เหลือทีหลังได้</p>
          </div>
        </motion.div>

        <motion.form onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">อีเมล</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                  error ? "border-red-300" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="example@company.com"
              />
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
            {isSubmitting ? "กำลังส่งอีเมล..." : "ส่งลิงก์ยืนยัน"}
          </motion.button>

          <div className="text-center text-sm text-slate-600">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/queueManagement/login" className="text-blue-500 font-medium">
              เข้าสู่ระบบ
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
