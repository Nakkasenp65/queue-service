'use client';

import { motion } from 'framer-motion';
import { Smartphone, Repeat, HandCoins, ShieldCheck, Building, Wrench } from 'lucide-react';

const services = [
  // Repair: cool, technical tones
  { name: 'ซ่อมมือถือ', icon: Wrench, bg: 'from-slate-900 via-blue-800 to-cyan-500' },
  // Buy/Sell: growth and commerce
  { name: 'ซื้อขายมือถือ', icon: Smartphone, bg: 'from-emerald-900 via-teal-700 to-lime-500' },
  // Pawn (finance): warm, value-focused
  { name: 'จำนำมือถือ', icon: HandCoins, bg: 'from-amber-900 via-orange-700 to-yellow-500' },
  // iCloud pledge: secure/cloudy blues
  { name: 'จำนำไอคลาวด์', icon: ShieldCheck, bg: 'from-indigo-950 via-blue-800 to-sky-500' },
  // Refinance: money-refresh greens
  { name: 'รีไฟแนนซ์', icon: Repeat, bg: 'from-green-900 via-emerald-700 to-green-400' },
  // Others: general purpose (example provided)
  { name: 'อื่นๆ', icon: Building, bg: 'from-blue-950 via-indigo-700 to-purple-500' },
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
      type: 'spring',
      stiffness: 100,
    },
  },
};

export default function ServiceSelection({ onServiceSelect, appointmentData, appointmentLoading }) {
  return (
    <motion.div className="flex flex-col">
      {/* === Services Section === */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-2"
      >
        <motion.h2 variants={itemVariants} className="text-lg font-bold">
          บริการ
        </motion.h2>

        {/* GRID CONTAINER*/}
        <motion.div
          variants={containerVariants} // Staggers the children inside the grid
          className="grid grid-cols-3 gap-4"
        >
          {services.map((service) => (
            // SERVICE CARD
            <motion.div
              key={service.name}
              variants={itemVariants}
              whileHover={{
                y: -3,
                transition: { type: 'spring', stiffness: 300 },
              }}
              whileTap={{ scale: 0.95 }}
              className="relative flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200/80 bg-white/60 py-4 text-center shadow-sm backdrop-blur"
              onClick={() => onServiceSelect(service)}
            >
              {/* Center icon badge */}
              <div
                className={`flex items-center justify-center rounded-full bg-gradient-to-b p-4 ${service.bg} rounded-full text-white shadow-sm`}
              >
                <service.icon size={24} />
              </div>
              <span className="text-sm font-semibold text-slate-800">{service.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
