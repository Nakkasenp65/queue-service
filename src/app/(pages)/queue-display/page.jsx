"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMock, useUpdateMock } from "./hooks/useAppointment";
import QueueListItem from "./components/QueueListItem"; // Assuming this component exists and is styled
import QueueNumberBadge from "./components/QueueNumberBadge"; // Assuming this component exists and is styled
import AudioPlayer from "../../components/AudioPlayer";
const youtubeUrl = `https://www.youtube.com/embed/videoseries?list=${process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID}&autoplay=1&mute=1&loop=1&controls=0&playlist=${process.env.NEXT_PUBLIC_YOUTUBE_FIRST_VIDEO_ID}`;

// =====================================================================
//  Main Page Component (Logic is UNTOUCHED)
// =====================================================================
export default function QueueDisplayPage() {
  // --- STATE AND HOOKS (Correct Logic) ---
  const [audioTrigger, setAudioTrigger] = useState({
    count: 0,
    text: "",
    channel: "",
    firstTime: true,
  });
  const { data: mockData, isLoading, isError } = useGetMock();
  const { mutate: updateAppointmentStatus } = useUpdateMock();
  const { appointments } = mockData || {};

  const callingAppointments = useMemo(() => {
    return appointments
      ?.filter((apt) => apt.status === "Calling")
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [appointments]);

  const recentAppointments = useMemo(() => {
    return appointments
      ?.filter((apt) => apt.status === "Finished" || apt.status === "Skip")
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [appointments]);

  const currentCallingId = callingAppointments?.[0]?.id ?? null;

  const [tabDisplay, setTabDisplay] = useState(false);
  const [isNewQueue, setIsNewQueue] = useState(false);
  const callingRef = useRef({ appointmentId: null, count: 0 });
  const timersRef = useRef([]);
  const previousCallingRef = useRef(null);

  const handleUpdateStatus = (appointmentId, newStatus) => {
    console.log(
      `[ACTION] Sending update for ID: ${appointmentId} to status: ${newStatus}`,
    );
    // updateAppointmentStatus({ id: appointmentId, status: newStatus });
  };

  const triggerAudioAnnouncement = (appointment) => {
    if (!appointment) return;
    console.log(
      `[AUDIO] Playing announcement for queue: ${appointment.queueNumber}`,
    );
    setAudioTrigger((prev) => ({
      count: prev.count + 1,
      text: appointment.queueNumber,
      channel: appointment.channel,
    }));
  };

  // --- MAIN useEffect (Correct Logic - UNTOUCHED) ---
  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // ตัวแรกของ callingAppointments ที่มีแล้ว
    const currentCalling = callingAppointments?.[0];
    const isCurrentCallingExists = Boolean(currentCalling);

    if (isCurrentCallingExists) {
      setTabDisplay(true);
      handleCallNewQueueAnimation();

      const isNewCalling =
        !previousCallingRef.current ||
        previousCallingRef.current.id !== currentCalling.id;

      if (isNewCalling) {
        console.log("[NEW QUEUE] Found new queue:", currentCalling.queueNumber);
        // จำตัวปัจจุบัน CallingRef
        callingRef.current = { appointmentId: currentCalling.id, count: 0 };
        triggerAudioAnnouncement(currentCalling);
        previousCallingRef.current = currentCalling;
      }

      const hideTabTimer = setTimeout(() => {
        if (callingAppointments?.length === 0) {
          setTabDisplay(false);
        }
      }, 25000);
      timersRef.current.push(hideTabTimer);

      if (currentCalling.id === callingRef.current.appointmentId) {
        callingRef.current = { appointmentId: currentCalling.id, count: 0 };
        setAudioTrigger((prev) => ({
          count: prev.count + 1,
          text: currentCalling.queueNumber,
          channel: currentCalling.channel,
          firstTime: true,
        }));
      }

      const firstCallTimer = setTimeout(() => {
        if (callingRef.current.appointmentId === currentCalling.id) {
          // เรียกครั้งที่ 1
          callingRef.current.count = 1;
          console.log(
            `[CALL COUNT] ${currentCalling.customerName} first recall`,
          );
          setAudioTrigger((prev) => ({
            count: prev.count + 1,
            text: currentCalling.queueNumber,
            channel: currentCalling.channel,
            firstTime: false,
          }));

          const secondCallTimer = setTimeout(() => {
            if (callingRef.current.appointmentId === currentCalling.id) {
              // คิวนี้เรียกรอบที่สองแล้ว
              callingRef.current.count = 2;
              handleUpdateStatus(currentCalling.id, "Skip");
              setTabDisplay(false);
            }
          }, 12000);
          timersRef.current.push(secondCallTimer);
        }
      }, 20000);
      timersRef.current.push(firstCallTimer);
    } else {
      setTabDisplay(false);
      callingRef.current = { appointmentId: null, count: 0 };
    }

    return () => {
      // ทุกๆ timerRef แต่ละตัวจะเอามา clearTimeout อีกครั้งเพื่อล้าง
      timersRef.current.forEach(clearTimeout);
    };
  }, [currentCallingId]);

  const handleCallNewQueueAnimation = () => {
    setIsNewQueue(true);
    const timer = setTimeout(() => setIsNewQueue(false), 15000);
    timersRef.current.push(timer);
  };

  // --- RENDER (Using the small-scale layout) ---
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black">
      <AudioPlayer
        announcementText={audioTrigger.text}
        trigger={audioTrigger.count}
        channel={audioTrigger.channel}
        firstTime={audioTrigger.firstTime}
      />
      {/* VIDEO BACKGROUND */}
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

      {/* WEBSITE LOGO (Small Scale) */}
      <img
        alt="website logo"
        src={"/NO1Money_LOGO_GIF.gif"}
        className="absolute top-0 left-0 z-20 h-12 w-auto" // SCALED DOWN: h-40 -> h-12
      />

      {/* QUEUE TAB (Small Scale) */}
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

function CurrentQueueSection({ appointment }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={`flex w-full flex-col items-center gap-1`} // SCALED DOWN: gap-3 -> gap-1
    >
      <div className="flex w-full flex-col items-center gap-1">
        <h2 className="text-lg font-bold text-white">กำลังเรียกหมายเลขคิว</h2>{" "}
        <div className="h-1 w-16 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>{" "}
      </div>
      <div className="mt-3 flex w-full flex-col items-center justify-center gap-4">
        <QueueNumberBadge queueNumber={appointment?.queueNumber} size="lg" />
        <div className="flex w-full items-center gap-3">
          <div className="flex w-full items-center gap-3">
            <div className="h-[60px] w-[60px] rounded-full bg-black" />{" "}
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold text-white">
                {appointment?.customerName}
              </h3>
              <p className="text-xl text-white">
                {appointment?.serviceName}
              </p>{" "}
            </div>
          </div>
          {/* CHANNEL */}
          <div className="flex w-max items-center gap-2 rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-amber-500/30 px-6 py-2">
            <span className="text-4xl font-bold text-nowrap text-white">
              ช่อง {appointment?.channel}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// แสดงชื่อคิวอื่นๆ
function QueueListSection({ title, appointments, color, isRecent = false }) {
  // This is the small-scale version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/60 p-3 backdrop-blur-sm" // SCALED DOWN: gap-8 rounded-[56px] p-[48px] -> gap-2 rounded-2xl p-3
    >
      {/* คิวที่เรียกแล้ว */}
      <header className="flex items-center gap-2 border-b border-white/10 pb-2">
        <div className={`h-2 w-2 rounded-full ${color}`}></div>{" "}
        <h3 className="text-2xl font-bold text-white">{title}</h3>{" "}
      </header>
      <div className="flex flex-col gap-2">
        {appointments?.map((apt) => (
          <QueueListItem key={apt.id} appointment={apt} isRecent={isRecent} />
        ))}
      </div>
    </motion.div>
  );
}

function QueueTab({ calling, recent, isNew }) {
  // This is the small-scale version
  const [showFullLayout, setShowFullLayout] = useState(!isNew);
  const currentAppointmentToShow =
    calling && calling.length > 0 ? calling[0] : null;

  useEffect(() => {
    if (isNew) {
      setShowFullLayout(false);
      const timer = setTimeout(() => setShowFullLayout(true), 12000);
      return () => clearTimeout(timer);
    }
  }, [isNew, calling]);

  const tabVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeInOut" },
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
      className="absolute top-0 right-0 z-40 h-full w-1/2 overflow-hidden border-l border-white/10 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-blue-900/95 p-3 shadow-2xl shadow-black/70 backdrop-blur-2xl" // SCALED DOWN: p-12 -> p-3
    >
      <motion.div
        layout
        transition={{ duration: 1.0, ease: "easeInOut" }}
        className={`flex h-full flex-col gap-4 overflow-y-auto ${!showFullLayout && "items-center justify-center"}`} // SCALED DOWN: gap-16 -> gap-4
      >
        <CurrentQueueSection appointment={currentAppointmentToShow} />
        <AnimatePresence>
          {showFullLayout && (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3" // SCALED DOWN: gap-10 -> gap-3
            >
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
