"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MagicVerifyPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    if (!token) {
      setStatus("missing");
      return;
    }

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus("failed");
          return;
        }
        // store session token and redirect to admin
        localStorage.setItem("admin_token", data.token);
        router.replace("/queueManagement/admin");
      } catch (err) {
        setStatus("failed");
      }
    }

    verify();
  }, [token, router]);

  if (status === "pending") return <div className="p-6">กำลังยืนยัน ลิงก์...</div>;
  if (status === "missing") return <div className="p-6 text-red-600">ไม่มี token ใน URL</div>;
  if (status === "failed") return <div className="p-6 text-red-600">ลิงก์ไม่ถูกต้องหรือหมดอายุ</div>;

  return null;
}
