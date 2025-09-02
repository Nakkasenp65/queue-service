"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  Wrench,
  ChevronLeft,
  User,
  Info,
  AlertTriangle,
  SearchX,
  UserCircle, // Added for Customer Info
} from "lucide-react";
import BottomNavbar from "../../../queue-services/components/BottomNavbar";

// This is a placeholder hook. You will need to create this file.
// Example path: src/(pages)/appointments/hooks/useAppointments.js
import { useGetAppointmentDetails } from "./hooks/useAppointment";

const statusThai = (status) => {
  switch (status) {
    case "PENDING":
      return "รอดำเนินการ";
    case "CONFIRMED":
      return "ยืนยันแล้ว";
    case "COMPLETED":
      return "เสร็จสิ้น";
    case "CANCELLED":
      return "ยกเลิก";
    case "NO_SHOW":
      return "ไม่มา";
    case "OFFERED":
      return "เสนอเวลาใหม่";
    case "ACCEPTED_BY_EMPLOYEE":
      return "รับโดยพนักงาน";
    case "REJECTED_BY_EMPLOYEE":
      return "ปฏิเสธโดยพนักงาน";
    default:
      return status || "-";
  }
};

const statusColor = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "from-green-500 to-emerald-600 text-white";
    case "COMPLETED":
      return "from-slate-400 to-slate-500 text-white";
    case "CANCELLED":
      return "from-rose-500 to-red-600 text-white";
    case "NO_SHOW":
      return "from-amber-400 to-yellow-500 text-black";
    case "OFFERED":
      return "from-indigo-500 to-violet-600 text-white";
    case "ACCEPTED_BY_EMPLOYEE":
      return "from-emerald-400 to-teal-500 text-white";
    case "REJECTED_BY_EMPLOYEE":
      return "from-rose-400 to-fuchsia-500 text-white";
    default:
      return "from-blue-500 to-cyan-500 text-white";
  }
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatTime = (hourNumberLike) => `${hourNumberLike}:00 น.`;

export default function AppointmentDetailsPage() {
  const params = useParams();
  const id = params.id;

  // Fetch data for the specific appointment using the ID from the URL
  const { data: appointmentDetails, isLoading, error } = useGetAppointmentDetails(id);

  if (isLoading) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6 font-sans text-gray-800">
        <div className="mx-auto w-full max-w-sm text-center">
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
              <div className="h-full w-full rounded-full border-4 border-t-indigo-500 border-r-slate-200 border-b-slate-200 border-l-indigo-500" />
            </div>
            <Wrench
              size={32}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500"
            />
          </div>
          <div className="mt-6">
            <div className="text-base font-semibold text-slate-700">กำลังโหลดข้อมูลการจอง...</div>
            <div className="mt-1 text-sm text-slate-500">กรุณารอสักครู่</div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center bg-slate-50 p-6 text-center">
        <div className="mx-auto max-w-sm">
          <AlertTriangle className="mx-auto h-12 w-12 text-rose-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-800">เกิดข้อผิดพลาด</h1>
          <p className="mt-2 text-slate-600">{error.message}</p>
          <Link
            href="/appointments/history"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <ChevronLeft size={16} /> กลับไปที่ประวัติ
          </Link>
        </div>
      </main>
    );
  }

  if (!appointmentDetails) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center bg-slate-50 p-6 text-center">
        <div className="mx-auto max-w-sm">
          <SearchX className="mx-auto h-12 w-12 text-slate-400" />
          <h1 className="mt-4 text-xl font-bold text-slate-800">ไม่พบข้อมูลการจอง</h1>
          <p className="mt-2 text-slate-600">ไม่พบข้อมูลสำหรับการจองนี้ หรืออาจถูกลบไปแล้ว</p>
          <Link
            href="/appointments/history"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <ChevronLeft size={16} /> กลับไปที่ประวัติ
          </Link>
        </div>
        <BottomNavbar />
      </main>
    );
  }

  const translatedStatus = statusThai(appointmentDetails.status);
  const statusGradientClass = statusColor(appointmentDetails.status);

  return (
    <main className="relative min-h-screen bg-slate-50 p-4 pb-24 text-gray-800">
      <div className="mx-auto max-w-3xl">
        <header className="mb-4 flex items-center justify-between">
          <Link
            href="/queue-history"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            <ChevronLeft size={16} /> กลับ
          </Link>
          <div className="text-xs text-gray-500">
            อัปเดตล่าสุด: {new Date(appointmentDetails.updatedAt).toLocaleString("th-TH")}
          </div>
        </header>

        <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="space-y-4 p-4">
            <div>
              <div
                className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${statusGradientClass} px-3 py-1 text-sm font-semibold`}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-white/80" />
                {translatedStatus}
              </div>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <Wrench size={16} /> บริการ
              </h2>
              <div className="mt-2 inline-block rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 px-3 py-1.5 text-sm font-semibold text-white">
                {appointmentDetails.serviceType}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 p-3 text-white">
                <Calendar size={18} />
                <div>
                  <div className="text-[11px] opacity-90">วันที่นัด</div>
                  <div className="text-base font-semibold">
                    {formatDate(appointmentDetails.date)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-rose-400 to-orange-400 p-3 text-white">
                <Clock size={18} />
                <div>
                  <div className="text-[11px] opacity-90">เวลานัด</div>
                  <div className="text-base font-semibold">
                    {formatTime(appointmentDetails.section)}
                  </div>
                </div>
              </div>
            </div>

            {/* --- NEW SECTION FOR CUSTOMER INFO --- */}
            {appointmentDetails.customer && (
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                  <UserCircle size={16} /> ข้อมูลลูกค้า
                </h2>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {appointmentDetails.customer.picture_url ? (
                    <img
                      src={appointmentDetails.customer.picture_url}
                      alt="Profile"
                      className="h-10 w-10 rounded-full bg-slate-200"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                      <UserCircle size={24} />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-slate-800">
                      {appointmentDetails.customer.fullname ||
                        appointmentDetails.customer.line_display_name ||
                        "-"}
                    </div>
                    <div className="text-sm text-slate-500">
                      เบอร์โทร: {appointmentDetails.customer.phone || "-"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- SECTION FOR ASSIGNED STAFF --- */}
            {appointmentDetails.adminInfo && (
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                  <User size={16} /> ผู้รับผิดชอบ
                </h2>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                    {appointmentDetails.adminInfo.fullName?.charAt(0) || "N/A"}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">
                      {appointmentDetails.adminInfo.fullName || "-"}
                    </div>
                    <div className="text-sm text-slate-500">
                      รหัสพนักงาน: {appointmentDetails.adminInfo.staffId || "-"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- SECTION FOR NOTES --- */}
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <Info size={16} /> รายละเอียดเพิ่มเติม
              </h2>
              <p className="mt-2 min-h-[60px] rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-gray-600">
                {appointmentDetails.note || "ไม่มีข้อมูลเพิ่มเติม"}
              </p>
            </div>
          </div>
        </article>
      </div>

      <BottomNavbar />
    </main>
  );
}
