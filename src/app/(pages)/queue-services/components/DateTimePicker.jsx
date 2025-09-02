"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { th } from "date-fns/locale";
import { format, isSameDay } from "date-fns";
import { ArrowLeft, Wrench, Building, Smartphone, MapPin } from "lucide-react";
import DropDownComponent from "../../../components/DropDownComponent";

// --- DATA FOR LOCATIONS (can be moved to a separate constants file later) ---
const LOCATION_CATEGORIES = [
  { label: "ห้างสรรพสินค้า", value: "mall" },
  { label: "BTS (สายสุขุมวิท)", value: "bts_sukhumvit" },
];

const MALLS = [
  { label: "Siam Paragon", value: "siam_paragon" },
  { label: "CentralWorld", value: "central_world" },
  { label: "MBK Center", value: "mbk_center" },
  { label: "EmQuartier", value: "emquartier" },
  { label: "The Mall Bangkapi", value: "the_mall_bangkapi" },
  { label: "Fashion Island", value: "fashion_island" },
];

const BTS_SUKHUMVIT = [
  { label: "สถานีสยาม", value: "bts_siam" },
  { label: "สถานีชิดลม", value: "bts_chidlom" },
  { label: "สถานีเพลินจิต", value: "bts_ploenchit" },
  { label: "สถานีนานา", value: "bts_nana" },
  { label: "สถานีอโศก", value: "bts_asok" },
  { label: "สถานีพร้อมพงษ์", value: "bts_phrom_phong" },
  { label: "สถานีทองหล่อ", value: "bts_thong_lo" },
  { label: "สถานีเอกมัย", value: "bts_ekkamai" },
];

const LOCATION_DETAILS = {
  mall: MALLS,
  bts_sukhumvit: BTS_SUKHUMVIT,
};
// --- END OF DATA ---

const HOURS = Array.from({ length: 9 }, (_, i) => 11 + i);

const slotLabel = (startHour, duration = 1) =>
  `${String(startHour).padStart(2, "0")}:00-${String(startHour + duration).padStart(2, "0")}:00`;

