"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function QueuePublicPage() {
  const [appointments, setAppointments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      // normalize: if API returns nested arrays, flatten to 1D
      const flat = Array.isArray(data) ? data.flat(Infinity) : [];
      setAppointments(flat);
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header
          className="flex flex-col items-start
        gap-6 mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold">ตารางคิว </h1>
            <p className="text-sm text-slate-600">หน้านี้แสดงสถานะคิวแบบอ่านอย่างเดียว</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/queueManagement/login" className="text-sm text-blue-600  bg-blue-500/10 px-3 py-2 rounded-lg">
              สำหรับผู้ดูแล (เข้าสู่ระบบ)
            </Link>
            <Link
              href="/queueManagement/register"
              className="text-sm text-slate-600  bg-slate-100 px-3 py-2 rounded-lg"
            >
              ลงทะเบียนพนักงาน
            </Link>
          </div>
        </header>

        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={fetchAppointments}
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-sm"
          >
            รีเฟรช
          </button>
          <div className="text-sm text-slate-500">ข้อมูลแสดงได้เท่าที่ระบบเผยแพร่ — ไม่มีการแก้ไขจากที่นี่</div>
        </div>

        <section className="space-y-4">
          {loading && <div className="p-6 bg-white rounded-xl shadow-sm">กำลังโหลดคิว...</div>}
          {error && <div className="p-6 bg-red-50 text-red-700 rounded-xl">{error}</div>}

          {!loading && !error && (!appointments || appointments.length === 0) && (
            <div className="p-6 bg-white rounded-xl shadow-sm text-slate-600">ยังไม่มีการนัดหมาย</div>
          )}

          {!loading && !error && appointments && appointments.length > 0 && (
            <div className="grid gap-4">
              {appointments.map((a) => {
                const date = new Date(a.date || a.appointmentAt || a.createdAt || null);
                const shortCustomer = a.customer?.fullname || a.lineDisplayName || a.customerName || "ลูกค้า";
                const obscuredCustomer = shortCustomer.split(" ")[0]?.slice(0, 1) + "***";
                return (
                  <article
                    key={a.id ?? `${a.customerId}-${a.date}`}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm text-slate-500">{a.note || a.serviceType || "การนัดหมาย"}</div>
                      <div className="text-lg font-semibold text-slate-900">
                        {date instanceof Date && !isNaN(date.getTime())
                          ? date.toLocaleDateString("th-TH", { month: "short", day: "numeric" }) +
                            " " +
                            date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </div>
                      <div className="text-sm text-slate-500">ลูกค้า: {obscuredCustomer}</div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
                        {a.type || a.appointmentType || a.type}
                      </div>
                      <div className="mt-2 text-xs text-slate-400">สถานะ: {a.status || "PENDING"}</div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-8 text-xs text-slate-500">
          หมายเหตุ: หน้านี้เป็นแบบอ่านอย่างเดียวและเหมาะสำหรับแชร์ลิงก์ให้ลูกค้า
        </footer>
      </div>
    </main>
  );
}
