"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building,
  Smartphone,
  Wrench,
  Check,
  X,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  Filter,
  ChevronDown,
  Eye,
  CheckCircle2,
  XCircle,
  ClockIcon,
} from "lucide-react";
import DateTimeOfferPicker from "@/app/components/DateTimeOfferPicker";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

export default function EmployeeAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const router = useRouter();

  const statusFilters = [
    { value: "ALL", label: "ทั้งหมด", count: 0 },
    { value: "PENDING", label: "รอดำเนินการ", count: 0 },
    { value: "ACCEPTED_BY_EMPLOYEE", label: "รับทำแล้ว", count: 0 },
    { value: "REJECTED_BY_EMPLOYEE", label: "ปฏิเสธแล้ว", count: 0 },
    { value: "OFFERED", label: "เสนอเวลาใหม่", count: 0 },
  ];

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/employees/appointments?employeeId=current");

      if (response.status === 401) {
        router.push("/queueManagement/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      console.log("Received appointments data:", data);
      console.log("Is array:", Array.isArray(data));
      console.log("Length:", data.length);
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("ไม่สามารถโหลดข้อมูลนัดหมายได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentAction = async (appointmentId, action, offerDate = null) => {
    try {
      const payload = {
        appointmentId,
        action,
        ...(offerDate && { offerDate }),
      };

      // For now, just show success message - later connect to API
      const actionText = {
        ACCEPT: "รับทำ",
        REJECT: "ปฏิเสธ",
        OFFER: "เสนอเวลาใหม่",
      };

      await Swal.fire({
        title: "สำเร็จ!",
        text: `${actionText[action]}นัดหมายเรียบร้อยแล้ว`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh appointments
      fetchMyAppointments();
      setShowDatePicker(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถอัปเดตนัดหมายได้ กรุณาลองใหม่",
        icon: "error",
      });
    }
  };

  const handleOfferDateTime = (appointmentId) => {
    if (!selectedDate || !selectedTime) {
      Swal.fire({
        title: "กรุณาเลือกวันที่และเวลา",
        text: "โปรดเลือกวันที่และเวลาที่ต้องการเสนอ",
        icon: "warning",
      });
      return;
    }

    const offerDate = new Date(`${selectedDate}T${selectedTime}`);
    handleAppointmentAction(appointmentId, "OFFER", offerDate);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (filterStatus === "ALL") return true;
    return appointment.status === filterStatus;
  });

  // Update filter counts
  const updatedFilters = statusFilters.map((filter) => ({
    ...filter,
    count:
      filter.value === "ALL" ? appointments.length : appointments.filter((apt) => apt.status === filter.value).length,
  }));

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchMyAppointments}
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
                นัดหมายของฉัน
              </h1>
              <p className="text-slate-600 text-base sm:text-lg">จัดการและตอบกลับนัดหมายของลูกค้า</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-2xl shadow-lg text-sm sm:text-base">
                <span className="font-semibold">{filteredAppointments.length} รายการ</span>
              </div>
              <button
                onClick={fetchMyAppointments}
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
                  ? "ยังไม่มีนัดหมายที่ตรงกับทักษะของคุณในขณะนี้"
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

// Luxury Appointment Card Component
const AppointmentCard = ({
  appointment,
  index,
  onAction,
  showDatePicker,
  setShowDatePicker,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  onOfferDateTime,
}) => {
  const typeMap = {
    ONSITE: {
      label: "หน้าร้าน",
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      icon: <Building className="w-6 h-6 text-blue-600" />,
      borderColor: "border-blue-200",
    },
    ONLINE: {
      label: "ออนไลน์",
      gradient: "from-emerald-500 via-green-600 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      icon: <Smartphone className="w-6 h-6" />,
      borderColor: "border-emerald-200",
    },
    OFFSITE: {
      label: "นอกสถานที่",
      gradient: "from-purple-500 via-pink-600 to-rose-600",
      bgGradient: "from-purple-50 to-pink-50",
      icon: <Wrench className="w-6 h-6" />,
      borderColor: "border-purple-200",
    },
  };

  const statusMap = {
    PENDING: {
      label: "รอตอบกลับ",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: <ClockIcon className="w-4 h-4" />,
    },
    ACCEPTED_BY_EMPLOYEE: {
      label: "รับทำแล้ว",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    REJECTED_BY_EMPLOYEE: {
      label: "ปฏิเสธแล้ว",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: <XCircle className="w-4 h-4" />,
    },
    OFFERED: {
      label: "เสนอเวลาใหม่",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: <Clock className="w-4 h-4" />,
    },
  };

  const type = typeMap[appointment.type] || typeMap.ONSITE;
  const status = statusMap[appointment.status] || statusMap.PENDING;
  const isPending = appointment.status === "PENDING";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <div
        className={`relative bg-white backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden ${type.borderColor}`}
      >
        {/* Gradient Top Border */}
        {/* <div className={`h-2 bg-gradient-to-r ${type.gradient}`} /> */}

        {/* Card Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${type.bgGradient} border ${type.borderColor}`}>
                <div className={`text-gradient bg-gradient-to-r ${type.gradient} bg-clip-text text-transparent`}>
                  {type.icon}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">{type.label}</h3>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${status.bg} ${status.border} border`}
                >
                  {status.icon}
                  <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 mb-4 border border-slate-200/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">{appointment.customer?.fullname || "ไม่ระบุชื่อ"}</h4>
                {appointment.customer?.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{appointment.customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {appointment.note && (
              <div className="bg-white/70 rounded-xl p-3 border border-slate-200/50">
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-medium text-slate-900">รายละเอียด:</span> {appointment.note}
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {appointment.requiredTags && appointment.requiredTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {appointment.requiredTags.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${type.gradient} text-white shadow-sm`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 bg-white/70 rounded-xl p-3 border border-slate-200/50">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-slate-500 font-medium">วันที่</p>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(appointment.date).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/70 rounded-xl p-3 border border-slate-200/50">
              <Clock className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500 font-medium">เวลา</p>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(appointment.date).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  น.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Only show for pending appointments */}
          {isPending && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAction(appointment.id, "ACCEPT")}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  รับทำ
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAction(appointment.id, "REJECT")}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <XCircle className="w-5 h-5" />
                  ปฏิเสธ
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDatePicker(showDatePicker === appointment.id ? null : appointment.id)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Clock className="w-5 h-5" />
                เสนอเวลาใหม่
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    showDatePicker === appointment.id ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              {/* Date/Time Picker as a separate component */}
              <DateTimeOfferPicker
                isOpen={showDatePicker === appointment.id}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                onConfirm={() => onOfferDateTime(appointment.id)}
              />
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-slate-200/50">
            <p className="text-xs text-slate-500">
              สร้างเมื่อ:{" "}
              {new Date(appointment.createdAt).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
