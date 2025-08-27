"use client";

import React from "react";
import Link from "next/link";

export default function QueuePublicPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* App Name with Gradient */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            ตารางคิว
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium">ระบบจัดการคิวออนไลน์ที่ทันสมัย</p>
        </div>

        {/* Buttons with Modern Styling */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/queueManagement/login"
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <span className="relative z-10">เข้าสู่ระบบสำหรับผู้ดูแล</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          <Link
            href="/queueManagement/register"
            className="group relative px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <span className="relative z-10">ลงทะเบียนพนักงาน</span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>

        {/* Optional Subtle Footer */}
        <div className="mt-16 text-gray-500 text-sm">
          <p>จัดการคิวของคุณได้อย่างง่ายดายและมีประสิทธิภาพ</p>
        </div>
      </div>
    </main>
  );
}
