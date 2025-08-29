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
} from "lucide-react";
import DateTimeOfferPicker from "@/app/components/DateTimeOfferPicker";

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
}) {
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
        <div className="p-6">
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
}