export default function DateTimePicker({
  formData,
  setFormData,
  setAppState,
  selectedDate,
  setSelectedDate,
  daysList,
  availability,
  availabilityLoading,
  availabilityError,
}) {
  const [locationType, setLocationType] = useState(formData.appointmentType || "onsite");

  useEffect(() => {
    setFormData((prev) => ({ ...prev, appointmentType: locationType }));
  }, [locationType, setFormData]);

  // 2. HANDLERS FOR THE NEW DROPDOWNS
  const handleLocationCategorySelect = (category) => {
    setFormData((prev) => ({
      ...prev,
      locationCategory: category,
      locationDetail: null, // Reset detail when category changes
    }));
  };

  const handleLocationDetailSelect = (detail) => {
    setFormData((prev) => ({
      ...prev,
      locationDetail: detail,
    }));
  };

  const getSlotState = (day, slot) => {
    if (locationType === "offsite") {
      const offsiteData = availability?.summary?.OFFSITE_REFINANCE || { used: 0, cap: 1 };
      const { used, cap } = offsiteData;
      const full = used >= cap;
      return { used, cap, full, reason: full ? "คิวนอกสถานที่เต็มแล้ว" : "" };
    }

    const hour = HOURS[slot.startIndex];
    const availabilityForHour = availability?.[hour];
    if (!availabilityForHour) return { used: 0, cap: 0, full: true, reason: "กำลังตรวจสอบ..." };

    let slotData;
    switch (formData.serviceType) {
      case "รีไฟแนนซ์":
        slotData =
          locationType === "online"
            ? availabilityForHour.REFINANCE_ONLINE
            : availabilityForHour.REFINANCE;
        break;
      case "ซ่อมมือถือ":
        slotData = availabilityForHour.ENGINEER;
        break;
      default:
        slotData = availabilityForHour.GENERAL;
        break;
    }

    if (!slotData) return { used: 0, cap: 0, full: true, reason: "ไม่มีบริการนี้" };

    const { used, cap } = slotData;
    const full = used >= cap;
    let reason = "";
    if (full) reason = "คิวเต็มแล้ว";
    return { used, cap, full, reason };
  };

  const hourlySlots = useMemo(
    () => HOURS.map((h, i) => ({ startIndex: i, label: slotLabel(h, 1) })),
    [],
  );
  const onlineBookingSlots = useMemo(
    () => HOURS.slice(0, -1).map((h, i) => ({ startIndex: i, label: slotLabel(h, 2) })),
    [],
  );

  const handleBook = (day, slot) => {
    const selectedHour = HOURS[slot.startIndex];
    const appointmentDateTime = new Date(day);
    appointmentDateTime.setHours(selectedHour, 0, 0, 0);

    setFormData((prev) => ({ ...prev, appointmentAt: appointmentDateTime.toISOString() }));
    setAppState("user_details");
  };

  if (availabilityLoading) {
    return (
      <div className="p-10 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        กำลังตรวจสอบคิวว่าง...
      </div>
    );
  }

  if (availabilityError) {
    return (
      <div className="p-10 text-center text-red-600">
        เกิดข้อผิดพลาด: {availabilityError.message}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
      className="mx-auto flex w-full flex-col gap-4 sm:max-w-[480px]"
    >
      <div className="flex flex-col items-start gap-3">
        <button
          type="button"
          onClick={() => setAppState("selecting_service")}
          className="flex items-center gap-2 rounded-full border border-transparent bg-white/60 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4 text-indigo-600" /> กลับ
        </button>
        <div>
          <h1 className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-lg font-extrabold text-transparent sm:text-xl">
            ระบบจองคิวออนไลน์
          </h1>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-white/60 to-white/30 p-4 shadow-sm shadow-black/15">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">บริการ</div>
            <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <div className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                {formData.serviceType || "ไม่ระบุ"}
              </div>
              <div className="text-sm text-slate-500">({locationType})</div>
            </div>
          </div>
          <div className="text-right text-xs">
            <div>เวลาทำการ: 11:00 - 19:00</div>
            <div className="mt-1 flex items-center justify-end gap-1">
              <MapPin className="h-4 w-4 text-indigo-500" />{" "}
              <span className="pt-0.5">Center one</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {formData.serviceType === "รีไฟแนนซ์" && (
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">สถานที่</div>
            <div className="flex flex-wrap gap-2">
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
                      : "border border-stone-200 bg-white text-slate-700 hover:bg-slate-50"
                  } flex items-center gap-2`}
                >
                  {opt.key === "offsite" && (
                    <Wrench
                      className={`h-4 w-4 ${locationType === opt.key ? "text-white" : "text-purple-600"}`}
                    />
                  )}
                  {opt.key === "onsite" && (
                    <Building
                      className={`h-4 w-4 ${locationType === opt.key ? "text-white" : "text-blue-600"}`}
                    />
                  )}
                  {opt.key === "online" && (
                    <Smartphone
                      className={`h-4 w-4 ${locationType === opt.key ? "text-white" : "text-green-600"}`}
                    />
                  )}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* ========= 3. NEW LOCATION SELECTION SECTION ========= */}
        {/* ================================================== */}
        {formData.serviceType === "รีไฟแนนซ์" && locationType === "offsite" && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 rounded-2xl bg-white/60 p-4 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-slate-700">เลือกสถานที่นัดหมาย</h3>
            <DropDownComponent
              label="หมวดหมู่สถานที่"
              options={LOCATION_CATEGORIES}
              selectedOption={formData.locationCategory}
              onSelect={handleLocationCategorySelect}
              placeholder="เลือกประเภทสถานที่"
            />
            {formData.locationCategory && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                <DropDownComponent
                  label="ระบุสถานที่"
                  options={LOCATION_DETAILS[formData.locationCategory.value] || []}
                  selectedOption={formData.locationDetail}
                  onSelect={handleLocationDetailSelect}
                  placeholder="เลือกสถานที่"
                  disabled={!formData.locationCategory}
                />
              </motion.div>
            )}
          </motion.div>
        )}
        {/* ================================================== */}
        {/* ================ END OF NEW SECTION ================ */}
        {/* ================================================== */}
      </div>

      <div className="rounded-2xl">
        <div className="text-sm font-semibold text-slate-700">เลือกวัน (ภายใน 7 วันถัดไป)</div>
        <div className="flex gap-2 overflow-x-scroll p-2" role="list" aria-label="เลือกวัน">
          {daysList.map((d) => {
            const active = isSameDay(d, selectedDate);
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDate(d)}
                className={`flex h-16 w-16 flex-shrink-0 snap-center flex-col items-center justify-center gap-1.5 rounded-2xl border border-stone-200 text-center text-sm font-medium transition sm:w-20 ${
                  active
                    ? "bg-gradient-to-b from-blue-500 to-indigo-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="text-lg leading-none font-semibold">
                  {format(d, "d", { locale: th })}
                </div>
                <div className="mt-1 text-xs opacity-70">{format(d, "eee", { locale: th })}</div>
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
        <div className={`font-mono text-xs ${full ? "text-red-600" : "text-slate-600"}`}>
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
            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm hover:opacity-95"
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
      <div className={`font-mono text-xs ${full ? "text-red-600" : "text-slate-600"}`}>
        {full ? "เต็ม" : `${used}/${cap}`}
      </div>
      <button
        onClick={() => onBook(date, slot)}
        disabled={full}
        className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
          full
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm hover:opacity-95"
        }`}
      >
        {full ? "เต็ม" : "จองคิว"}
      </button>
    </div>
  );
}
