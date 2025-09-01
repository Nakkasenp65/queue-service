"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDays } from "date-fns";
import Swal from "sweetalert2";
import { useLiff } from "@/app/components/Provider/LiffProvider";
import { useGetCustomer } from "@/app/(pages)/queue-services/hooks/useCustomer";
import {
  useCreateAppointment,
  useCreateNewUserAppointment,
  useGetAvailability,
} from "@/app/(pages)/queue-services/hooks/useAppointments";
import DateTimePicker from "./components/DateTimePicker";
import DPOConsent from "@/app/(pages)/queue-services/components/DPOConsent";
import UserDetailsForm from "@/app/(pages)/queue-services/components/UserDetailsForm";
import ServiceSelection from "@/app/(pages)/queue-services/components/ServiceSelection";
import LatestAppointmentCard from "@/app/(pages)/queue-services/components/LatestAppointmentCard";
import BottomNavbar from "./components/BottomNavbar";
import Navbar from "@/app/components/Navbar";

export default function HomePage() {
  // ------------------ INITIAL DATA ------------------
  const { liffProfile } = useLiff();
  const { data: customerData, isLoading: customerLoading } = useGetCustomer(
    liffProfile?.userId || null,
  );

  // ------------------ DATE AND AVAILABILITY STATE ------------------
  const today = new Date();
  const daysList = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const [selectedDate, setSelectedDate] = useState(daysList[0]);
  const {
    data: availability,
    isLoading: availabilityLoading,
    error: availabilityError,
  } = useGetAvailability(selectedDate);

  // ------------------ MUTATION ------------------
  const { mutate: createAppointment, isPending: isCreating } = useCreateAppointment();
  const { mutate: createNewUserAppointment, isPending: isCreatingNewUser } =
    useCreateNewUserAppointment();
  const router = useRouter();
  const [showDPO, setShowDPO] = useState(false);
  const [appState, setAppState] = useState("selecting_service");
  const [acceptDPO, setAcceptDPO] = useState(false);
  const [showDPOContent, setShowDPOContent] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [formData, setFormData] = useState({
    appointmentType: "onsite",
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
    console.log("Creating appointment with data:", formData);
    if (!formData.appointmentAt || !formData.lineUserId) {
      console.error("Missing required data: appointmentAt or lineUserId");
      Swal.fire("ข้อมูลไม่ครบ", "กรุณาเลือกวันและเวลาที่ต้องการนัดหมาย", "warning");
      return;
    }

    setPressed(true);

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

    const customer = {
      line_display_name: formData.lineDisplayName,
      fullname: formData.customerName,
      phone: formData.customerPhone,
      line_user_id: formData.lineUserId,
      email: formData.email,
      picture_url: formData.lineProfilePicUrl,
    };

    const appointment = {
      appointmentType: formData.appointmentType,
      serviceType: formData.serviceType,
      appointmentAt: formData.appointmentAt,
      date: formData.appointmentAt,
      type: formData.appointmentType.toUpperCase(),
      note: formData.note || `Service: ${formData.serviceType}`,
      requiredTags: getRequiredTags(formData.serviceType),
    };

    if (!customerData) {
      createNewUserAppointment(
        { customer, appointment },
        {
          onSuccess: (newAppointment) => {
            Swal.fire({
              title: "จองคิวสำเร็จ!",
              text: "การนัดหมายของคุณได้รับการบันทึกแล้ว",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
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
        },
      );
    } else {
      createAppointment(
        { appointment, customerId: customerData.id },
        {
          onSuccess: (newAppointment) => {
            Swal.fire({
              title: "จองคิวสำเร็จ!",
              text: "การนัดหมายของคุณได้รับการบันทึกแล้ว",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
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
        },
      );
    }
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

  // When parent submission state changes to false, clear local pressed state
  useEffect(() => {
    if (!isCreating) setPressed(false);
  }, [isCreating]);

  return (
    <div>
      {showDPO && <DPOConsent onAccept={handleAcceptDPO} />}
      <Navbar />
      <section className="relative flex min-h-screen flex-col font-sans text-gray-800">
        <div className="flex h-full flex-col gap-4 p-4">
          {/* Added pt-24 for navbar space */}
          <AnimatePresence>
            {appState === "selecting_service" && (
              <motion.div key="service_selection_view" className="flex flex-col gap-4">
                {customerData && (
                  <LatestAppointmentCard
                    appointment={customerData?.appointments[0] || null}
                    loading={customerLoading}
                  />
                )}

                <ServiceSelection customer={customerData} onServiceSelect={handleServiceSelect} />
              </motion.div>
            )}

            {/* -------------- หน้าแสดงคิว เลือกวันที่ -------------- */}
            {appState === "selecting_date_time" && (
              <motion.div key="date_time_picker">
                <DateTimePicker
                  formData={formData}
                  setFormData={setFormData}
                  setAppState={setAppState}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  daysList={daysList}
                  availability={availability}
                  availabilityLoading={availabilityLoading}
                  availabilityError={availabilityError}
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
                  customer={customerData}
                  isLoading={customerLoading}
                  liffProfile={liffProfile}
                  isSubmitting={isCreating}
                  isCreating={isCreating}
                  acceptDPO={acceptDPO}
                  setAcceptDPO={setAcceptDPO}
                  showDPOContent={showDPOContent}
                  setShowDPOContent={setShowDPOContent}
                  pressed={pressed}
                  setPressed={setPressed}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div>
          {/* Bottom Navigation */}
          <BottomNavbar liffProfile={liffProfile} />
        </div>
      </section>
    </div>
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
