'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { User, Calendar, Users, X, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// 1. Import Custom Hooks ที่จำเป็น
import { useLiff } from './Provider/LiffProvider';

export default function Navbar({ onProfileOpen = () => {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { liffProfile } = useLiff();
  const router = useRouter();
  const pathname = usePathname();
  // แสดง menu พนักงานบนหน้า queueManagement เท่านั้น
  const isEmployee = (pathname || '').startsWith('/queue-management');

  const handleMenuClick = (action) => {
    setIsMenuOpen(false);
    switch (action) {
      case 'employee-appointments':
        router.push('/queue-management/employees/my-appointment');
        break;
      case 'admin':
        router.push('/queue-management/admin');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 z-10 flex w-full items-center justify-around bg-white p-2 shadow-sm shadow-black/10"
      >
        <div className="flex w-full items-center gap-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="rounded-lg transition-colors hover:bg-slate-100"
          >
            <Menu size={32} />
          </button>
          <Link
            href={'/queue-services'}
            onClick={() => window.dispatchEvent(new CustomEvent('go-home'))}
            className="bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-xl font-bold text-transparent"
          >
            OKM Queue
          </Link>
        </div>

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onProfileOpen()}
          className="flex cursor-pointer items-center justify-center rounded-full bg-white shadow-md transition-colors hover:border-blue-500"
        >
          {liffProfile ? (
            <Image
              width={48}
              height={48}
              src={liffProfile.pictureUrl}
              alt="Profile"
              className="h-full w-full rounded-full object-cover"
              priority={true}
            />
          ) : (
            <div className="flex h-full w-full animate-pulse items-center justify-center rounded-full bg-gray-200 p-2">
              <User className="text-gray-400" />
            </div>
          )}
        </motion.div>
      </motion.header>

      {/* Sliding Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.28 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <div className="p-4">
              <button onClick={() => setIsMenuOpen(false)} className="mb-4">
                <X />
              </button>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">เมนู</h2>

                {/* Customer Menu Items */}
                <Link
                  href="/appointments/my-appointment"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-lg p-4 text-left transition-colors hover:bg-slate-200"
                >
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>คิวของฉัน</span>
                </Link>

                {/* Employee Menu Items */}
                {/* Always show employee menu items since we're using mock data */}
                {isEmployee && (
                  <>
                    <div className="border-t border-slate-200 pt-4">
                      <h3 className="mb-2 text-sm font-medium text-slate-600">เมนูพนักงาน</h3>
                      <button
                        onClick={() => handleMenuClick('employee-appointments')}
                        className="mb-2 flex w-full items-center gap-3 rounded-lg p-4 text-left"
                      >
                        <Users className="h-5 w-5 text-blue-600" />
                        <span>นัดหมายของฉัน</span>
                      </button>
                      <button
                        onClick={() => handleMenuClick('admin')}
                        className="flex w-full items-center gap-3 rounded-lg p-4 text-left"
                      >
                        <User className="h-5 w-5 text-green-600" />
                        <span>จัดการระบบ</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
