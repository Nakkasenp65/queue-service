"use client";

import { motion } from "framer-motion";
import QueueNumberBadge from "./QueueNumberBadge";

export default function QueueListItem({ appointment, isRecent = false }) {
  const isSkipped = appointment?.status === "Skip";

  const statusConfig = {
    Finished: {
      border: "border-green-500/30",
      bg: "bg-gradient-to-r from-green-500/10 to-emerald-600/20",
      channelBg: "bg-gradient-to-r from-green-500/20 to-emerald-500/30",
    },
    Skip: {
      border: "border-gray-500/30",
      bg: "bg-gradient-to-r from-gray-500/10 to-slate-600/20",
      channelBg: "bg-gradient-to-r from-gray-500/20 to-slate-500/30",
    },
  };

  const currentConfig = isSkipped ? statusConfig.Skip : statusConfig.Finished;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex items-center justify-between rounded-2xl border p-3 py-6 backdrop-blur-sm ${currentConfig.border} ${currentConfig.bg} transition-colors duration-300`}
    >
      <div className="flex items-center gap-8">
        <QueueNumberBadge queueNumber={appointment?.queueNumber} size="sm" />
        <div className="flex flex-col">
          <h4 className="text-[48px] font-semibold text-white">
            {appointment?.customerName}
          </h4>
          <p className="text-[32px] text-white/80">
            {appointment?.serviceName}
          </p>
        </div>
      </div>
      <div
        className={`flex w-[250px] items-center justify-center rounded-xl ${currentConfig.channelBg}`}
      >
        <span className="text-[64px] font-bold text-white">
          ช่อง {appointment?.channel}
        </span>
      </div>
    </motion.div>
  );
}
