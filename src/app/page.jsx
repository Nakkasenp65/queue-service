"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Smartphone, Repeat, HandCoins, ShieldCheck, Building, Wrench, Info, History, User } from "lucide-react";
import ProfileModal from "./components/ProfileModal";
import { useState, useEffect } from "react";
import { useLiff } from "./components/Provider/LiffProvider";
import { useCustomer } from "./hooks/useCustomer";
import { useAppointments } from "./hooks/useAppointments";
import Image from "next/image";
import DateTimePicker from "./components/DateTimePicker";
import DPOConsent from "./components/DPOConsent";
import UserDetailsForm from "./components/UserDetailsForm";

// Mock data for our services, mirroring your schema
const services = [
  { name: "ซ่อมมือถือ", icon: Wrench },
  { name: "ซื้อขายมือถือ", icon: Smartphone },
  { name: "จำนำมือถือ", icon: HandCoins },
  { name: "จำนำไอคลาวด์", icon: ShieldCheck },
  { name: "รีไฟแนนซ์", icon: Repeat },
  { name: "อื่นๆ", icon: Building },
];

const moreInfo = [
  { name: "เกี่ยวกับเรา", icon: Info },
  { name: "ประวัติการจอง", icon: History },
];

// Animation Variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const cardHover = {
  scale: 1.05,
  transition: { type: "spring", stiffness: 300 },
};

const cardTap = {
  scale: 0.95,
};

