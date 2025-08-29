"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
// 1. Import Hooks ที่ถูกต้อง (useAuth ไม่ต้องใช้แล้ว)
import { useGetAppointmentsByTags, useUpdateAppointmentAction } from "@/app/hooks/useEmployee";
import AppointmentCard from "./components/AppointmentCard";

export default function EmployeeAppointmentsPage() {
  // 2. (สำคัญ) Mock ข้อมูลพนักงานตาม Requirement ใหม่
  //    ในอนาคต ข้อมูลนี้จะถูกส่งมาจาก Central Server ผ่านทาง Props หรือ State Management อื่นๆ
  const employee = {
    adminId: "68aea10ba4d0d8f4b37327cc", // ID จาก Central Server ที่จะใช้ระบุตัวตน
    username: "nakasen",
    fullName: "นาคเสน พุทธเจริญ",
    staffId: "OKM011",
    centralRole: ["admin", "ENGINEER"], // ใช้ centralRole แทน roles เพื่อความชัดเจน
  };

  // 3. UI State สำหรับควบคุมการ Filter
  const [filterStatus, setFilterStatus] = useState("ALL");

  // 4. เรียกใช้ Hook เพื่อดึงข้อมูล "ทั้งหมด" ที่เกี่ยวข้องกับพนักงาน
  const {
    data: appointments = [], // `appointments` คือข้อมูลดิบทั้งหมดที่ยังไม่ได้กรอง
    isLoading,
    error,
    refetch: refetchAppointments,
  } = useGetAppointmentsByTags(employee);

  const { mutate: updateAppointmentAction, isPending: isUpdating } = useUpdateAppointmentAction();

  // State อื่นๆ สำหรับ UI
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const statusFilters = [
    { value: "ALL", label: "ทั้งหมด" },
    { value: "PENDING", label: "รอดำเนินการ" },
    { value: "ACCEPTED_BY_EMPLOYEE", label: "รับทำแล้ว" },
    { value: "REJECTED_BY_EMPLOYEE", label: "ปฏิเสธแล้ว" },
    { value: "OFFERED", label: "เสนอเวลาใหม่" },
  ];

  // Action Handlers
  const handleAppointmentAction = (appointmentId, action, offerDate = null) => {
    const actionText = {
      ACCEPT: "รับทำ",
      REJECT: "ปฏิเสธ",
      OFFER: "เสนอเวลาใหม่",
    };

    // (สำคัญ) ส่ง employee object ทั้งก้อนเข้าไปใน payload
    // เพื่อให้ Backend สามารถ stringify และบันทึกลง employeeInfo ได้
    updateAppointmentAction(
      { appointmentId, action, offerDate, employeeInfo: employee },
      {
        onSuccess: () => {
          Swal.fire({
            title: "สำเร็จ!",
            text: `${actionText[action]}นัดหมายเรียบร้อยแล้ว`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          setShowDatePicker(null);
        },
        onError: (err) => {
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: err.message || "ไม่สามารถอัปเดตนัดหมายได้",
            icon: "error",
          });
        },
      }
    );
  };

  const handleOfferDateTime = (appointmentId) => {
    if (!selectedDate || !selectedTime) {
      Swal.fire({ title: "กรุณาเลือกวันที่และเวลา", icon: "warning" });
      return;
    }
    const offerDate = new Date(`${selectedDate}T${selectedTime}`);
    handleAppointmentAction(appointmentId, "OFFER", offerDate);
  };

  // 5. (สำคัญ) ทำการ Filter ข้อมูลที่ฝั่ง Frontend
  const filteredAppointments = appointments?.filter((appointment) => {
    if (filterStatus === "ALL") return true;
    return appointment.status === filterStatus;
  });

  // 6. (สำคัญ) การคำนวณ Count จะทำงานถูกต้อง เพราะใช้ `appointments` (ข้อมูลทั้งหมด)
  const updatedFilters = statusFilters.map((filter) => ({
    ...filter,
    count:
      filter.value === "ALL" ? appointments.length : appointments.filter((apt) => apt.status === filter.value).length,
  }));

  // Loading และ Error UI
  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">กำลังโหลดข้อมูลนัดหมาย...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-slate-600 mb-4">{error.message}</p>
          <button
            onClick={() => refetchAppointments()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 md:p-8 mb-6 md:mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 md:mb-2">
                นัดหมายสำหรับคุณ
              </h1>
              <p className="text-slate-600 text-base sm:text-lg">จัดการและตอบกลับนัดหมายที่ตรงกับทักษะของคุณ</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-2xl shadow-lg text-sm sm:text-base">
                <span className="font-semibold">{filteredAppointments.length} รายการ</span>
              </div>
              <button
                onClick={() => refetchAppointments()}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-700">รีโหลด</span>
                </div>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-4 sm:mt-6">
            {updatedFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                  filterStatus === filter.value
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    : "bg-white/70 text-slate-600 hover:bg-white border border-slate-200"
                }`}
              >
                {filter.label}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filterStatus === filter.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Appointments Grid */}
        {filteredAppointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10 sm:py-16"
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 sm:p-12">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">ไม่มีนัดหมาย</h2>
              <p className="text-slate-600 text-base sm:text-lg">
                {filterStatus === "ALL"
                  ? "ยังไม่มีนัดหมายที่เกี่ยวข้องในขณะนี้"
                  : `ไม่มีนัดหมายที่มีสถานะ "${updatedFilters.find((f) => f.value === filterStatus)?.label}"`}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {filteredAppointments.map((appointment, index) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  index={index}
                  onAction={handleAppointmentAction}
                  showDatePicker={showDatePicker}
                  setShowDatePicker={setShowDatePicker}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  onOfferDateTime={handleOfferDateTime}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
