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

export default function HomePage() {
  // ------------------ INITIAL DATA ------------------
  const { liffProfile } = useLiff();
  const { data: customerData, isLoading: customerLoading } = useGetCustomer(liffProfile?.sub);

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
    lineUserId: "",
    lineDisplayName: "",
    lineProfilePicUrl: "",
    email: "",
    note: "",
    locationCategory: null,
    locationDetail: null,
  });

  useEffect(() => {
    if (liffProfile) {
      setFormData((prev) => ({
        ...prev,
        lineUserId: liffProfile.sub,
        lineDisplayName: liffProfile.name,
        lineProfilePicUrl: liffProfile.picture,
        email: liffProfile.email,
      }));
    }
  }, [liffProfile]);

  console.log("LIFFPROFILE : ", liffProfile);
  console.log("FORMDATA : ", formData);

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
    console.log("Form Data in the handleCreateClicked", formData);
    if (!formData.appointmentAt || !formData.lineUserId) {
      console.error("Missing required data:", {
        appointmentAt: formData.appointmentAt,
        lineUserId: formData.lineUserId,
      });
      Swal.fire("ข้อมูลไม่ครบ", "กรุณาเลือกวันและเวลา หรือรอข้อมูลผู้ใช้สักครู่", "warning");
      return;
    }

    if (
      formData.serviceType === "รีไฟแนนซ์" &&
      formData.appointmentType === "offsite" &&
      !formData.locationDetail
    ) {
      Swal.fire("ข้อมูลไม่ครบ", "กรุณาเลือกสถานที่นัดหมายนอกสถานที่", "warning");
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

    let finalNote = formData.note || `Service: ${formData.serviceType}`;
    if (
      formData.appointmentType === "offsite" &&
      formData.locationCategory &&
      formData.locationDetail
    ) {
      finalNote += `\nสถานที่นัดหมาย: ${formData.locationCategory.label} - ${formData.locationDetail.label}`;
    }

    const appointment = {
      appointmentType: formData.appointmentType,
      serviceType: formData.serviceType,
      appointmentAt: formData.appointmentAt,
      date: formData.appointmentAt,
      type: formData.appointmentType.toUpperCase(),
      note: finalNote,
      requiredTags: getRequiredTags(formData.serviceType),
    };

    const mutationConfig = {
      onSuccess: () => {
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
    };

    if (!customerData) {
      createNewUserAppointment({ customer, appointment }, mutationConfig);
    } else {
      createAppointment({ appointment, customerId: customerData.id }, mutationConfig);
    }
  };

  useEffect(() => {
    const goHome = () => setAppState("selecting_service");
    window.addEventListener("go-home", goHome);
    return () => {
      window.removeEventListener("go-home", goHome);
    };
  }, []);

  useEffect(() => {
    if (!isCreating) setPressed(false);
  }, [isCreating]);

  return (
    <div className="py-24">
      {showDPO && <DPOConsent onAccept={handleAcceptDPO} />}
      <section className="relative flex min-h-screen flex-col font-sans text-gray-800">
        <div className="flex h-full flex-col gap-4 p-4">
          <AnimatePresence mode="wait">
            {appState === "selecting_service" && (
              <motion.div
                key="service_selection_view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-8"
              >
                <ServiceSelection customer={customerData} onServiceSelect={handleServiceSelect} />
                {customerData && (
                  <div className="flex flex-col gap-2">
                    <h1 className="text-lg font-bold">รายการคิวปัจจุบัน</h1>
                    <LatestAppointmentCard
                      appointment={customerData?.appointments[0] || null}
                      loading={customerLoading}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {appState === "selecting_date_time" && (
              <motion.div
                key="date_time_picker"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
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

            {appState === "user_details" && (
              <motion.div
                key="user_details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <UserDetailsForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleCreateAppointment}
                  customer={customerData}
                  isLoading={customerLoading}
                  liffProfile={liffProfile}
                  isSubmitting={isCreating || isCreatingNewUser}
                  isCreating={isCreating || isCreatingNewUser}
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
          <BottomNavbar liffProfile={liffProfile} />
        </div>
      </section>
    </div>
  );
}