export default function HomePage() {
  const [appState, setAppState] = useState("selecting_service"); // selecting_service -> user_details -> dpo_consent -> appointment_status
  const { liffProfile, error } = useLiff();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showDPO, setShowDPO] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    appointmentType: "in-store",
    serviceType: "",
    branch: "",
    locationDetails: "",
    customerName: "",
    customerPhone: "",
    appointmentAt: "",
    status: "",
    lineUserId: "",
    lineDisplayName: "",
    lineProfilePicUrl: "",
    depositSlipUrl: "",
    timestamps: "",
  });

  console.log("LIFF Profile:", liffProfile);

  // Get customer data and create appointment functions
  const { customer } = useCustomer(liffProfile?.userId);
  const { appointments, createAppointment, isCreating } = useAppointments(liffProfile?.userId);

  console.log("Customer:", customer);

  const handleServiceSelect = (service) => {
    console.log("Service:", service.name);
    if (service.name === "รีไฟแนนซ์" || service.name === "ซื้อขายมือถือ") {
      setFormData((prev) => ({
        ...prev,
        appointmentType: "off-store",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        appointmentType: "in-store",
      }));
    }
    setFormData((prev) => ({
      ...prev,
      serviceType: service.name,
    }));
    setAppState("selecting_date_time");
  };

  // Effect to show DPO after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasAcceptedDPO = localStorage.getItem("dpo_accepted");
      // Only show DPO on the main service selection page
      if (!hasAcceptedDPO && appState === "selecting_service") {
        setShowDPO(true);
      }
    }, 1000); // Show after 1 second

    return () => clearTimeout(timer);
  }, [appState]); // Add appState as dependency

  const handleAcceptDPO = () => {
    setShowDPO(false);
    localStorage.setItem("dpo_accepted", "true");
  };

  const handleCreateAppointment = async () => {
    if (!formData.appointmentAt || !formData.lineUserId) {
      console.error("Missing required data:", {
        appointmentAt: formData.appointmentAt,
        lineUserId: formData.lineUserId,
      });
      return;
    }

    console.log("Creating appointment with formData:", formData);

    try {
      const newAppointment = await createAppointment({
        // Customer data
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        lineUserId: formData.lineUserId,
        lineDisplayName: formData.lineDisplayName,
        lineProfilePicUrl: formData.lineProfilePicUrl,

        // Appointment data
        appointmentAt: formData.appointmentAt,
        serviceType: formData.serviceType,
        appointmentType: formData.appointmentType,
        note: `Service: ${formData.serviceType}`,
      });
      console.log("Appointment created:", newAppointment);
      setAppState("appointment_status");
    } catch (error) {
      console.error("Failed to create appointment:", error);
    }
  };

  console.log(formData);

  return (
    <>
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={liffProfile}
        customer={customer}
      />
      {showDPO && <DPOConsent onAccept={handleAcceptDPO} />}
      <main className="min-h-screen bg-slate-50 text-gray-800 font-sans p-4">
        <div className="container flex flex-col gap-4 mx-auto">
          {/* === Header === */}
          {/* === Header with Profile Avatar === */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-around items-center mb-10 "
          >
            <div className="flex items-center gap-4 w-full">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1
                onClick={() => setAppState("selecting_service")}
                className="text-1xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800"
              >
                OK Number One Queue
              </h1>
            </div>
            {/* Clickable Profile Avatar */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProfileOpen(true)}
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
                // Placeholder while profile is loading
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
                className="fixed inset-0 z-50 bg-white"
              >
                <div className="p-4">
                  <button onClick={() => setIsMenuOpen(false)} className="mb-4">
                    ✕
                  </button>
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">เมนู</h2>
                    <button
                      onClick={() => {
                        setAppState("appointment_status");
                        setIsMenuOpen(false);
                      }}
                      className="w-full rounded-lg bg-slate-100 p-4 text-left"
                    >
                      คิวของฉัน
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {appState === "selecting_service" && (
              <motion.div key="service_selector" className="flex flex-col gap-8">
                {/* === Latest Appointment Card === */}
                {appointments && appointments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-2"
                  >
                    {(() => {
                      const latest = [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                      const typeMap = {
                        ONSITE: {
                          label: "หน้าร้าน",
                          color: "from-blue-500 to-indigo-600",
                          icon: <Building className="w-5 h-5 mr-1" />,
                        },
                        ONLINE: {
                          label: "ออนไลน์",
                          color: "from-green-400 to-blue-500",
                          icon: <Smartphone className="w-5 h-5 mr-1" />,
                        },
                        OFFSITE: {
                          label: "นอกสถานที่",
                          color: "from-pink-500 to-orange-400",
                          icon: <Wrench className="w-5 h-5 mr-1" />,
                        },
                      };
                      const statusMap = {
                        PENDING: { label: "รอดำเนินการ", bg: "bg-yellow-100", text: "text-yellow-800" },
                        CONFIRMED: { label: "ยืนยันแล้ว", bg: "bg-green-100", text: "text-green-800" },
                        COMPLETED: { label: "เสร็จสิ้น", bg: "bg-blue-100", text: "text-blue-800" },
                        CANCELLED: { label: "ยกเลิก", bg: "bg-gray-200", text: "text-gray-500" },
                        NO_SHOW: { label: "ไม่มาตามนัด", bg: "bg-red-100", text: "text-red-600" },
                      };
                      const type = typeMap[latest.type] || typeMap.ONSITE;
                      const status = statusMap[latest.status] || statusMap.PENDING;
                      return (
                        <motion.div
                          whileHover={{ scale: 1.02, boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.10)" }}
                          className="relative flex flex-col md:flex-row bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-4"
                          style={{
                            borderLeft: `8px solid`,
                            borderImage: `linear-gradient(to bottom, var(--tw-gradient-stops)) 1`,
                          }}
                        >
                          <div
                            className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${type.color} rounded-l-2xl`}
                          />
                          <div className="flex-1 p-5 pl-7">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${type.color} text-white shadow-sm`}
                              >
                                {type.icon}
                                {type.label}
                              </span>
                              <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${status.bg} ${status.text}`}>
                                {status.label}
                              </span>
                            </div>
                            <div className="mb-1 text-lg font-bold text-slate-900">{latest.note}</div>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-2">
                              <div className="flex items-center gap-1">
                                <svg
                                  className="w-4 h-4 text-blue-500"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>
                                  {new Date(latest.date).toLocaleDateString("th-TH", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <svg
                                  className="w-4 h-4 text-indigo-500"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>
                                  {new Date(latest.date).toLocaleTimeString("th-TH", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                              <span className="text-xs text-slate-500">พนักงานที่รับผิดชอบ:</span>
                              {latest.employee && latest.employee.name ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                                  <User className="w-4 h-4 mr-1" />
                                  {latest.employee.name}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold animate-pulse">
                                  <User className="w-4 h-4 mr-1" />
                                  รอเจ้าหน้าที่ยืนยัน
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </motion.div>
                )}
                {/* === Services Section === */}
                <motion.section variants={containerVariants} initial="hidden" animate="visible">
                  <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-4">
                    บริการ
                  </motion.h2>

                  {/* The main grid container with 3 columns and a gap */}
                  <motion.div
                    variants={containerVariants} // Staggers the children inside the grid
                    className="grid grid-cols-3 gap-4"
                  >
                    {services.map((service) => (
                      <motion.div
                        key={service.name}
                        variants={itemVariants}
                        whileHover={cardHover}
                        whileTap={cardTap}
                        // w-full makes the card fit the grid column perfectly
                        className="w-full h-32 bg-white rounded-2xl drop-shadow-md shadow-black/25 flex flex-col items-center justify-center text-center p-4 cursor-pointer border border-gray-100"
                        onClick={() => handleServiceSelect(service)}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center mb-2">
                          <service.icon size={24} />
                        </div>
                        <span className="text-sm font-semibold">{service.name}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.section>

                {/* === More Information Section === */}
                <motion.section
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className=" flex flex-col gap-2"
                >
                  <motion.h2 variants={itemVariants} className="text-2xl font-bold ">
                    ข้อมูลเพิ่มเติม
                  </motion.h2>
                  <div className="overflow-x-auto scrollbar-hide">
                    <motion.div variants={containerVariants} className="grid grid-flow-col auto-cols-max gap-6 p-2">
                      {moreInfo.map((info) => (
                        <motion.div
                          key={info.name}
                          variants={itemVariants}
                          whileHover={cardHover}
                          whileTap={cardTap}
                          className="w-48 h-32 bg-white rounded-2xl drop-shadow-md drop-shadow-black/10 flex items-center p-4 cursor-pointer border border-gray-100"
                        >
                          <div className="w-12 h-12 bg-gray-100 text-indigo-700 rounded-full flex items-center justify-center mr-4 shrink-0">
                            <info.icon size={28} />
                          </div>
                          <div>
                            <span className="text-lg font-bold">{info.name}</span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.section>
              </motion.div>
            )}

            {appState === "selecting_date_time" && (
              <motion.div key="date_time_picker">
                <DateTimePicker
                  formData={formData}
                  setFormData={setFormData}
                  setAppState={setAppState}
                  onComplete={() => setAppState("user_details")}
                />
              </motion.div>
            )}

            {appState === "user_details" && (
              <motion.div key="user_details">
                {/* Listen for custom back event from UserDetailsForm */}
                <BackEventBridge onBack={() => setAppState("selecting_date_time")} />
                <UserDetailsForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={() => setAppState("dpo_consent")}
                  liffProfile={liffProfile}
                />
              </motion.div>
            )}

            {appState === "dpo_consent" && (
              <motion.div key="dpo_consent">
                <DPOConsent
                  onAccept={() => {
                    handleAcceptDPO();
                    handleCreateAppointment();
                  }}
                />
              </motion.div>
            )}

            {appState === "appointment_status" && (
              <motion.div key="appointment_status" className="p-4">
                <h2 className="text-xl font-semibold mb-4">คิวของฉัน</h2>
                {isCreating && <p>กำลังสร้างการจอง...</p>}
                {appointments && appointments.length > 0 ? (
                  <div className="space-y-6">
                    {appointments.map((appointment) => {
                      // Color and icon for type
                      const typeMap = {
                        ONSITE: {
                          label: "หน้าร้าน",
                          color: "from-blue-500 to-indigo-600",
                          icon: <Building className="w-5 h-5 mr-1" />,
                        },
                        ONLINE: {
                          label: "ออนไลน์",
                          color: "from-green-400 to-blue-500",
                          icon: <Smartphone className="w-5 h-5 mr-1" />,
                        },
                        OFFSITE: {
                          label: "นอกสถานที่",
                          color: "from-pink-500 to-orange-400",
                          icon: <Wrench className="w-5 h-5 mr-1" />,
                        },
                      };
                      const statusMap = {
                        PENDING: { label: "รอดำเนินการ", bg: "bg-yellow-100", text: "text-yellow-800" },
                        CONFIRMED: { label: "ยืนยันแล้ว", bg: "bg-green-100", text: "text-green-800" },
                        COMPLETED: { label: "เสร็จสิ้น", bg: "bg-blue-100", text: "text-blue-800" },
                        CANCELLED: { label: "ยกเลิก", bg: "bg-gray-200", text: "text-gray-500" },
                        NO_SHOW: { label: "ไม่มาตามนัด", bg: "bg-red-100", text: "text-red-600" },
                      };
                      const type = typeMap[appointment.type] || typeMap.ONSITE;
                      const status = statusMap[appointment.status] || statusMap.PENDING;
                      return (
                        <div
                          key={appointment.id}
                          className={`relative flex flex-col md:flex-row bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden`}
                          style={{
                            borderLeft: `8px solid`,
                            borderImage: `linear-gradient(to bottom, var(--tw-gradient-stops)) 1`,
                          }}
                        >
                          {/* Colored left border using gradient */}
                          <div
                            className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${type.color} rounded-l-2xl`}
                          />
                          <div className="flex-1 p-5 pl-7">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${type.color} text-white shadow-sm`}
                              >
                                {type.icon}
                                {type.label}
                              </span>
                              <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${status.bg} ${status.text}`}>
                                {status.label}
                              </span>
                            </div>
                            <div className="mb-1 text-lg font-bold text-slate-900">{appointment.note}</div>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-2">
                              <div className="flex items-center gap-1">
                                <svg
                                  className="w-4 h-4 text-blue-500"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>
                                  {new Date(appointment.date).toLocaleDateString("th-TH", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <svg
                                  className="w-4 h-4 text-indigo-500"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>
                                  {new Date(appointment.date).toLocaleTimeString("th-TH", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">ไม่มีการจองในขณะนี้</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}

function BackEventBridge({ onBack }) {
  useEffect(() => {
    const handler = () => onBack();
    window.addEventListener("go-back-to-datetime", handler);
    return () => window.removeEventListener("go-back-to-datetime", handler);
  }, [onBack]);
  return null;
}
