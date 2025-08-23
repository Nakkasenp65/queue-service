"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, startOfDay, add, setHours, setMinutes, isSameDay, isBefore } from "date-fns";
import { th } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

// --- Import Component และ Data ---
import DropdownComponent from "./DropDownComponent";
import { mallOptions, btsStations } from "@/lib/locationData";

const fetcher = (url) => fetch(url).then((res) => res.json());

// --- ฟังก์ชันสร้างช่วงเวลา (คงไว้เหมือนเดิม) ---
const generateTimeSlots = (selectedDate, appointmentType, existingAppointments) => {
  if (!selectedDate) return [];
  const now = new Date();
  const startHour = 9;
  const endHour = 17;
  const slots = [];
  const duration = appointmentType === "in-store" ? 1 : 4;
  for (let hour = startHour; hour < endHour; hour += duration) {
    const slotStartTime = setMinutes(setHours(startOfDay(selectedDate), hour), 0);
    const isPast = isBefore(slotStartTime, now);
    const isBooked = existingAppointments.some((appt) => {
      const apptDate = new Date(appt.appointmentAt);
      return isSameDay(apptDate, selectedDate) && apptDate.getHours() === hour;
    });
    slots.push({
      time: format(slotStartTime, "HH:mm"),
      dateTime: slotStartTime,
      isAvailable: !isBooked && !isPast,
    });
  }
  return slots;
};

