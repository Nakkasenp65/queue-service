"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { th } from "date-fns/locale";
import { addDays, format, isSameDay } from "date-fns";
import { useGetAppointments } from "../hooks/useAppointments";
import { ArrowLeft } from "lucide-react";

const HOURS = Array.from({ length: 9 }, (_, i) => 11 + i);
const today = new Date("2025-08-26");
const daysList = Array.from({ length: 7 }, (_, i) => addDays(today, i));
const dailyEmployees = [
  { id: "emp02", name: "Jane (Engineer)", tags: ["ENGINEER"] },
  { id: "emp03", name: "Alex (All-rounder)", tags: ["REFINANCE", "GENERAL"] },
  { id: "emp04", name: "Bob (General)", tags: ["GENERAL"] },
];
const slotLabel = (startHour, duration = 1) =>
  `${String(startHour).padStart(2, "0")}:00-${String(startHour + duration).padStart(2, "0")}:00`;

function checkRefinanceAvailability(jobs, allEmployees, locationType) {
  const refinanceSpecialists = allEmployees.filter((e) => e.tags.includes("REFINANCE"));
  const busyEmployeeIds = new Set(jobs.map((j) => j.employeeId).filter(Boolean));
  const freeRefinanceEmployees = refinanceSpecialists.filter((e) => !busyEmployeeIds.has(e.id));
  const onlineJobCount = jobs.filter((j) => j.type === "ONLINE").length;
  const onsiteJobCount = jobs.filter((j) => j.type === "ONSITE").length;

  if (locationType === "online") {
    const cap = 1;
    if (onlineJobCount >= cap) {
      return { isAvailable: false, reason: "คิวออนไลน์เต็มแล้ว", stats: { used: onlineJobCount, cap } };
    }
    if (freeRefinanceEmployees.length === 0) {
      return { isAvailable: false, reason: "พนักงาน Refinance เต็ม", stats: { used: onlineJobCount, cap } };
    }
    if (freeRefinanceEmployees.length === 1 && onsiteJobCount >= 3) {
      return { isAvailable: false, reason: "พนักงานไม่ว่าง", stats: { used: onlineJobCount, cap } };
    }
    return { isAvailable: true, reason: "", stats: { used: onlineJobCount, cap } };
  }

  if (locationType === "onsite") {
    const cap = 3;
    if (onsiteJobCount >= cap) {
      return { isAvailable: false, reason: "คิวหน้าร้านเต็ม", stats: { used: onsiteJobCount, cap } };
    }
    if (freeRefinanceEmployees.length === 0) {
      return { isAvailable: false, reason: "พนักงาน Refinance เต็ม", stats: { used: onsiteJobCount, cap } };
    }
    if (freeRefinanceEmployees.length === 1 && onlineJobCount >= 1) {
      return { isAvailable: false, reason: "พนักงานติดคิวออนไลน์", stats: { used: onsiteJobCount, cap } };
    }
    return { isAvailable: true, reason: "", stats: { used: onsiteJobCount, cap } };
  }

  return { isAvailable: true, reason: "", stats: { used: 0, cap: 1 } };
}

function checkMaintenanceAvailability(jobs, allEmployees) {
  const maintenanceSpecialists = allEmployees.filter((e) => e.tags.includes("ENGINEER"));
  const busyEmployeeIds = new Set(jobs.map((j) => j.employeeId).filter(Boolean));
  const freeMaintenanceEmployees = maintenanceSpecialists.filter((e) => !busyEmployeeIds.has(e.id));

  if (freeMaintenanceEmployees.length === 0) {
    return {
      isAvailable: false,
      reason: "ช่างซ่อมไม่ว่าง",
      stats: { used: jobs.length, cap: maintenanceSpecialists.length },
    };
  }
  if (jobs.some((job) => job.priority === "HARD")) {
    return {
      isAvailable: false,
      reason: "มีงานซ่อมด่วนอยู่",
      stats: { used: jobs.length, cap: maintenanceSpecialists.length },
    };
  }
  return { isAvailable: true, reason: "", stats: { used: jobs.length, cap: maintenanceSpecialists.length } };
}

