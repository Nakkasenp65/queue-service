"use client";

import React from "react";
import { motion } from "framer-motion";
import { Smartphone, Building, Wrench, User, Calendar, Clock } from "lucide-react";
import InfoPill from "./InfoPill";

export default function LatestAppointmentCard({ appointment, loading }) {
  const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  if (loading) {
    return (
      <motion.div variants={cardVariants} initial="initial" animate="animate">
        <motion.div
          className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-white/50 shadow-lg"
          style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        >
          <div className="p-6 pl-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-slate-100 rounded w-48 mb-2 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-32 animate-pulse" />
              </div>
            </div>

            <div className="border-t border-slate-200/90 my-4" />
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (!appointment) {
    return (
      <motion.div variants={cardVariants} initial="initial" animate="animate">
        <motion.div
          className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-white/50 shadow-lg"
          style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        >
          <div className="p-6 pl-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">ยินดีต้อนรับ!</h3>
                <p className="text-sm text-slate-500">ยังไม่มีประวัติการจอง</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const typeMap = {
    ONSITE: {
      label: "หน้าร้าน",
      color: "blue",
      icon: <Building className="w-5 h-5" />,
    },
    ONLINE: {
      label: "ออนไลน์",
      color: "green",
      icon: <Smartphone className="w-5 h-5" />,
    },
    OFFSITE: {
      label: "นอกสถานที่",
      color: "purple",
      icon: <Wrench className="w-5 h-5" />,
    },
  };

  const statusMap = {
    PENDING: { label: "รอดำเนินการ", color: "yellow" },
    CONFIRMED: { label: "ยืนยันแล้ว", color: "green" },
    COMPLETED: { label: "เสร็จสิ้น", color: "blue" },
    CANCELLED: { label: "ยกเลิก", color: "gray" },
    NO_SHOW: { label: "ไม่มาตามนัด", color: "red" },
  };

  const type = typeMap[appointment.type] || typeMap.ONSITE;
  const status = statusMap[appointment.status] || statusMap.PENDING;

  return (
    <motion.div variants={cardVariants} initial="initial" animate="animate">
      <motion.div
        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
        className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-white/50 shadow-lg"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        {/* Decorative Gradient Border */}

        <div className="p-6 pl-8">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full bg-${type.color}-100 text-${type.color}-600`}
              >
                {type.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{type.label}</h3>
                <p className="text-sm text-slate-500">{appointment.note}</p>
              </div>
            </div>
            <div
              className={`px-3 py-1 text-xs font-semibold rounded-full bg-${status.color}-100 text-${status.color}-700`}
            >
              {status.label}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200/90 my-4" />

          {/* Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
            <InfoPill
              icon={<Calendar className="w-4 h-4 text-blue-500" />}
              label={new Date(appointment.date).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <InfoPill
              icon={<Clock className="w-4 h-4 text-indigo-500" />}
              label={`${new Date(appointment.date).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })} น.`}
            />
          </div>

          {/* Footer Section */}
          <div className="mt-5 pt-4 border-t border-slate-200/90">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">พนักงาน:</span>
              {appointment.employee && appointment.employee.name ? (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-800">{appointment.employee.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 animate-pulse">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-500">รอการยืนยัน</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