export default function DateTimePicker({ formData, setFormData, setAppState }) {
  const [selectedDay, setSelectedDay] = useState(new Date());

  // State สำหรับจัดการการเลือกประเภทย่อยของ off-site
  const [offSiteCategory, setOffSiteCategory] = useState(null); // 'online' | 'location'
  const [locationCategory, setLocationCategory] = useState(null); // 'mall' | 'bts'

  const { data: availabilityData, error } = useSWR("/api/appointments/availability", fetcher);
  const existingAppointments = availabilityData?.data || [];

  // ตรวจสอบว่าบริการนี้เป็นประเภทที่ต้องเลือกสถานที่หรือไม่
  const isOffSiteService = formData.serviceType === "รีไฟแนนซ์" || formData.serviceType === "ซื้อขายมือถือ";

  // appointmentType ที่จะใช้คำนวณเวลา จะขึ้นอยู่กับการตัดสินใจของผู้ใช้
  const currentAppointmentType = formData.appointmentType;

  const timeSlots = useMemo(
    () => generateTimeSlots(selectedDay, currentAppointmentType, existingAppointments),
    [selectedDay, currentAppointmentType, existingAppointments]
  );

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setFormData((prev) => ({ ...prev, appointmentAt: null }));
  };

  const handleTimeSelect = (slot) => {
    setFormData((prev) => ({ ...prev, appointmentAt: slot.dateTime }));
  };

  // ฟังก์ชันเมื่อเลือกประเภทการนัดหมาย (หน้าร้าน / ออนไลน์ / นอกสถานที่)
  const handleAppointmentTypeSelect = (type) => {
    if (type === "in-store") {
      setFormData((prev) => ({ ...prev, appointmentType: "in-store", locationDetails: "" }));
      setOffSiteCategory(null);
    } else if (type === "online") {
      setFormData((prev) => ({ ...prev, appointmentType: "off-site", locationDetails: "ออนไลน์" }));
      setOffSiteCategory("online");
    } else if (type === "location") {
      setFormData((prev) => ({ ...prev, appointmentType: "off-site", locationDetails: "" }));
      setOffSiteCategory("location");
    }
  };

  if (error) return <div>Failed to load availability.</div>;
  if (!availabilityData) return <div>Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "spring", stiffness: 120 }}
      className="flex flex-col items-center gap-8 w-full"
    >
      {/* Header */}
      <div className="w-full items-center text-center bg-gradient-to-br from-blue-500 to-blue-700 text-white p-4 rounded-2xl shadow-lg">
        <h3 className="text-2xl font-bold">เลือกบริการ: {formData.serviceType}</h3>
      </div>

      {/* ส่วนเลือกประเภทการนัดหมาย (แสดงเฉพาะบริการที่กำหนด) */}
      {isOffSiteService && (
        <div className="w-full">
          <h3 className="text-lg font-bold mb-2">เลือกประเภทการนัดหมาย</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAppointmentTypeSelect("in-store")}
              className={`p-3 rounded-lg font-semibold text-sm ${
                currentAppointmentType === "in-store" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              หน้าร้าน
            </button>
            <button
              onClick={() => handleAppointmentTypeSelect("online")}
              className={`p-3 rounded-lg font-semibold text-sm ${
                offSiteCategory === "online" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              ออนไลน์
            </button>
            <button
              onClick={() => handleAppointmentTypeSelect("location")}
              className={`p-3 rounded-lg font-semibold text-sm ${
                offSiteCategory === "location" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              นอกสถานที่
            </button>
          </div>
        </div>
      )}

      {/* Calendar (แสดงเมื่อมีการเลือกประเภทแล้ว หรือเป็น in-store service แต่แรก) */}
      <AnimatePresence>
        {(currentAppointmentType === "in-store" || offSiteCategory) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="w-full flex flex-col items-center gap-8"
          >
            <div className="bg-white flex justify-center items-center p-8 rounded-4xl shadow-lg w-max">
              <DayPicker
                mode="single"
                selected={selectedDay}
                onSelect={handleDayClick}
                locale={th}
                fromDate={new Date()}
                styles={{ caption: { color: "#1d4ed8" }, head: { color: "#1d4ed8" } }}
              />
            </div>

            {/* ส่วนเลือกสถานที่ย่อย (แสดงเมื่อเลือก 'นอกสถานที่') */}
            {offSiteCategory === "off-store" && (
              <div className="w-full flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-bold mb-2">เลือกประเภทย่อย</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setLocationCategory("mall")}
                      className={`p-3 rounded-lg font-semibold ${
                        locationCategory === "mall" ? "bg-blue-600 text-white" : "bg-gray-200"
                      }`}
                    >
                      ห้างสรรพสินค้า
                    </button>
                    <button
                      onClick={() => setLocationCategory("bts")}
                      className={`p-3 rounded-lg font-semibold ${
                        locationCategory === "bts" ? "bg-blue-600 text-white" : "bg-gray-200"
                      }`}
                    >
                      สถานีรถไฟฟ้า
                    </button>
                  </div>
                </div>
                {locationCategory === "mall" && (
                  <DropdownComponent
                    options={mallOptions}
                    selectedValue={formData.locationDetails}
                    onSelect={(loc) => setFormData((prev) => ({ ...prev, locationDetails: loc }))}
                    placeholder="-- กรุณาเลือกห้างสรรพสินค้า --"
                  />
                )}
                {locationCategory === "bts" && (
                  <DropdownComponent
                    options={btsStations}
                    selectedValue={formData.locationDetails}
                    onSelect={(loc) => setFormData((prev) => ({ ...prev, locationDetails: loc }))}
                    placeholder="-- กรุณาเลือกสถานีรถไฟฟ้า --"
                  />
                )}
              </div>
            )}

            {/* Time Slots */}
            {selectedDay && (
              <div className="w-full">
                <h3 className="text-lg font-bold mb-2">
                  เลือกเวลาสำหรับวันที่ {format(selectedDay, "d MMMM yyyy", { locale: th })}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeSelect(slot)}
                      disabled={!slot.isAvailable}
                      className={`p-3 rounded-lg text-center font-semibold transition-colors ${
                        !slot.isAvailable
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : formData.appointmentAt && format(new Date(formData.appointmentAt), "HH:mm") === slot.time
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="mt-8 flex justify-between items-center w-full">
        <button onClick={() => setAppState("selecting_service")} className="flex gap-1 text-gray-600 font-semibold">
          <ArrowLeft />
          กลับ
        </button>
        <button
          disabled={!formData.appointmentAt || (offSiteCategory === "location" && !formData.locationDetails)}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          ถัดไป
        </button>
      </div>
    </motion.div>
  );
}
