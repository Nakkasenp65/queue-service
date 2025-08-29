"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useLiff } from "@/app/components/Provider/LiffProvider";
import { useCustomer } from "@/app/hooks/useCustomer";
import { useCreateAppointment, useGetDisplayAppointment } from "@/app/hooks/useAppointments";

import DateTimePicker from "@/app/components/DateTimePicker";
import DPOConsent from "@/app/components/DPOConsent";
import UserDetailsForm from "@/app/components/UserDetailsForm";
import ServiceSelection from "@/app/components/ServiceSelection";

export default function HomePage() {
  const router = useRouter();
  const { liffProfile } = useLiff();
  const [appState, setAppState] = useState("selecting_service");
  const [formData, setFormData] = useState({
    appointmentType: "onsite", // default value
    serviceType: "",
    customerName: "",
    customerPhone: "",
    appointmentAt: "",
    lineUserId: liffProfile?.userId || "",
    lineDisplayName: liffProfile?.displayName || "",
    lineProfilePicUrl: liffProfile?.pictureUrl || "",
    email: liffProfile?.email || "",
    note: "",
  });
  const [showDPO, setShowDPO] = useState(false);
  const { customer, isLoading: isCustomerLoading } = useCustomer(liffProfile?.userId || null);
  const { mutate: createAppointment, isPending: isCreating } = useCreateAppointment();

  const handleServiceSelect = (service) => {
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

  const handleCreateAppointment = async () => {
    if (!formData.appointmentAt || !formData.lineUserId) {
      console.error("Missing required data: appointmentAt or lineUserId");
      Swal.fire("ข้อมูลไม่ครบ", "กรุณาเลือกวันและเวลาที่ต้องการนัดหมาย", "warning");
      return;
    }

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

    // 4. (สำคัญ) ปรับ Payload ให้ Key ตรงกับที่ Backend Controller คาดหวัง
    const appointmentPayload = {
      // Customer data for findOrCreate logic in backend
      fullname: formData.customerName,
      phone: formData.customerPhone,
      line_user_id: formData.lineUserId,
      line_display_name: formData.lineDisplayName,
      picture_url: formData.lineProfilePicUrl,
      email: formData.email,
      // Appointment data
      appointmentAt: formData.appointmentAt,
      date: formData.appointmentAt,
      type: formData.appointmentType.toUpperCase(), // ONSITE, OFFSITE, ONLINE
      note: formData.note || `Service: ${formData.serviceType}`,
      requiredTags: getRequiredTags(formData.serviceType),
    };

    // 5. เรียกใช้ Mutation และจัดการผลลัพธ์ใน callback
    createAppointment(appointmentPayload, {
      onSuccess: (newAppointment) => {
        console.log("Successfully created appointment:", newAppointment);
        Swal.fire({
          title: "จองคิวสำเร็จ!",
          text: "การนัดหมายของคุณได้รับการบันทึกแล้ว",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        // 6. (สำคัญ) ย้าย router.push มาไว้ที่นี่ เพื่อให้ทำงานหลังจองสำเร็จเท่านั้น
        router.push("/appointments/my-appointment");
      },
      onError: (error) => {
        console.error("Failed to create appointment:", error);
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: error.message || "ไม่สามารถสร้างนัดหมายได้ กรุณาลองใหม่อีกครั้ง",
          icon: "error",
        });
      },
    });
  };

  useEffect(() => {
    const goHome = () => setAppState("selecting_service");
    const openProfile = () => setIsProfileOpen(true);
    window.addEventListener("go-home", goHome);
    window.addEventListener("open-profile", openProfile);
    return () => {
      window.removeEventListener("go-home", goHome);
      window.removeEventListener("open-profile", openProfile);
    };
  }, []);

  return (
    <>
      {showDPO && <DPOConsent onAccept={handleAcceptDPO} />}
      <main className="min-h-screen bg-slate-100 text-gray-800 font-sans p-4">
        <div className="container flex flex-col gap-4 mx-auto">
          <AnimatePresence mode="wait">
            {/* -------------- หน้าเลือกบริการ -------------- */}
            {appState === "selecting_service" && (
              <ServiceSelection customer={customer} onServiceSelect={handleServiceSelect} />
            )}

            {/* -------------- หน้าแสดงคิว เลือกวันที่ -------------- */}
            {appState === "selecting_date_time" && (
              <motion.div key="date_time_picker">
                <DateTimePicker formData={formData} setFormData={setFormData} setAppState={setAppState} />
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
                  isSubmitting={isCreating}
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
