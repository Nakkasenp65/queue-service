"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { th } from "date-fns/locale";
import { addDays, format, isSameDay } from "date-fns";
import { ArrowLeft } from "lucide-react";
// 1. Import Hook ใหม่สำหรับดึงข้อมูลคิวว่าง
import { useGetAvailability } from "../hooks/useAppointments";

const HOURS = Array.from({ length: 9 }, (_, i) => 11 + i); // 11:00 - 19:00
const today = new Date(); // ใช้วันที่ปัจจุบันเสมอ
const daysList = Array.from({ length: 7 }, (_, i) => addDays(today, i));

// ฟังก์ชันสำหรับสร้าง Label ของ Slot เวลา
const slotLabel = (startHour, duration = 1) =>
  `${String(startHour).padStart(2, "0")}:00-${String(startHour + duration).padStart(2, "0")}:00`;

export default function DateTimePicker({ formData, setFormData, setAppState }) {
  const [locationType, setLocationType] = useState(formData.appointmentType || "onsite"); // Sync with formData
  const [selectedDate, setSelectedDate] = useState(daysList[0]);

  // Update formData when locationType changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      appointmentType: locationType,
    }));
  }, [locationType, setFormData]);

  // 2. เรียกใช้ Hook ใหม่เพื่อดึงข้อมูลคิวว่างจาก Backend ตามวันที่เลือก
  const { data: availability, isLoading, error } = useGetAvailability(selectedDate);

  // 3. สร้างฟังก์ชัน getSlotState ใหม่ที่อ่านข้อมูลจาก `availability` ที่ได้จาก Backend
  const getSlotState = (day, slot) => {
    const hour = HOURS[slot.startIndex];
    const jobsForHour = availability?.[hour];

    // ถ้ายังไม่มีข้อมูลจาก Backend หรือเกิด Error ให้ถือว่าคิวเต็มไปก่อน
    if (!jobsForHour) {
      return { used: 0, cap: 0, full: true, reason: "กำลังตรวจสอบ..." };
    }

    switch (formData.serviceType) {
      case "รีไฟแนนซ์": {
        if (locationType === "offsite") {
          // สมมติว่า Backend ส่งจำนวนคิวนอกสถานที่ทั้งหมดของวันมาให้
          const offsiteJobsToday = availability?.summary?.REFINANCE?.offsite || 0;
          const cap = 1;
          const full = offsiteJobsToday >= cap;
          return { used: offsiteJobsToday, cap, full, reason: full ? "คิวนอกสถานที่เต็ม" : "" };
        }
        const used = jobsForHour.REFINANCE?.[locationType] || 0;
        const cap = locationType === "onsite" ? 3 : 1;
        const full = used >= cap;
        return { used, cap, full, reason: full ? "คิวเต็ม" : "" };
      }
      case "ซ่อมมือถือ": {
        const used = jobsForHour.ENGINEER?.onsite || 0;
        const cap = 1; // สมมติว่ามีช่างคนเดียว
        const full = used >= cap;
        return { used, cap, full, reason: full ? "ช่างไม่ว่าง" : "" };
      }
      default: {
        const used = jobsForHour.GENERAL?.onsite || 0;
        const cap = 5;
        const full = used >= cap;
        return { used, cap, full, reason: full ? "คิวเต็ม" : "" };
      }
    }
  };

  // useMemo ช่วยให้คำนวณค่าใหม่ต่อเมื่อ dependencies เปลี่ยนเท่านั้น
  const hourlySlots = useMemo(() => HOURS.map((h, i) => ({ startIndex: i, label: slotLabel(h, 1) })), []);
  const onlineBookingSlots = useMemo(
    () =>
      HOURS.slice(0, -1).map((h, i) => ({
        startIndex: i,
        label: slotLabel(h, 2),
      })),
    []
  );

  const handleBook = (day, slot) => {
    const selectedHour = HOURS[slot.startIndex];
    const appointmentDateTime = new Date(day);
    appointmentDateTime.setHours(selectedHour, 0, 0, 0);

    // อัปเดต formData ด้วยวันที่และเวลาที่เลือกล่าสุด
    setFormData((prev) => ({
      ...prev,
      appointmentAt: appointmentDateTime.toISOString(),
      appointmentType: locationType,
    }));

    // ไปยังหน้าถัดไป (กรอกข้อมูลผู้ใช้)
    setAppState("user_details");
  };

  // แสดง Loading UI ขณะกำลังดึงข้อมูลคิวว่าง
  if (isLoading) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        กำลังตรวจสอบคิวว่าง...
      </div>
    );
  }

  // แสดง Error UI ถ้าดึงข้อมูลคิวว่างไม่สำเร็จ
  if (error) {
    return <div className="text-center p-10 text-red-600">เกิดข้อผิดพลาดในการตรวจสอบคิว: {error.message}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
      className="mx-auto w-full max-w-[420px] space-y-5"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAppState("selecting_service")}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> กลับ
        </button>
        <h1 className="text-xl font-semibold">ระบบจองคิวออนไลน์</h1>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm text-slate-500">บริการ</div>
        <div className="mt-1 text-lg font-semibold">
          {formData.serviceType} ({locationType})
        </div>
      </div>
      <div className="space-y-4">
        {formData.serviceType === "รีไฟแนนซ์" && (
          <div>
            <div className="mb-2 text-sm font-semibold">สถานที่</div>
            <div className="flex gap-2">
              {[
                { key: "offsite", label: "นอกสถานที่" },
                { key: "onsite", label: "ที่ร้าน" },
                { key: "online", label: "ออนไลน์" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setLocationType(opt.key)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    locationType === opt.key
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold">เลือกวัน (ภายใน 7 วันถัดไป)</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {daysList.map((d) => {
            const active = isSameDay(d, selectedDate);
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDate(d)}
                className={`min-w-12 rounded-xl px-3 py-2 text-center text-sm transition ${
                  active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <div className="leading-none">{format(d, "d", { locale: th })}</div>
                <div className="mt-1 text-[10px] opacity-70">{format(d, "eee", { locale: th })}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-sm font-semibold">ช่วงเวลานัดจอง</div>
        {locationType === "offsite" && (
          <TimeRowFullDay date={selectedDate} getSlotState={getSlotState} onBook={handleBook} />
        )}
        {locationType === "onsite" && (
          <div className="space-y-2">
            {hourlySlots.map((slot) => (
              <TimeSlotRow
                key={slot.label}
                slot={slot}
                state={getSlotState(selectedDate, slot)}
                onBook={() => handleBook(selectedDate, slot)}
              />
            ))}
          </div>
        )}
        {locationType === "online" && (
          <div className="space-y-2">
            {onlineBookingSlots.map((slot) => (
              <TimeSlotRow
                key={slot.label}
                slot={slot}
                state={getSlotState(selectedDate, slot)}
                onBook={() => handleBook(selectedDate, slot)}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TimeSlotRow({ slot, state, onBook }) {
  const { used, cap, full, reason } = state;
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-sm font-medium">{slot.label}</div>
      <div className="text-right">
        <div className={`text-xs ${full ? "text-red-600" : "text-slate-600"}`}>{full ? "เต็ม" : `${used}/${cap}`}</div>
        {full && reason && <div className="text-[10px] text-slate-400">{reason}</div>}
      </div>
      <button
        onClick={onBook}
        disabled={full}
        className={`w-20 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
          full ? "cursor-not-allowed bg-slate-100 text-slate-400" : "bg-slate-900 text-white hover:opacity-90"
        }`}
      >
        {full ? "เต็ม" : "จองคิว"}
      </button>
    </div>
  );
}

function TimeRowFullDay({ date, getSlotState, onBook }) {
  const slot = { startIndex: 0, label: "ทั้งวัน", isFullDay: true };
  const { used, cap, full, reason } = getSlotState(date, slot);
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-sm font-medium">ทั้งวัน</div>
      <div className={`text-xs ${full ? "text-red-600" : "text-slate-600"}`}>{full ? "เต็ม" : `${used}/${cap}`}</div>
      <button
        onClick={() => onBook(date, slot)}
        disabled={full}
        className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
          full ? "cursor-not-allowed bg-slate-100 text-slate-400" : "bg-slate-900 text-white hover:opacity-90"
        }`}
      >
        {full ? "เต็ม" : "จองคิว"}
      </button>
    </div>
  );
}
