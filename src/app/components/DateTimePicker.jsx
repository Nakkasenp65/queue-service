"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { th } from "date-fns/locale";
import { addDays, format, isSameDay } from "date-fns";

// Mock data and constants
const mockAppointments = [
  { id: "apt001", type: "onsite", startDateTime: new Date("2025-08-25T11:00:00") },
  { id: "apt002", type: "offsite", startDateTime: new Date("2025-08-25T09:00:00") },
  { id: "apt003", type: "online", startDateTime: new Date("2025-08-25T11:00:00") },
  { id: "apt004", type: "onsite", startDateTime: new Date("2025-08-25T15:00:00") },
];
const HOURS = Array.from({ length: 9 }, (_, i) => 11 + i);
// Services that require specific employees
const EMPLOYEE_REQUIRED_SERVICES = ["รีไฟแนนซ์", "ซ่อมมือถือ"];

const CAPACITY = {
  // Services requiring employees
  REFINANCE: {
    onsite: 3, // Max 3 customers per hour
    online: 1, // Online needs 2 consecutive slots
    offsite: 1, // 1 visit per day
  },
  REPAIR: {
    onsite: 3, // Max 3 repairs per hour
  },
  // General services (no specific employee needed)
  GENERAL: {
    onsite: 5, // Can handle more customers simultaneously
  },
};
const STAFF_COUNT = 1;
const today = new Date();
const daysList = Array.from({ length: 7 }, (_, i) => addDays(today, i));
const slotLabel = (startHour, duration = 1) =>
  `${String(startHour).padStart(2, "0")}:00-${String(startHour + duration).padStart(2, "0")}:00`;

function buildMatricesForRange(appointments, daysList) {
  const keyOf = (d) => format(d, "yyyy-MM-dd");
  const keys = daysList.map(keyOf);
  const indexByKey = new Map(keys.map((k, i) => [k, i]));
  const countsOnsite = Array.from({ length: daysList.length }, () => Array(HOURS.length).fill(0));
  const countsOnline = Array.from({ length: daysList.length }, () => Array(HOURS.length).fill(0));
  const offsiteDaily = Array.from({ length: daysList.length }, () => 0);
  appointments.forEach((apt) => {
    const dateKey = format(apt.startDateTime, "yyyy-MM-dd");
    const dayIndex = indexByKey.get(dateKey);
    if (dayIndex === undefined) return;
    if (apt.type === "offsite") {
      offsiteDaily[dayIndex] += 1;
      return;
    }
    const startHour = apt.startDateTime.getHours();
    const i = startHour - HOURS[0];
    if (i < 0 || i >= HOURS.length) return;
    if (apt.type === "onsite") {
      countsOnsite[dayIndex][i] += 1;
    } else if (apt.type === "online") {
      countsOnline[dayIndex][i] += 1;
      if (i + 1 < HOURS.length) countsOnline[dayIndex][i + 1] += 1;
    }
  });
  return { countsOnsite, countsOnline, offsiteDaily };
}

