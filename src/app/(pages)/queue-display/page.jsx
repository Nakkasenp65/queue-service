"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMock, useUpdateMock } from "./hooks/useAppointment";
import QueueListItem from "./components/QueueListItem";
import QueueNumberBadge from "./components/QueueNumberBadge";
import AudioPlayer from "../../components/AudioPlayer";
const youtubeUrl = `https://www.youtube.com/embed/videoseries?list=${process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID}&autoplay=1&mute=1&loop=1&controls=0&playlist=${process.env.NEXT_PUBLIC_YOUTUBE_FIRST_VIDEO_ID}`;

// =====================================================================
//  ส่วนประกอบย่อย (Components)
// =====================================================================

/* 

นับเวลา 10 วิทันทีถ้า appointment ไม่เหมือนเดิมและมี calling
นับเวลา 30 วิทันทีถ้า appointment ไม่เหมือนเดิมและมี calling
หลังจาก 10 วิให้อ่านคิวอีกครั้งนับทบ
หลังจาก 30 วิถ้าไม่มี calling ให้ปิดแท็บไป

ถ้าทบครบ 2 รอบจะเปลี่ยน appointment จาก calling ไปเป็น skip

*/

function CurrentQueueSection({ appointment }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={`flex w-full flex-col items-center`}
    >
      <div className="flex w-full flex-col items-center gap-3">
        <h2 className="text-7xl font-bold text-white">กำลังเรียกหมายเลขคิว</h2>
        <div className="h-2 w-56 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
      </div>
      <div className="mt-10 flex w-full flex-col items-center justify-center gap-16">
        <QueueNumberBadge queueNumber={appointment?.queueNumber} size="lg" />
        <div className="flex w-full items-center gap-10">
          {/* ชื่อ + รูป + service */}
          <div className="flex w-full items-center gap-12">
            <div className="h-[256px] w-[256px] rounded-full bg-black" />
            <div className="flex flex-col gap-8">
              <h3 className="text-[80px] font-bold text-white">
                {appointment?.customerName}
              </h3>
              <p className="text-7xl text-white">{appointment?.serviceName}</p>
            </div>
          </div>
          {/* CHANNEL */}
          <div className="flex h-full w-max items-center gap-5 rounded-3xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-amber-500/30 px-8 py-5">
            <span className="text-[156px] font-bold text-nowrap text-white">
              ช่อง {appointment?.channel}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function QueueListSection({ title, appointments, color, isRecent = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col gap-8 rounded-4xl border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/60 p-10 backdrop-blur-sm"
    >
      <header className="flex items-center gap-5 border-b border-white/10 pb-6">
        <div className={`h-8 w-8 rounded-full ${color}`}></div>
        <h3 className="text-6xl font-bold text-white">{title}</h3>
      </header>
      <div className="flex flex-col gap-6">
        {appointments?.map((apt) => (
          <QueueListItem key={apt.id} appointment={apt} isRecent={isRecent} />
        ))}
      </div>
    </motion.div>
  );
}

// calling = คิวที่มีสถานะ calling
// recent = คิวที่มีสถานะไม่ใช่ calling: {กำลังเข้ารับบริการ / คิวเก่า}
// isNew = แสดงตัวเดียวโดดๆ
function QueueTab({ calling, recent, isNew }) {
  const [showFullLayout, setShowFullLayout] = useState(!isNew);
  const currentAppointmentToShow =
    calling && calling.length > 0 ? calling[0] : null;

  useEffect(() => {
    if (isNew) {
      setShowFullLayout(false);
      const timer = setTimeout(() => setShowFullLayout(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew, calling]);

  const tabVariants = {
    hidden: { x: "100%", opacity: 0 },
    // เปลี่ยน transition จาก spring เป็น easeInOut
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeInOut",
      },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.5 } },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute top-0 right-0 z-40 h-full w-2/5 overflow-hidden border-l border-white/10 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-blue-900/95 p-12 shadow-2xl shadow-black/70 backdrop-blur-2xl"
    >
      <motion.div
        layout
        transition={{ duration: 1.0, ease: "easeInOut" }}
        className={`flex h-full flex-col gap-16 overflow-y-auto ${!showFullLayout ? "items-center justify-center" : "pt-8"}`}
      >
        <CurrentQueueSection appointment={currentAppointmentToShow} />
        <div className="h-1 w-full rounded-full bg-white/20" />
        <AnimatePresence>
          {showFullLayout && (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="flex flex-col gap-10"
            >
              {/* RECENT QUEUE */}
              <motion.div variants={itemVariant}>
                <QueueListSection
                  title="คิวที่เรียกแล้ว"
                  appointments={recent}
                  color="bg-red-400"
                  isRecent={true}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function QueueDisplayPage() {
  const [audioTrigger, setAudioTrigger] = useState({
    count: 0, // ตัวเลขที่จะเปลี่ยนทุกครั้งที่เรียก เพื่อกระตุ้น useEffect
    text: "", // ข้อความคิว เช่น "G-1105"
    channel: "", // หมายเลขช่องบริการ
  });
  const { data: mockData, isLoading, isError } = useGetMock();
  const { mutate: updateAppointmentStatus } = useUpdateMock();
  const { appointments, mockConfigDisplayPage } = mockData?.mockQueue || {};

  const callingAppointments = appointments
    ?.filter((apt) => apt.status === "Calling")
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const recentAppointments = appointments
    ?.filter((apt) => apt.status === "Finished" || apt.status === "Skip")
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const [tabDisplay, setTabDisplay] = useState(false);
  const [isNewQueue, setIsNewQueue] = useState(false);
  const callingRef = useRef({ appointmentId: null, count: 0 });
  const timersRef = useRef([]);
  const previousCallingRef = useRef(null);

  const handleUpdateStatus = (appointmentId, newStatus) => {
    console.log(
      `[ACTION] กำลังส่งคำสั่งอัพเดท ID: ${appointmentId} เป็นสถานะ: ${newStatus}`,
    );
    // ในการใช้งานจริง ให้เรียกฟังก์ชันที่ยิง API ไปยัง backend/Supabase
    // await updateAppointmentStatus({ id: appointmentId, status: newStatus });
  };

  const triggerAudioAnnouncement = (appointment) => {
    if (!appointment) return;

    console.log(`[AUDIO] เล่นเสียงประกาศคิว: ${appointment.queueNumber}`);
    setAudioTrigger((prev) => ({
      count: prev.count + 1,
      text: appointment.queueNumber,
      channel: appointment.channel,
    }));
  };

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const currentCalling = callingAppointments?.[0];
    const isCurrentCallingExists = Boolean(currentCalling);

    console.log("[DEBUG] Current calling:", currentCalling);
    console.log("[DEBUG] Previous calling:", previousCallingRef.current);

    if (isCurrentCallingExists) {
      // เมื่อมีคิว "Calling" ใหม่เข้ามา ให้แสดง Tab ทันที
      setTabDisplay(true);
      handleCallNewQueueAnimation();

      const isNewCalling =
        !previousCallingRef.current ||
        previousCallingRef.current.id !== currentCalling.id;

      if (isNewCalling) {
        console.log("[NEW QUEUE] พบคิวใหม่:", currentCalling.queueNumber);

        // รีเซ็ต calling ref
        callingRef.current = { appointmentId: currentCalling.id, count: 0 };

        // เล่นเสียงทันที
        triggerAudioAnnouncement(currentCalling);

        // อัพเดท previous calling
        previousCallingRef.current = currentCalling;
      }

      // --- ตั้งเวลา 30 วินาทีเพื่อ "พิจารณา" ซ่อน Tab ---
      const hideTabTimer = setTimeout(() => {
        // **ปรับปรุงตามเงื่อนไขข้อ 5**
        // ณ วินาทีที่ 30 ให้เช็คข้อมูลล่าสุดอีกครั้ง
        // ถ้าไม่มีคิว Calling แล้วจริงๆ ถึงจะซ่อน Tab
        if (callingAppointments?.length === 0) {
          setTabDisplay(false);
        }
      }, 30000);
      timersRef.current.push(hideTabTimer);

      // --- Logic การนับการเรียกซ้ำ 2 ครั้ง ---
      if (currentCalling.id === callingRef.current.appointmentId) {
        callingRef.current = { appointmentId: currentCalling.id, count: 0 };

        setAudioTrigger((prev) => ({
          count: prev.count + 1,
          text: currentCalling.queueNumber,
          channel: currentCalling.channel,
        }));
      }

      // ตั้งเวลานับครั้งที่ 1 (10 วินาที)
      const firstCallTimer = setTimeout(() => {
        if (callingRef.current.appointmentId === currentCalling.id) {
          callingRef.current.count = 1;
          console.log(
            `[CALL COUNT] ${currentCalling.customerName} ถูกเรียกครั้งที่ 1`,
          );
          setAudioTrigger((prev) => ({
            count: prev.count + 1,
            text: currentCalling.queueNumber,
            channel: currentCalling.channel,
          }));

          // ตั้งเวลานับครั้งที่ 2 (อีก 10 วินาที)
          const secondCallTimer = setTimeout(() => {
            if (callingRef.current.appointmentId === currentCalling.id) {
              callingRef.current.count = 2;
              console.log(
                `[CALL COUNT] ${currentCalling.customerName} ถูกเรียกครั้งที่ 2`,
              );

              // **ปรับปรุงตามเงื่อนไขข้อ 4**
              // เมื่อนับครบ 2 ครั้ง ให้เรียกฟังก์ชันเปลี่ยนสถานะ
              handleUpdateStatus(currentCalling.id, "Skip");
              console.log(currentCalling.id, "Skip");
            }
          }, 10000);
          timersRef.current.push(secondCallTimer);
        }
      }, 10000);
      timersRef.current.push(firstCallTimer);
    } else {
      // ถ้าไม่มีคิว "Calling" เลย ให้ซ่อน Tab
      setTabDisplay(false);
      callingRef.current = { appointmentId: null, count: 0 };
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [appointments]);

  const handleCallNewQueueAnimation = () => {
    setIsNewQueue(true);
    const timer = setTimeout(() => setIsNewQueue(false), 5000);
    timersRef.current.push(timer);
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black">
      <AudioPlayer
        announcementText={audioTrigger.text}
        trigger={audioTrigger.count}
        channel={audioTrigger.channel}
      />
      {/* VIDEO BACKGROUD */}
      <div className="absolute inset-0 z-10">
        <iframe
          className="h-full w-full"
          src={youtubeUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* PURPLE FILTER */}
      <AnimatePresence>
        {tabDisplay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="absolute z-20 h-dvh w-full bg-gradient-to-r from-blue-900/50 via-purple-900/25 to-indigo-900/50"
          />
        )}
      </AnimatePresence>

      {/* WEBSITE FILTER */}
      <img
        alt="website logo"
        src={"/NO1Money_LOGO_GIF.gif"}
        className="absolute top-0 left-0 z-20 h-40 w-auto"
      />

      {/* QUEUE TAB */}
      <AnimatePresence>
        {tabDisplay && (
          <QueueTab
            calling={callingAppointments}
            recent={recentAppointments}
            isNew={isNewQueue}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
