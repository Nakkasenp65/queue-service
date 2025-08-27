"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Smartphone, Repeat, HandCoins, ShieldCheck, Building, Wrench, Info, History, User } from "lucide-react";
import ProfileModal from "@/app/components/ProfileModal";
import { useState, useEffect } from "react";
import { useLiff } from "@/app/components/Provider/LiffProvider";
import { useCustomer } from "@/app/hooks/useCustomer";
import { useGetAppointments } from "@/app/hooks/useAppointments";
import DateTimePicker from "@/app/components/DateTimePicker";
import DPOConsent from "@/app/components/DPOConsent";
import UserDetailsForm from "@/app/components/UserDetailsForm";
import ServiceSelection from "@/app/components/ServiceSelection";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
    note: "", // Add note field to initial state
  });

  const { customer, isLoading: isCustomerLoading } = useCustomer(liffProfile?.userId || null);
  const { data: appointments, createAppointment, isCreating } = useGetAppointments(liffProfile?.userId);

  const handleServiceSelect = (service) => {
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

  const handleAcceptDPO = () => {
    setShowDPO(false);
    localStorage.setItem("dpo_accepted", "true");
  };

  // จองคิว
  const handleCreateAppointment = async () => {
    if (!formData.appointmentAt || !formData.lineUserId) {
      console.error("Missing required data:", {
        appointmentAt: formData.appointmentAt,
        lineUserId: formData.lineUserId,
      });
      return;
    }

    // Automatic tag assignment based on service
    const getRequiredTags = (serviceType) => {
      switch (serviceType) {
        case "รีไฟแนนซ์":
          return ["REFINANCE"];
        case "ซ่อมมือถือ":
          return ["ENGINEER"];
        default:
          return ["GENERAL"];
      }
    };

    try {
      const newAppointment = await createAppointment({
        // Customer data - will be created if doesn't exist
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        lineUserId: formData.lineUserId,
        lineDisplayName: formData.lineDisplayName,
        lineProfilePicUrl: formData.lineProfilePicUrl,

        // Appointment data
        appointmentAt: formData.appointmentAt,
        serviceType: formData.serviceType,
        appointmentType: formData.appointmentType,
        note: formData.note || `Service: ${formData.serviceType}`, // Use custom note or fallback

        // Automatic tags based on service
        requiredTags: getRequiredTags(formData.serviceType),
      });
      console.log(newAppointment);
      // ไปหน้ารายการนัดหมาย
      router.push("/appointments/my-appointment");
    } catch (error) {
      console.error("Failed to create appointment:", error);
    }
  };

  useEffect(() => {
    const goHome = () => setAppState("selecting_service");
    const goAppointments = () => setAppState("appointment_status");
    const openProfile = () => setIsProfileOpen(true);
    window.addEventListener("go-home", goHome);
    window.addEventListener("go-appointments", goAppointments);
    window.addEventListener("open-profile", openProfile);
    return () => {
      window.removeEventListener("go-home", goHome);
      window.removeEventListener("go-appointments", goAppointments);
      window.removeEventListener("open-profile", openProfile);
    };
  }, []);

  console.log("Check liff Profile: ", liffProfile);
  console.log("Check customer: ", customer);
  console.log("Check appointment: ", appointments);

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
          <AnimatePresence mode="wait">
            {/* -------------- หน้าเลือกบริการ -------------- */}
            {appState === "selecting_service" && (
              <ServiceSelection customer={customer} onServiceSelect={handleServiceSelect} />
            )}

            {/* -------------- หน้าแสดงคิว เลือกวันที่ -------------- */}
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

            {/* -------------- หน้ากรอกรายละเอียดผู้ใช้ + DPO -------------- */}
            {appState === "user_details" && (
              <motion.div key="user_details">
                <BackEventBridge onBack={() => setAppState("selecting_date_time")} />
                <UserDetailsForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleCreateAppointment}
                  liffProfile={liffProfile}
                />
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
