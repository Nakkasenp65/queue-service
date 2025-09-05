"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ===============================
// ข้อมูลตัวอย่าง (Mock Data)
// ===============================
const mockCurrentAppointment = {
  customerName: "John Doe",
  serviceName: "บริการซ่อมโทรศัพท์",
  queueNumber: "F1101",
  channel: "1",
};
const mockNextAppointments = [
  {
    id: 1,
    queueNumber: "R1101",
    channel: "1",
    customerName: "Sara Johnson",
    serviceName: "รับของคืน",
  },
  {
    id: 2,
    queueNumber: "R1102",
    channel: "2",
    customerName: "Michael Chen",
    serviceName: "สอบถามข้อมูล",
  },
];
const mockRecentAppointments = [
  {
    id: 1,
    queueNumber: "R1100",
    channel: "1",
    customerName: "Robert Brown",
    serviceName: "รับของคืน",
  },
  {
    id: 2,
    queueNumber: "F1100",
    channel: "4",
    customerName: "Lisa Anderson",
    serviceName: "ซ่อมโทรศัพท์",
  },
];
const youtubeUrl = `https://www.youtube.com/embed/videoseries?list=${process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID}&autoplay=1&mute=1&loop=1&controls=0&playlist=${process.env.NEXT_PUBLIC_YOUTUBE_FIRST_VIDEO_ID}`;

// =====================================================================
//  ส่วนประกอบย่อย (Components)
// =====================================================================

function QueueNumberBadge({ queueNumber, size = "lg", animate = false }) {
  const firstLetter = queueNumber.charAt(0);
  const restOfNumber = queueNumber.substring(1);
  const getColorConfig = (letter) => {
    switch (letter.toUpperCase()) {
      case "R":
        return {
          bg: "bg-gradient-to-br from-amber-500/20 to-amber-700/30 border-amber-500/60",
          text: "text-amber-400",
          label: "รับของคืน",
        };
      case "F":
        return {
          bg: "bg-gradient-to-br from-red-500/20 to-red-700/30 border-red-500/60",
          text: "text-red-400",
          label: "ซ่อมโทรศัพท์",
        };
      case "G":
        return {
          bg: "bg-gradient-to-br from-blue-500/20 to-blue-700/30 border-blue-500/60",
          text: "text-blue-400",
          label: "บริการทั่วไป",
        };
      default:
        return {
          bg: "bg-gradient-to-br from-gray-500/20 to-gray-700/30 border-gray-500/60",
          text: "text-gray-400",
          label: "บริการ",
        };
    }
  };
  const colorConfig = getColorConfig(firstLetter);
  const sizeClasses = {
    lg: { container: "w-max h-96 p-16", number: "text-[10rem]", label: "text-4xl" },
    sm: { container: "w-max h-56 p-8", number: "text-7xl", label: "text-2xl" },
  };
  const currentSize = sizeClasses[size] || sizeClasses.lg;
  return (
    <motion.div
      initial={animate ? { scale: 1.3 } : false}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`flex flex-col items-center justify-center rounded-3xl border-2 ${currentSize.container} ${colorConfig.bg}`}
    >
      <div className="flex items-baseline">
        <span className={`${colorConfig.text} ${currentSize.number} font-black`}>
          {firstLetter}
        </span>
        <span className={`text-white ${currentSize.number} font-black`}>{restOfNumber}</span>
      </div>
      <span className={`mt-2 font-medium ${colorConfig.text} ${currentSize.label}`}>
        {colorConfig.label}
      </span>
    </motion.div>
  );
}

function CurrentQueueSection({ appointment, isExpanded }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className={`flex w-full flex-col items-center transition-all duration-500 ${isExpanded ? "scale-110" : "scale-100"}`}
    >
      <div className="flex w-full flex-col items-center gap-3">
        <h2 className="text-7xl font-bold text-white">กำลังเรียกหมายเลขคิว</h2>
        <div className="h-2 w-56 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
      </div>
      <div className="mt-10 flex w-full flex-row items-center justify-center gap-16">
        <QueueNumberBadge queueNumber={appointment.queueNumber} size="lg" animate={isExpanded} />
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-white/70"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-9xl font-bold text-white">{appointment.customerName}</h3>
          </div>
          <div>
            <p className="text-7xl text-white">{appointment.serviceName}</p>
          </div>
          <div className="mt-6">
            <div className="inline-flex items-center gap-5 rounded-3xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-amber-500/30 px-8 py-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V5a1 1 0 00-1.447-.894l-4 2A1 1 0 0011 7v10zM5 17a1 1 0 001.447.894l4-2A1 1 0 0011 15V5a1 1 0 00-1.447-.894l-4 2A1 1 0 005 7v10z" />
              </svg>
              <span className="text-7xl font-bold text-white">
                ช่องบริการ #{appointment.channel}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 text-center">
        <p className="animate-pulse text-4xl text-white/80">กรุณาเดินไปยังช่องบริการที่กำหนด</p>
      </div>
    </motion.div>
  );
}