export default function DateTimePicker({ formData, setFormData, setAppState }) {
  const { data: appointments, isLoading, error, refetch, createAppointment, isCreating } = useGetAppointments({});

  const [locationType, setLocationType] = useState("onsite");
  const [selectedDate, setSelectedDate] = useState(daysList[0]);

  const getSlotState = (day, slot) => {
    const dayIndex = daysList.findIndex((d) => isSameDay(d, day));
    const i = slot.startIndex;
    const jobs = appointments?.[dayIndex]?.[i] || [];

    let result;
    switch (formData.serviceType) {
      case "รีไฟแนนซ์":
        if (locationType === "offsite") {
          const offsiteJobsToday = 0; // Placeholder
          return {
            used: offsiteJobsToday,
            cap: 1,
            full: offsiteJobsToday >= 1,
            reason: offsiteJobsToday >= 1 ? "คิวนอกสถานที่เต็ม" : "",
          };
        }
        // Pass the current locationType to the logic function
        result = checkRefinanceAvailability(jobs, dailyEmployees, locationType);
        return { used: result.stats.used, cap: result.stats.cap, full: !result.isAvailable, reason: result.reason };

      case "ซ่อมมือถือ":
        result = checkMaintenanceAvailability(jobs, dailyEmployees);
        return { used: result.stats.used, cap: result.stats.cap, full: !result.isAvailable, reason: result.reason };

      default:
        const cap = 5;
        const full = jobs.length >= cap;
        return { used: jobs.length, cap, full, reason: full ? "คิวเต็มแล้ว" : "" };
    }
  };

  const hourlySlots = useMemo(() => HOURS.map((h, i) => ({ startIndex: i, label: slotLabel(h, 1) })), []);
  const onlineBookingSlots = useMemo(
    () =>
      HOURS.slice(0, -1).map((h, i) => ({
        startIndex: i,
        label: slotLabel(h, 2),
        state: getSlotState(selectedDate, { startIndex: i }),
      })),
    [selectedDate, locationType, formData.serviceType, appointments]
  );

  const handleBook = async (day, slot) => {
    // Choose a sensible hour for full-day bookings (first hour in HOURS)
    const selectedHour = slot.isFullDay ? HOURS[0] : HOURS[slot.startIndex];
    const appointmentDateTime = new Date(day);
    appointmentDateTime.setHours(selectedHour, 0, 0, 0);

    // Update form state with chosen time & type
    setFormData((prev) => ({
      ...prev,
      appointmentAt: appointmentDateTime.toISOString(),
      appointmentType: locationType,
    }));

    // If we already have a lineUserId, attempt to create the appointment immediately
    if (formData?.lineUserId) {
      try {
        const day = format(appointmentDateTime, "yyyy-MM-dd");
        const section = String(appointmentDateTime.getHours());

        await createAppointment({
          customerName: formData.customerName || "",
          customerPhone: formData.customerPhone || "",
          lineUserId: formData.lineUserId,
          lineDisplayName: formData.lineDisplayName || "",
          lineProfilePicUrl: formData.lineProfilePicUrl || "",
          appointmentAt: appointmentDateTime.toISOString(),
          serviceType: formData.serviceType,
          appointmentType: locationType,
          note: `Service: ${formData.serviceType}`,
          day,
          section,
        });

        // Navigate to appointment status view on success
        setAppState("appointment_status");
      } catch (err) {
        console.error("Failed to create appointment:", err);
        // If creation fails, drop the user into details so they can retry or correct info
        setAppState("user_details");
      }
      return;
    }

    // Otherwise, open the user details form so we can collect identity before creating
    setAppState("user_details");
  };

  if (isLoading) return <div className="text-center p-10">กำลังโหลดข้อมูลคิว...</div>;
  if (error) return <div className="text-center p-10 text-red-600">เกิดข้อผิดพลาด: {error.message}</div>;
  if (!formData) return null;

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
        <div className="mt-2 text-xs text-slate-500">
          {locationType === "onsite" && "สูงสุด 3 คน/ชม."}
          {locationType === "online" && "1 คิว = 2 ชั่วโมง"}
          {locationType === "offsite" && "จำกัดวันละ 1 คิว"}
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
                state={slot.state}
                onBook={() => handleBook(selectedDate, slot)}
              />
            ))}
          </div>
        )}
        <p className="text-[11px] text-slate-500">* ใช้ตารางชั่วโมงเดียวกันทั้งหมด แต่ logic การจองต่างกัน</p>
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
  const { used, cap, full } = getSlotState(date, slot);
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
