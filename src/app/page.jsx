"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Smartphone, Repeat, HandCoins, ShieldCheck, Building, Wrench, Info, History } from "lucide-react";
import ProfileModal from "./components/ProfileModal";
import { useState } from "react";
import { useLiff } from "./components/Provider/LiffProvider";
import Image from "next/image";
import DateTimePicker from "./components/DateTimePicker";

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

const formData = {};

export default function HomePage() {
  const [appState, setAppState] = useState("selecting_service");
  const { liffProfile, error } = useLiff();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  console.log(formData);

  return (
    <>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} profile={liffProfile} />
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
            {/* Centered Title */}
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800   w-full">
              ระบบจองคิวออนไลน์
            </h1>
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

          <AnimatePresence mode="wait">
            {appState === "selecting_service" && (
              <motion.div key="service_selector" className="flex flex-col gap-8">
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
                <DateTimePicker formData={formData} setFormData={setFormData} setAppState={setAppState} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