function QueueListItem({ appointment, isRecent = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex items-center justify-between rounded-3xl border p-10 backdrop-blur-sm ${isRecent ? "border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-700/20" : "border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-600/20"} transition-colors duration-300`}
    >
      <div className="flex items-center gap-10">
        <QueueNumberBadge queueNumber={appointment.queueNumber} size="sm" />
        <div className="flex flex-col">
          <h4 className="text-6xl font-semibold text-white">{appointment.customerName}</h4>
          <p className="text-4xl text-white/80">{appointment.serviceName}</p>
        </div>
      </div>
      <div
        className={`flex items-center gap-4 rounded-2xl px-8 py-5 ${isRecent ? "bg-gradient-to-r from-red-500/20 to-red-600/30" : "bg-gradient-to-r from-green-500/20 to-emerald-500/30"}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <span className="text-5xl font-bold text-white">ช่อง {appointment.channel}</span>
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
        {appointments.map((apt) => (
          <QueueListItem key={apt.id} appointment={apt} isRecent={isRecent} />
        ))}
      </div>
    </motion.div>
  );
}

function QueueTab({ current, next, recent, isNew }) {
  const [showFullLayout, setShowFullLayout] = useState(!isNew);
  useEffect(() => {
    if (isNew) {
      setShowFullLayout(false);
      const timer = setTimeout(() => setShowFullLayout(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);
  const tabVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", damping: 35, stiffness: 300 } },
    exit: { x: "100%", opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } },
  };
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.5 } },
  };
  const itemVariant = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  return (
    // HIGHLIGHT: เพิ่ม z-index เป็น 50 เพื่อให้แน่ใจว่าอยู่บนสุดเสมอ
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute top-0 right-0 z-50 h-full w-2/5 overflow-hidden border-l border-white/10 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-blue-900/95 p-12 shadow-2xl shadow-black/70 backdrop-blur-2xl"
    >
      <motion.div
        layout
        transition={{ duration: 1, ease: "easeInOut" }}
        className={`flex h-full flex-col gap-12 overflow-y-auto ${!showFullLayout ? "items-center justify-center" : "pt-8"}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <CurrentQueueSection appointment={current} isExpanded={!showFullLayout} />
        <AnimatePresence>
          {showFullLayout && (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="flex flex-col gap-10"
            >
              <motion.div variants={itemVariant}>
                <QueueListSection title="คิวต่อไป" appointments={next} color="bg-green-400" />
              </motion.div>
              <motion.div variants={itemVariant}>
                <QueueListSection
                  title="คิวที่เรียกแล้ว"
                  appointments={recent}
                  color="bg-red-400"
                  isRecent={true}
                />
              </motion.div>
              <motion.div variants={itemVariant} className="mt-auto border-t border-white/10 pt-8">
                <div className="flex items-center justify-center text-white/60">
                  <span className="text-3xl">{new Date().toLocaleTimeString("th-TH")}</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
  );
}

// =====================================================================
//  หน้าหลัก (Main Page)
// =====================================================================
export default function QueueDisplayPage() {
  const [tabDisplay, setTabDisplay] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isNewQueue, setIsNewQueue] = useState(false);
  const autoHideTimerRef = useRef(null);

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(clockTimer);
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };
  }, []);

  const handleCallNewQueue = () => {
    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    setTabDisplay(true);
    setIsNewQueue(true);
    const newQueueTimer = setTimeout(() => setIsNewQueue(false), 5000);
    autoHideTimerRef.current = setTimeout(() => {
      setTabDisplay(false);
      clearTimeout(newQueueTimer);
    }, 15000);
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black">
      {/* Layer 1: Background Video (z-10) */}
      <div className="absolute inset-0 z-10">
        <iframe
          className="h-full w-full"
          src={youtubeUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="autoplay; encrypted-media;"
          allowFullScreen
        />
      </div>

      {/* CORRECTED: Layer 2: Vignette Overlay (z-20) */}
      {/* ย้าย Vignette ออกมาและกำหนด z-index ใหม่ */}
      <AnimatePresence>
        {tabDisplay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            // กำหนด z-index เป็น 20 เพื่อให้อยู่หลังปุ่ม (z-40) แต่ทับวิดีโอ (z-10)
            className="absolute inset-0 z-20 bg-gradient-to-r from-blue-900/70 via-purple-900/50 to-indigo-900/70"
          />
        )}
      </AnimatePresence>

      {/* Layer 3: Header (z-30) */}
      <header className="absolute top-0 right-0 left-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-12">
        <div className="flex items-center gap-8">
          <img
            alt="website logo"
            src={"/no1money_gif.gif"}
            className="h-36 w-auto rounded-3xl shadow-lg"
          />
        </div>
        <div className="flex flex-col items-end">
          <div className="text-7xl font-semibold text-white">
            {currentTime.toLocaleTimeString("th-TH")}
          </div>
          <div className="text-3xl text-white/80">
            {currentTime.toLocaleDateString("th-TH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </header>

      {/* Layer 4: UI Controls (z-40) */}
      <div className="absolute bottom-12 left-12 z-40 flex gap-4">
        <button
          onClick={() => setTabDisplay(!tabDisplay)}
          className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-3xl font-medium text-white shadow-lg transition-all hover:from-amber-600 hover:to-amber-700"
        >
          {tabDisplay ? "ซ่อนแผงคิว" : "แสดงแผงคิว"}
        </button>
        <button
          onClick={handleCallNewQueue}
          className="cursor-pointer rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 text-3xl font-medium text-white shadow-lg transition-all hover:from-blue-600 hover:to-blue-700"
        >
          เรียกคิวใหม่ (Demo)
        </button>
      </div>

      {/* Layer 5: Queue Tab (z-50) */}
      <AnimatePresence>
        {tabDisplay && (
          <QueueTab
            current={mockCurrentAppointment}
            next={mockNextAppointments}
            recent={mockRecentAppointments}
            isNew={isNewQueue}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
