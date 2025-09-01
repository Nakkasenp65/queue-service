"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

import AppointmentCard from "./components/AppointmentCard";
import {
  useGetEmployeeAppointmentByTags,
  useGetEmployeeAppointments,
  useUpdateAppointmentAction,
} from "../hooks/useEmployee";

export default function EmployeeAppointmentsPage() {
  const router = useRouter();

  const employee = {
    adminId: "68aea10ba4d0d8f4b37327cc",
    username: "nakasen",
    fullName: "นาคเสน พุทธเจริญ",
    staffId: "OKM011",
    centralRole: ["admin", "ENGINEER"],
  };

  const [filterStatus, setFilterStatus] = useState("ALL");

  const {
    data: appointments = [],
    isLoading,
    error,
    refetch: refetchAppointments,
  } = useGetEmployeeAppointmentByTags(employee.centralRole);

  const { mutate: updateAppointmentAction, isPending: isUpdating } = useUpdateAppointmentAction();

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

  const handleAppointmentAction = (appointmentId, action, offerDate = null) => {
    const actionText = {
      ACCEPT: "รับทำ",
      REJECT: "ปฏิเสธ",
      OFFER: "เสนอเวลาใหม่",
    };

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
      },
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

  const filteredAppointments = appointments?.filter((appointment) => {
    if (filterStatus === "ALL") return true;
    return appointment.status === filterStatus;
  });

  const updatedFilters = statusFilters.map((filter) => ({
    ...filter,
    count:
      filter.value === "ALL"
        ? appointments.length
        : appointments.filter((apt) => apt.status === filter.value).length,
  }));

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-slate-600">กำลังโหลดข้อมูลนัดหมาย...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <div className="mb-4 text-4xl text-red-500">❌</div>
          <h1 className="mb-2 text-xl font-semibold text-slate-900">เกิดข้อผิดพลาด</h1>
          <p className="mb-4 text-slate-600">{error.message}</p>
          <button
            onClick={() => refetchAppointments()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            ลองใหม่
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-2 sm:p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/queue-management/employee")}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white/50 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปแดชบอร์ด
          </button>
          <nav className="mt-2">
            <ol className="flex items-center gap-2 text-sm text-slate-500">
              <li>
                <button
                  onClick={() => router.push("/queue-management/employee")}
                  className="transition-colors hover:text-slate-700"
                >
                  แดชบอร์ดพนักงาน
                </button>
              </li>
              <li>/</li>
              <li className="font-medium text-slate-800">นัดหมายทั้งหมด</li>
            </ol>
          </nav>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-lg sm:p-6 md:mb-8 md:p-8"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
            <div className="mb-4 md:mb-0">
              <h1 className="mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl md:mb-2 md:text-4xl">
                นัดหมายสำหรับคุณ
              </h1>
              <p className="text-base text-slate-600 sm:text-lg">
                จัดการและตอบกลับนัดหมายที่ตรงกับทักษะของคุณ
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm text-white shadow-lg sm:px-6 sm:py-3 sm:text-base">
                <span className="font-semibold">{filteredAppointments.length} รายการ</span>
              </div>
              <button
                onClick={() => refetchAppointments()}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-lg transition-all duration-200 hover:bg-slate-50 hover:shadow-xl sm:px-6 sm:py-3 sm:text-base"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-600" />
                  <span className="font-medium text-slate-700">รีโหลด</span>
                </div>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
            {updatedFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm ${
                  filterStatus === filter.value
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    : "border border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
                }`}
              >
                {filter.label}
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    filterStatus === filter.value
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
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
            className="py-10 text-center sm:py-16"
          >
            <div className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-lg sm:p-12">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 sm:mb-6 sm:h-24 sm:w-24">
                <Calendar className="h-8 w-8 text-blue-500 sm:h-12 sm:w-12" />
              </div>
              <h2 className="mb-2 text-lg font-bold text-slate-900 sm:mb-3 sm:text-2xl">
                ไม่มีนัดหมาย
              </h2>
              <p className="text-base text-slate-600 sm:text-lg">
                {filterStatus === "ALL"
                  ? "ยังไม่มีนัดหมายที่เกี่ยวข้องในขณะนี้"
                  : `ไม่มีนัดหมายที่มีสถานะ "${updatedFilters.find((f) => f.value === filterStatus)?.label}"`}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
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
