"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { User, Calendar, Users, X, Menu, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// 1. Import Custom Hooks ที่จำเป็น
import { useLiff } from "./Provider/LiffProvider";

export default function Navbar({ onProfileOpen = () => {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const { liffProfile } = useLiff();
  const router = useRouter();
  const pathname = usePathname();
  // แสดง menu พนักงานบนหน้า queueManagement เท่านั้น
  const isEmployee = (pathname || "").startsWith("/queue-management");

  // Close notification panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isNotificationOpen]);

  // Mock notification data for users
  const mockNotifications = [
    {
      id: 1,
      type: "ACCEPTED",
      title: "คิวของคุณได้รับการยอมรับ",
      message: "การนัดหมายซ่อมมือถือ วันที่ 2 ก.ย. 2025 เวลา 14:00 น.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
    },
    {
      id: 2,
      type: "CHANGE_REQUEST",
      title: "ขอเปลี่ยนแปลงข้อมูล",
      message: "พนักงานขอให้เปลี่ยนเวลานัดหมายเป็น 15:00 น. กรุณายืนยัน",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
    },
    {
      id: 3,
      type: "REJECTED",
      title: "คิวถูกปฏิเสธ",
      message: "การนัดหมายรีไฟแนนซ์ถูกปฏิเสธ เนื่องจากเอกสารไม่ครบถ้วน",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
    },
  ];

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const handleMenuClick = (action) => {
    setIsMenuOpen(false);
    switch (action) {
      case "employee-appointments":
        router.push("/queue-management/employee");
        break;
      case "admin":
        router.push("/queue-management");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 1, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1 }}
        className="absolute top-0 z-10 flex h-20 w-full items-center justify-around bg-white p-2 shadow-sm shadow-black/10"
      >
        <div className="flex w-full items-center gap-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="rounded-lg transition-colors hover:bg-slate-100"
          >
            <Menu size={32} />
          </button>
          <Link
            href={"/queue-services"}
            onClick={() => window.dispatchEvent(new CustomEvent("go-home"))}
            className="bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-xl font-bold text-transparent"
          >
            OKM Queue
          </Link>
        </div>

        {/* Notification Bell */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="relative flex cursor-pointer items-center justify-center rounded-full bg-white p-3 shadow-md transition-colors hover:bg-slate-50"
        >
          <Bell size={24} className="text-slate-600" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.div>
          )}
        </motion.div>
      </motion.header>

      {/* Sliding Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.28 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <div className="p-4">
              <button onClick={() => setIsMenuOpen(false)} className="mb-4">
                <X />
              </button>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">เมนู</h2>

                {/* Customer Menu Items */}
                <Link
                  href="/appointments/my-appointment"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-lg p-4 text-left transition-colors hover:bg-slate-200"
                >
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>คิวของฉัน</span>
                </Link>

                {/* Employee Menu Items */}
                {isEmployee && (
                  <>
                    <div className="border-t border-slate-200 pt-4">
                      <h3 className="mb-2 text-sm font-medium text-slate-600">เมนูพนักงาน</h3>
                      {/* MENU: Employee Management */}
                      <Link
                        href={"/queue-management"}
                        onClick={() => handleMenuClick("admin")}
                        className="flex w-full items-center gap-3 rounded-lg p-4 text-left"
                      >
                        <User className="h-5 w-5 text-green-600" />
                        <span>จัดการระบบ</span>
                      </Link>
                      {/* MENU: Employee Appointments */}
                      <Link
                        href={"/queue-management/employee"}
                        onClick={() => handleMenuClick("employee-appointments")}
                        className="mb-2 flex w-full items-center gap-3 rounded-lg p-4 text-left"
                      >
                        <Users className="h-5 w-5 text-blue-600" />
                        <span>นัดหมายของฉัน</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Panel */}
      <AnimatePresence>
        {isNotificationOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
            className="absolute top-20 right-4 z-50 w-80 max-w-[90vw] rounded-2xl border border-slate-200 bg-white shadow-xl"
            ref={notificationRef}
          >
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">การแจ้งเตือน</h3>
                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="rounded-lg p-1 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-96 space-y-3 overflow-y-auto">
                {mockNotifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">
                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                    <p>ไม่มีการแจ้งเตือน</p>
                  </div>
                ) : (
                  mockNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))
                )}
              </div>

              {mockNotifications.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <button className="w-full rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">
                    ดูทั้งหมด
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NotificationItem({ notification }) {
  const getNotificationIcon = (type) => {
    switch (type) {
      case "ACCEPTED":
        return "✅";
      case "REJECTED":
        return "❌";
      case "CHANGE_REQUEST":
        return "⏰";
      default:
        return "📋";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "ACCEPTED":
        return "bg-green-50 border-green-200";
      case "REJECTED":
        return "bg-red-50 border-red-200";
      case "CHANGE_REQUEST":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} นาทีที่แล้ว`;
    } else if (hours < 24) {
      return `${hours} ชั่วโมงที่แล้ว`;
    } else {
      return `${days} วันที่แล้ว`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative rounded-lg border p-3 ${getNotificationColor(notification.type)} ${
        !notification.read ? "ring-2 ring-blue-200" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-lg">{getNotificationIcon(notification.type)}</div>
        <div className="flex-1">
          <h4 className="font-medium text-slate-800">{notification.title}</h4>
          <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
          <p className="mt-2 text-xs text-slate-400">{formatTime(notification.timestamp)}</p>
        </div>
        {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
      </div>
    </motion.div>
  );
}
