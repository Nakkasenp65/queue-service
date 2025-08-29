"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { th } from "date-fns/locale";
import { addDays, format, isSameDay } from "date-fns";
import { ArrowLeft, Wrench, Building, Smartphone, Calendar, MapPin, ChevronsRight } from "lucide-react";
import { useGetAvailability } from "../hooks/useAppointments";

const HOURS = Array.from({ length: 9 }, (_, i) => 11 + i);
const today = new Date();
const daysList = Array.from({ length: 7 }, (_, i) => addDays(today, i));

const slotLabel = (startHour, duration = 1) =>
  `${String(startHour).padStart(2, "0")}:00-${String(startHour + duration).padStart(2, "0")}:00`;

export default function DateTimePicker({ formData, setFormData, setAppState }) {
  const [locationType, setLocationType] = useState(formData.appointmentType || "onsite");
  const [selectedDate, setSelectedDate] = useState(daysList[0]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, appointmentType: locationType }));
  }, [locationType, setFormData]);

  const { data: availability, isLoading, error } = useGetAvailability(selectedDate);

  // ========================================================================
  // --- การเปลี่ยนแปลงที่สำคัญอยู่ตรงนี้ ---
  // ========================================================================
  const getSlotState = (day, slot) => {
    // (สำคัญ) จัดการคิวนอกสถานที่ (Offsite) ก่อนเป็นกรณีพิเศษ
    if (locationType === "offsite") {
      // ดึงข้อมูลสรุปของทั้งวันจาก `availability.summary`
      const offsiteData = availability?.summary?.OFFSITE_REFINANCE || { used: 0, cap: 1 };
      const { used, cap } = offsiteData;
      const full = used >= cap;
      return { used, cap, full, reason: full ? "คิวนอกสถานที่เต็มแล้ว" : "" };
    }

    // Logic เดิมสำหรับคิวรายชั่วโมง (Onsite, Online)
    const hour = HOURS[slot.startIndex];
    const availabilityForHour = availability?.[hour];

    if (!availabilityForHour) {
      return { used: 0, cap: 0, full: true, reason: "กำลังตรวจสอบ..." };
    }

    let slotData;
    switch (formData.serviceType) {
      case "รีไฟแนนซ์":
        if (locationType === "online") {
          slotData = availabilityForHour.REFINANCE_ONLINE;
        } else {
          slotData = availabilityForHour.REFINANCE;
        }
        break;
      case "ซ่อมมือถือ":
        slotData = availabilityForHour.ENGINEER;
        break;
      default:
        slotData = availabilityForHour.GENERAL;
        break;
    }

    if (!slotData) {
      return { used: 0, cap: 0, full: true, reason: "ไม่มีบริการนี้" };
    }

    const { used, cap } = slotData;
    const full = used >= cap;

    let reason = "";
    if (full) {
      if (formData.serviceType === "ซ่อมมือถือ" && cap === 0) {
        reason = "มีงานซ่อมด่วน";
      } else if (formData.serviceType === "รีไฟแนนซ์" && locationType === "online" && cap === 0) {
        reason = "พนักงานไม่พอสำหรับคิวออนไลน์";
      } else {
        reason = "คิวเต็มแล้ว";
      }
    }

    return { used, cap, full, reason };
  };

  // ========================================================================

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

    setFormData((prev) => ({
      ...prev,
      appointmentAt: appointmentDateTime.toISOString(),
    }));
    setAppState("user_details");
  };

  if (isLoading) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        กำลังตรวจสอบคิวว่าง...
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">เกิดข้อผิดพลาดในการตรวจสอบคิว: {error.message}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
      className="mx-auto w-full max-w-full sm:max-w-[480px] space-y-4 p-4 sm:p-5 rounded-3xl     "
    >
      <div className="flex flex-col items-start gap-3">
        <button
          type="button"
          onClick={() => setAppState("selecting_service")}
          className="rounded-full border border-transparent px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 bg-white/60"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600" /> กลับ
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
            ระบบจองคิวออนไลน์
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">เลือกวันและเวลาที่สะดวก</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-white/60 to-white/30 p-4 border-stone-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">บริการ</div>
            <div className="mt-1 text-lg font-semibold text-slate-900 flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold">
                {formData.serviceType || "ไม่ระบุ"}
              </div>
              <div className="text-sm text-slate-500">({locationType})</div>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>เวลาทำการ: 11:00 - 19:00</div>
            <div className="mt-1 flex items-center justify-end gap-2">
              <MapPin className="w-4 h-4 text-indigo-500" /> <span>สาขาหลัก</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {formData.serviceType === "รีไฟแนนซ์" && (
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">สถานที่</div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "offsite", label: "นอกสถานที่" },
                { key: "onsite", label: "ที่ร้าน" },
                { key: "online", label: "ออนไลน์" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setLocationType(opt.key)}
                  aria-pressed={locationType === opt.key}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    locationType === opt.key
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-stone-200"
                  } flex items-center gap-2`}
                >
                  {opt.key === "offsite" && (
                    <Wrench className={`w-4 h-4 ${locationType === opt.key ? "text-white" : "text-purple-600"}`} />
                  )}
                  {opt.key === "onsite" && (
                    <Building className={`w-4 h-4 ${locationType === opt.key ? "text-white" : "text-blue-600"}`} />
                  )}
                  {opt.key === "online" && (
                    <Smartphone className={`w-4 h-4 ${locationType === opt.key ? "text-white" : "text-green-600"}`} />
                  )}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl ">
        <div className="text-sm font-semibold text-slate-700">เลือกวัน (ภายใน 7 วันถัดไป)</div>
        <div className="flex gap-2 overflow-x-scroll p-2" role="list" aria-label="เลือกวัน">
          {daysList.map((d) => {
            const active = isSameDay(d, selectedDate);
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDate(d)}
                className={`flex-shrink-0 snap-center w-16 sm:w-20 h-16 rounded-2xl text-center text-sm font-medium transition flex flex-col items-center justify-center gap-1.5 border border-stone-200 ${
                  active
                    ? "bg-gradient-to-b from-blue-500 to-indigo-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="leading-none text-lg font-semibold">{format(d, "d", { locale: th })}</div>
                <div className="mt-1 opacity-70 text-xs">{format(d, "eee", { locale: th })}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-slate-700">ช่วงเวลานัดจอง</div>
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
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-stone-200 bg-white/80 p-3 shadow-sm">
      <div className="text-sm font-medium text-slate-900">{slot.label}</div>
      <div className="text-right">
        <div className={`text-xs font-mono ${full ? "text-red-600" : "text-slate-600"}`}>
          {full ? "เต็ม" : `${used}/${cap}`}
        </div>
        {full && reason && <div className="text-[10px] text-slate-400">{reason}</div>}
      </div>
      <button
        onClick={onBook}
        disabled={full}
        className={`w-20 rounded-lg px-2 py-1.5 text-sm font-semibold transition ${
          full
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-95 shadow-sm"
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
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-xl border border-stone-200 bg-white/80 p-3 shadow-sm">
      <div className="text-sm font-medium text-slate-900">ทั้งวัน</div>
      <div className={`text-xs font-mono ${full ? "text-red-600" : "text-slate-600"}`}>
        {full ? "เต็ม" : `${used}/${cap}`}
      </div>
      <button
        onClick={() => onBook(date, slot)}
        disabled={full}
        className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
          full
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-95 shadow-sm"
        }`}
      >
        {full ? "เต็ม" : "จองคิว"}
      </button>
    </div>
  );
}
