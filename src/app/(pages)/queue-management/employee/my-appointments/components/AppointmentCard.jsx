import { motion } from "framer-motion";
import {
  Building,
  Smartphone,
  Wrench,
  Clock,
  Calendar,
  User,
  Phone,
  ChevronDown,
  CheckCircle2,
  XCircle,
  ClockIcon,
  AlertCircle,
  BadgeCheck,
  CalendarOff,
} from "lucide-react";
import DateTimeOfferPicker from "@/app/components/DateTimeOfferPicker";
import Image from "next/image";

export default function AppointmentCard({
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
  loadingActions = {},
}) {
  const typeMap = {
    ONSITE: {
      label: "หน้าร้าน",
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      icon: <Building className="h-6 w-6" />,
      borderColor: "border-blue-200",
    },
    ONLINE: {
      label: "ออนไลน์",
      gradient: "from-emerald-500 via-green-600 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      icon: <Smartphone className="h-6 w-6" />,
      borderColor: "border-emerald-200",
    },
    OFFSITE: {
      label: "นอกสถานที่",
      gradient: "from-purple-500 via-pink-600 to-rose-600",
      bgGradient: "from-purple-50 to-pink-50",
      icon: <Wrench className="h-6 w-6" />,
      borderColor: "border-purple-200",
    },
  };

  // --- UPDATED: Added all relevant statuses from the schema ---
  const statusMap = {
    PENDING: {
      label: "รอตอบกลับ",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: <ClockIcon className="h-4 w-4" />,
    },
    CONFIRMED: {
      label: "ลูกค้ายืนยัน",
      color: "text-sky-600",
      bg: "bg-sky-50",
      border: "border-sky-200",
      icon: <BadgeCheck className="h-4 w-4" />,
    },
    ACCEPTED_BY_EMPLOYEE: {
      label: "รับทำแล้ว",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    REJECTED_BY_EMPLOYEE: {
      label: "ปฏิเสธแล้ว",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: <XCircle className="h-4 w-4" />,
    },
    OFFERED: {
      label: "เสนอเวลาใหม่",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: <Clock className="h-4 w-4" />,
    },
    CANCELLED: {
      label: "ยกเลิกแล้ว",
      color: "text-slate-600",
      bg: "bg-slate-100",
      border: "border-slate-200",
      icon: <CalendarOff className="h-4 w-4" />,
    },
    // Fallback for any other status not explicitly defined
    UNKNOWN: {
      label: "สถานะไม่ทราบ",
      color: "text-gray-600",
      bg: "bg-gray-100",
      border: "border-gray-200",
      icon: <AlertCircle className="h-4 w-4" />,
    },
  };

  const type = typeMap[appointment.type] || {
    label: "ไม่ระบุ",
    gradient: "from-gray-500 to-gray-600",
    bgGradient: "from-gray-50 to-gray-50",
    icon: <Building className="h-6 w-6" />,
    borderColor: "border-gray-200",
  };
  // --- UPDATED: Changed fallback to a generic UNKNOWN status ---
  const status = statusMap[appointment.status] || statusMap.UNKNOWN;
  console.log("type ", type);

  // This logic is correct, buttons should only show for PENDING appointments.
  const isPending = appointment.status === "PENDING";

  // Check loading states for each action
  const isAcceptLoading = loadingActions[`${appointment.id}-ACCEPT`];
  const isRejectLoading = loadingActions[`${appointment.id}-REJECT`];
  const isOfferLoading = loadingActions[`${appointment.id}-OFFER`];
  const isAnyLoading = isAcceptLoading || isRejectLoading || isOfferLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <div
        className={`relative overflow-hidden rounded-3xl border bg-white shadow-xl backdrop-blur-lg transition-all duration-300 hover:shadow-2xl ${type.borderColor}`}
      >
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-2xl bg-gradient-to-br p-3 ${type.bgGradient} border ${type.borderColor}`}
              >
                <div
                  className={`text-gradient bg-gradient-to-r ${type.gradient} bg-clip-text text-transparent`}
                >
                  {type.icon}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{type.label}</h3>
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${status.bg} border ${status.border}`}
                >
                  {status.icon}
                  <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                {appointment.customer?.picture_url ? (
                  <Image
                    src={appointment.customer.picture_url}
                    width={48}
                    height={48}
                    alt={appointment.customer.fullname || "user-profile-image"}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {appointment.customer?.fullname ||
                    appointment.customer?.line_display_name ||
                    "ไม่ระบุชื่อ"}
                </h4>
                {appointment.customer?.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{appointment.customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {appointment.note && (
              <div className="rounded-xl border border-slate-200/50 bg-white/70 p-3">
                <p className="text-sm leading-relaxed text-slate-700">
                  <span className="font-medium text-slate-900">รายละเอียด:</span> {appointment.note}
                </p>
              </div>
            )}
          </div>

          {appointment.requiredTags && appointment.requiredTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {appointment.requiredTags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-medium ${type.gradient} text-white shadow-sm`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/50 bg-white/70 p-3">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs font-medium text-slate-500">วันที่</p>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(appointment.date).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/50 bg-white/70 p-3">
              <Clock className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-xs font-medium text-slate-500">เวลา</p>
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

          {isPending && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: isAnyLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isAnyLoading ? 1 : 0.98 }}
                  onClick={() => onAction(appointment.id, "ACCEPT")}
                  disabled={isAnyLoading}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 ${
                    isAnyLoading
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-xl"
                  }`}
                >
                  {isAcceptLoading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      กำลังรับทำ...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      รับทำ
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: isAnyLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isAnyLoading ? 1 : 0.98 }}
                  onClick={() => onAction(appointment.id, "REJECT")}
                  disabled={isAnyLoading}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 ${
                    isAnyLoading
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-xl"
                  }`}
                >
                  {isRejectLoading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      กำลังปฏิเสธ...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5" />
                      ปฏิเสธ
                    </>
                  )}
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: isAnyLoading ? 1 : 1.02 }}
                whileTap={{ scale: isAnyLoading ? 1 : 0.98 }}
                onClick={() =>
                  setShowDatePicker(showDatePicker === appointment.id ? null : appointment.id)
                }
                disabled={isAnyLoading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 ${
                  isAnyLoading
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-xl"
                }`}
              >
                <Clock className="h-5 w-5" />
                เสนอเวลาใหม่
                <ChevronDown
                  className={`h-5 w-5 transition-transform duration-200 ${
                    showDatePicker === appointment.id ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              <DateTimeOfferPicker
                isOpen={showDatePicker === appointment.id}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                onConfirm={() => onOfferDateTime(appointment.id)}
                isLoading={isOfferLoading}
              />
            </div>
          )}

          <div className="mt-4 border-t border-slate-200/50 pt-4">
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
}
