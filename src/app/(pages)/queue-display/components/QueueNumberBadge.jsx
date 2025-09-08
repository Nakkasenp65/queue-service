"use client";

import { motion } from "framer-motion";

export default function QueueNumberBadge({
  queueNumber,
  size = "lg",
  animate = false,
}) {
  const firstLetter = queueNumber?.charAt(0);
  const restOfNumber = queueNumber?.substring(1);
  const getColorConfig = (letter) => {
    switch (letter?.toUpperCase()) {
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
    lg: {
      container: "w-full h-auto rounded-[16px]",
      number: "text-[96px]",
    },
    sm: { container: " h-16 p-1 w-[100px] rounded-lg", number: "text-2xl" },
  };
  const currentSize = sizeClasses[size] || sizeClasses.lg;
  return (
    <motion.div
      initial={animate ? { scale: 1.3 } : false}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`flex h-full flex-col items-center justify-center border-2 ${currentSize.container} ${colorConfig.bg}`}
    >
      <div className="flex items-baseline">
        <span
          className={`${colorConfig.text} ${currentSize.number} font-black`}
        >
          {firstLetter}
        </span>
        <span className={`text-white ${currentSize.number} font-black`}>
          {restOfNumber}
        </span>
      </div>
    </motion.div>
  );
}