export default function DateTimePicker({ formData, setFormData, setAppState }) {
  if (!formData) return null;
  const getInitialServiceType = () => {
    return formData.serviceType === "รีไฟแนนซ์" ? "onsite" : "onsite";
  };

  const [serviceType, setServiceType] = useState(getInitialServiceType());
  const [selectedDate, setSelectedDate] = useState(daysList[0]);

  const { countsOnsite, countsOnline, offsiteDaily } = useMemo(
    () => buildMatricesForRange(mockAppointments, daysList),
    []
  );

  const getSlotState = (day, slot) => {
    const dayIndex = daysList.findIndex((d) => isSameDay(d, day));
    const i = slot.startIndex;

    // Check if this service requires an employee
    const requiresEmployee = EMPLOYEE_REQUIRED_SERVICES.includes(formData.serviceType);

    // Get capacity based on service type
    const getServiceCapacity = () => {
      if (formData.serviceType === "รีไฟแนนซ์") {
        return CAPACITY.REFINANCE;
      }
      if (formData.serviceType === "ซ่อมมือถือ") {
        return CAPACITY.REPAIR;
      }
      return CAPACITY.GENERAL;
    };

    const currentCapacity = getServiceCapacity();

    // Refinance-specific logic for offsite
    if (formData.serviceType === "รีไฟแนนซ์" && serviceType === "offsite") {
      const used = offsiteDaily[dayIndex] || 0;
      const cap = currentCapacity.offsite;
      return { used, cap, full: used >= cap, reason: used >= cap ? "คิวเต็มแล้ว" : "" };
    }

    // For services requiring employees
    if (requiresEmployee) {
      // Only count appointments for services that need employees
      const relevantOnsite = countsOnsite[dayIndex]?.[i] || 0;
      const relevantOnline = countsOnline[dayIndex]?.[i] || 0;
      const totalEmployeeBookings = relevantOnsite + relevantOnline;

      // Online booking for Refinance
      if (formData.serviceType === "รีไฟแนนซ์" && serviceType === "online") {
        if (i >= HOURS.length - 1) {
          return { used: 1, cap: 1, full: true, reason: "ต้องจองล่วงหน้า 2 ชั่วโมง" };
        }

        const nextSlotBookings = (countsOnsite[dayIndex]?.[i + 1] || 0) + (countsOnline[dayIndex]?.[i + 1] || 0);
        const onlineUsed = Math.max(countsOnline[dayIndex]?.[i] || 0, countsOnline[dayIndex]?.[i + 1] || 0);

        if (onlineUsed >= currentCapacity.online) {
          return { used: onlineUsed, cap: currentCapacity.online, full: true, reason: "คิวออนไลน์เต็มแล้ว" };
        }

        const isFull = totalEmployeeBookings >= currentCapacity.onsite || nextSlotBookings >= currentCapacity.onsite;
        return {
          used: onlineUsed,
          cap: currentCapacity.online,
          full: isFull,
          reason: isFull ? "พนักงานไม่ว่างในช่วงเวลานี้" : "",
        };
      }

      // Regular onsite booking for employee-required services
      return {
        used: totalEmployeeBookings,
        cap: currentCapacity.onsite,
        full: totalEmployeeBookings >= currentCapacity.onsite,
        reason: totalEmployeeBookings >= currentCapacity.onsite ? "พนักงานไม่ว่างในช่วงเวลานี้" : "",
      };
    }
    // For general services (no employee required)
    const generalUsed = countsOnsite[dayIndex]?.[i] || 0;
    return {
      used: generalUsed,
      cap: currentCapacity.onsite,
      full: generalUsed >= currentCapacity.onsite,
      reason: generalUsed >= currentCapacity.onsite ? "คิวเต็มแล้ว" : "",
    };

    if (STAFF_COUNT <= 1) {
      const totalUsedCurrent = (countsOnsite[dayIndex]?.[i] || 0) + (countsOnline[dayIndex]?.[i] || 0);
      if (serviceType === "onsite") {
        const cap = currentCapacity.onsite || 0;
        const full = totalUsedCurrent >= cap;
        return { used: totalUsedCurrent, cap, full, reason: full ? "คิวเต็มแล้ว" : "" };
      }
      if (serviceType === "online" && formData.serviceType === "รีไฟแนนซ์") {
        if (i >= HOURS.length - 1) return { used: 1, cap: 1, full: true, reason: "ต้องใช้ 2 ชั่วโมง" };
        const onlineUsed = Math.max(countsOnline[dayIndex]?.[i] || 0, countsOnline[dayIndex]?.[i + 1] || 0);
        const onlineCap = currentCapacity.online || 0;
        const onsiteCap = currentCapacity.onsite || 0;
        if (onlineUsed >= onlineCap)
          return { used: onlineUsed, cap: onlineCap, full: true, reason: "คิวออนไลน์เต็มแล้ว" };
        const totalUsedNext = (countsOnsite[dayIndex]?.[i + 1] || 0) + (countsOnline[dayIndex]?.[i + 1] || 0);
        if (totalUsedCurrent >= onsiteCap)
          return { used: onlineUsed, cap: onlineCap, full: true, reason: `เวลา ${HOURS[i]}:00 ไม่ว่าง` };
        if (totalUsedNext >= onsiteCap)
          return { used: onlineUsed, cap: onlineCap, full: true, reason: `เวลา ${HOURS[i + 1]}:00 ไม่ว่าง` };
        return { used: onlineUsed, cap: onlineCap, full: false, reason: "" };
      }
    }

    // Logic for separate resources (STAFF_COUNT > 1)
    if (serviceType === "onsite") {
      const used = countsOnsite[dayIndex]?.[i] || 0;
      const cap = currentCapacity.onsite || 0;
      const full = used >= cap;
      return { used, cap, full, reason: full ? "คิวเต็มแล้ว" : "" };
    }
    if (serviceType === "online" && formData.serviceType === "รีไฟแนนซ์") {
      if (i >= HOURS.length - 1) return { used: 1, cap: 1, full: true, reason: "ต้องใช้ 2 ชั่วโมง" };
      const used = Math.max(countsOnline[dayIndex]?.[i] || 0, countsOnline[dayIndex]?.[i + 1] || 0);
      const cap = currentCapacity.online || 0;
      const full = used >= cap;
      return { used, cap, full, reason: full ? "คิวออนไลน์เต็มแล้ว" : "" };
    }
    return { used: 0, cap: 0, full: true, reason: "ไม่เปิดให้บริการ" };
  };

  const hourlySlots = useMemo(() => {
    return HOURS.map((h, i) => ({ startIndex: i, label: slotLabel(h, 1) }));
  }, []);

  const onlineBookingSlots = useMemo(() => {
    return HOURS.slice(0, -1).map((h, i) => {
      const slot = { startIndex: i, label: slotLabel(h, 2) };
      const state = getSlotState(selectedDate, slot);
      return { ...slot, state };
    });
  }, [selectedDate, countsOnline, countsOnsite, serviceType, formData.serviceType]);

  const handleBook = (day, slot) => {
    // Calculate the actual hour from the slot
    let selectedHour;

    if (slot.isFullDay || serviceType === "offsite") {
      // For offsite/full day appointments, use a default time (e.g., 9 AM)
      selectedHour = 9;
    } else {
      // For onsite and online, use the actual hour from HOURS array
      // HOURS = [11, 12, 13, 14, 15, 16, 17, 18, 19] (11 AM to 7 PM)
      selectedHour = HOURS[slot.startIndex];
    }

    // Create the full datetime
    const appointmentDateTime = new Date(day);
    appointmentDateTime.setHours(selectedHour, 0, 0, 0);

    // Update formData with selected date and time
    setFormData((prev) => ({
      ...prev,
      appointmentAt: appointmentDateTime.toISOString(),
      appointmentType: serviceType,
    }));

    console.log("Selected appointment details:");
    console.log("- Service type:", serviceType);
    console.log("- Slot:", slot);
    console.log("- Selected hour:", selectedHour);
    console.log("- Full datetime:", appointmentDateTime.toISOString());

    // Move to user details form
    setAppState("user_details");
  };
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
          className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          ← กลับ
        </button>
        <h1 className="text-xl font-semibold">ระบบจองคิวออนไลน์</h1>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm text-slate-500">บริการ</div>
        <div className="mt-1 text-lg font-semibold">
          {formData.serviceType} ({serviceType})
        </div>
        <div className="mt-2 text-xs text-slate-500">
          {serviceType === "onsite" && "สูงสุด 3 คน/ชม."}
          {serviceType === "online" && "1 คิว = 2 ชั่วโมง"}
          {serviceType === "offsite" && "จำกัดวันละ 1 คิว"}
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
                  onClick={() => setServiceType(opt.key)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    serviceType === opt.key
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
        {serviceType === "offsite" && (
          <TimeRowFullDay date={selectedDate} getSlotState={getSlotState} onBook={handleBook} />
        )}
        {serviceType === "onsite" && (
          <div className="space-y-2">
            {hourlySlots.map((slot) => {
              const state = getSlotState(selectedDate, slot);
              return (
                <TimeSlotRow key={slot.label} slot={slot} state={state} onBook={() => handleBook(selectedDate, slot)} />
              );
            })}
          </div>
        )}
        {serviceType === "online" && (
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
