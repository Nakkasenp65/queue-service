"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

export default function VerifyPage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("ไม่พบโทเค็นการยืนยัน");
      return;
    }

    handleVerify();
  }, [token]);

  const handleVerify = async () => {
    try {
      const response = await fetch("/api/employees/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "การยืนยันล้มเหลว");
        return;
      }

      // Success - show success message and redirect
      setStatus("success");
      setMessage(data.message);

      // Show success alert
      await Swal.fire({
        title: "ยืนยันสำเร็จ!",
        text: "กำลังเปลี่ยนเส้นทางไปยังโปรไฟล์...",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // Redirect to profile page after short delay
      setTimeout(() => {
        router.push(data.redirectTo || "/queueManagement/profile");
      }, 1000);
    } catch (error) {
      setStatus("error");
      setMessage("เกิดข้อผิดพลาดในการยืนยัน");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-xl font-semibold text-slate-900 mb-2">กำลังยืนยันอีเมล...</h1>
              <p className="text-slate-600">กรุณารอสักครู่</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="text-green-500 text-4xl mb-4">✅</div>
              <h1 className="text-xl font-semibold text-slate-900 mb-2">ยืนยันสำเร็จ!</h1>
              <p className="text-slate-600">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <h1 className="text-xl font-semibold text-slate-900 mb-2">การยืนยันล้มเหลว</h1>
              <p className="text-slate-600 mb-4">{message}</p>
              <button
                onClick={() => router.push("/queueManagement/register")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ลองใหม่
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
