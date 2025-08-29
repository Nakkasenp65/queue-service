"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { User, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 1. Import Custom Hooks ที่จำเป็น
import { useLiff } from "./Provider/LiffProvider";

export default function Navbar({ onProfileOpen = () => {} }) {
  const { liffProfile } = useLiff();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mock employee data - always allow access to employee features
  const isEmployee = true;
  const isLoading = false;

  const handleMenuClick = (action) => {
    setIsMenuOpen(false);

    switch (action) {
      case "employee-appointments":
        router.push("/queueManagement/employees/myAppointment");
        break;
      case "admin":
        router.push("/queueManagement/admin");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-around items-center px-4 py-2"
      >
        <div className="flex items-center gap-4 w-full">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link
            href={"/queueService"}
            onClick={() => window.dispatchEvent(new CustomEvent("go-home"))}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800"
          >
            OK1 Queue
          </Link>
        </div>

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onProfileOpen()}
          className=" bg-white rounded-full shadow-md cursor-pointer flex items-center justify-center  hover:border-blue-500 transition-colors"
        >
          {liffProfile ? (
            <Image
              width={50}
              height={50}
              src={liffProfile.pictureUrl}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
              <User className="text-gray-400" />
            </div>
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
                ✕
              </button>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">เมนู</h2>

                {/* Customer Menu Items */}
                <Link
                  href="/appointments/my-appointment"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full rounded-lg bg-slate-100 p-4 text-left flex items-center gap-3 hover:bg-slate-200 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>คิวของฉัน</span>
                </Link>

                {/* Employee Menu Items */}
                {/* Always show employee menu items since we're using mock data */}
                {isEmployee && (
                  <>
                    <div className="border-t border-slate-200 pt-4">
                      <h3 className="text-sm font-medium text-slate-600 mb-2">เมนูพนักงาน</h3>
                      <button
                        onClick={() => handleMenuClick("employee-appointments")}
                        className="w-full rounded-lg bg-blue-50 p-4 text-left flex items-center gap-3 mb-2"
                      >
                        <Users className="w-5 h-5 text-blue-600" />
                        <span>นัดหมายของฉัน</span>
                      </button>
                      <button
                        onClick={() => handleMenuClick("admin")}
                        className="w-full rounded-lg bg-blue-50 p-4 text-left flex items-center gap-3"
                      >
                        <User className="w-5 h-5 text-green-600" />
                        <span>จัดการระบบ</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
