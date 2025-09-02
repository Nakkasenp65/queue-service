"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Phone,
  Wrench,
  X,
  CalendarPlus,
  History,
  RotateCw,
  Home,
  CheckCircle2,
  XCircle,
  ChevronLeft,
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { useGetCustomerAppointmentDetails } from "@/app/(pages)/queue-services/hooks/useAppointments";
import { useLiff } from "@/app/components/Provider/LiffProvider";
import BottomNavbar from "../../queue-services/components/BottomNavbar";

/* =========================
   Helpers
========================= */
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
  new Date(iso).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

const formatTime = (hourNumberLike) => `${hourNumberLike}:00 น.`;

// เผื่อกรณี backend ส่ง field แตกต่าง: รองรับได้ทั้ง offeredDate/offeredSection หรือ myAppointment.offer.{date,section}
function getOfferedInfo(appt) {
  if (!appt) return { hasOffer: false };
  const offerObj = appt.offer || {};
  const dateISO = appt.offeredDate || offerObj.date || null;
  const section = appt.offeredSection ?? offerObj.section ?? null;
  const startSlot = appt.offeredStartSlot ?? offerObj.startSlot ?? null;
  const durationSlots = appt.offeredDurationSlots ?? offerObj.durationSlots ?? 1;

  if (dateISO && (section || section === 0)) {
    return {
      hasOffer: true,
      dateText: formatDate(dateISO),
      timeText: formatTime(section),
      raw: { dateISO, section, startSlot, durationSlots },
    };
  }

  if (dateISO && (startSlot || startSlot === 0)) {
    const startHour = 11 + Number(startSlot);
    const endHour = startHour + Number(durationSlots || 1);
    return {
      hasOffer: true,
      dateText: formatDate(dateISO),
      timeText: `${String(startHour).padStart(2, "0")}:00–${String(endHour).padStart(2, "0")}:00 น.`,
      raw: { dateISO, section: startHour, startSlot, durationSlots },
    };
  }

  return { hasOffer: false };
}

export default function MyAppointmentPage() {
  const { liffProfile, actions } = useLiff();
  const {
    data: myAppointment,
    isLoading,
    error,
    refetch,
  } = useGetCustomerAppointmentDetails(liffProfile?.userId);

  const [sharing, setSharing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Loading flower animation
  const loadingVariants = [
    { petals: 6, radius: 38, from: "from-pink-500", to: "to-rose-400" },
    { petals: 8, radius: 42, from: "from-indigo-500", to: "to-sky-400" },
    { petals: 10, radius: 46, from: "from-emerald-500", to: "to-lime-400" },
    { petals: 12, radius: 50, from: "from-violet-500", to: "to-fuchsia-400" },
  ];
  const loadingMessages = [
    "กำลังดึงข้อมูลการจองของคุณ…",
    "กำลังจัดคิวให้เหมาะสมที่สุด…",
    "กำลังประมวลผลข้อมูลล่าสุด…",
  ];
  const [variantIndex, setVariantIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => {
      setVariantIndex((v) => (v + 1) % loadingVariants.length);
      setMessageIndex((m) => (m + 1) % loadingMessages.length);
    }, 1400);
    return () => clearInterval(id);
  }, [isLoading]);

  const parseService = (note) => {
    if (!note) return "-";
    const marker = "Service:";
    if (note.includes(marker)) return note.split(marker)[1].trim();
    return note;
  };

  /* =========================
     Actions: Share / Location / Cancel / Accept / Reject Offer
  ========================= */
  const handleShareQueue = async () => {
    if (!actions || !myAppointment) return;
    setSharing(true);
    try {
      const serviceText = parseService(myAppointment.note);
      const message = `การจองของฉัน\nบริการ: ${serviceText}\nวันที่: ${formatDate(
        myAppointment.date,
      )}\nเวลา: ${formatTime(myAppointment.section)}\nสถานะ: ${statusThai(myAppointment.status)}`;

      await actions.share(message);
    } catch (e) {
      console.error("share error", e);
      alert("เกิดข้อผิดพลาดในการแชร์");
    } finally {
      setSharing(false);
    }
  };

  const handleShareLocation = async () => {
    if (!actions) return;
    setSharing(true);
    try {
      const shopTitle = process.env.NEXT_PUBLIC_SHOP_NAME || "ร้านของเรา";
      const shopAddress = process.env.NEXT_PUBLIC_SHOP_ADDRESS || "";
      const lat = process.env.NEXT_PUBLIC_SHOP_LAT;
      const lng = process.env.NEXT_PUBLIC_SHOP_LNG;

      await actions.shareLocation({
        latitude: lat,
        longitude: lng,
        title: shopTitle,
        address: shopAddress,
      });
    } catch (e) {
      console.error("shareLocation error", e);
      alert("เกิดข้อผิดพลาดในการแชร์ตำแหน่ง");
    } finally {
      setSharing(false);
    }
  };

  const handleCancel = async () => {
    if (!myAppointment) return;

    const result = await Swal.fire({
      title: "ยืนยันการยกเลิกการจอง?",
      html: `คุณต้องการยกเลิกการจอง<br/><strong>${parseService(myAppointment.note)}</strong><br/>วันที่ ${formatDate(
        myAppointment.date,
      )} เวลา ${formatTime(myAppointment.section)}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    setIsCancelling(true);
    try {
      await axios.post(`http://localhost:3000/api/v1/appointments/cancel/${myAppointment.id}`);
      await Swal.fire({
        icon: "success",
        title: "ยกเลิกเรียบร้อย",
        timer: 1200,
        showConfirmButton: false,
      });
      refetch?.();
    } catch (e) {
      console.error("cancel error", e);
      await Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถยกเลิกได้" });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAcceptOffer = async () => {
    if (!myAppointment) return;
    const offered = getOfferedInfo(myAppointment);
    const confirm = await Swal.fire({
      title: "ยืนยันรับเวลาใหม่?",
      html: offered.hasOffer
        ? `วันที่: <b>${offered.dateText}</b><br/>เวลา: <b>${offered.timeText}</b>`
        : "ยืนยันรับเวลาใหม่",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "รับเวลาใหม่",
      cancelButtonText: "ยกเลิก",
    });
    if (!confirm.isConfirmed) return;

    setIsAccepting(true);
    try {
      await axios.patch(
        `http://localhost:3000/api/v1/appointments/offer/${myAppointment.id}/accept`,
      );
      await Swal.fire({
        icon: "success",
        title: "ยืนยันสำเร็จ",
        timer: 1100,
        showConfirmButton: false,
      });
      refetch?.();
    } catch (e) {
      console.error("accept-offer error", e);
      await Swal.fire({ icon: "error", title: "ยืนยันไม่สำเร็จ", text: "โปรดลองใหม่อีกครั้ง" });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectOffer = async () => {
    if (!myAppointment) return;
    const { value: reason } = await Swal.fire({
      title: "ปฏิเสธเวลาใหม่?",
      input: "text",
      inputPlaceholder: "ระบุเหตุผล (ถ้ามี)",
      showCancelButton: true,
      confirmButtonText: "ปฏิเสธ",
      cancelButtonText: "ยกเลิก",
    });
    if (reason === undefined) return;

    setIsRejecting(true);
    try {
      await axios.patch(
        `http://localhost:3000/api/v1/appointments/offer/${myAppointment.id}/reject`,
        { reason: reason || "" },
      );
      await Swal.fire({
        icon: "success",
        title: "ส่งคำตอบแล้ว",
        timer: 1100,
        showConfirmButton: false,
      });
      refetch?.();
    } catch (e) {
      console.error("reject-offer error", e);
      await Swal.fire({ icon: "error", title: "ปฏิเสธไม่สำเร็จ", text: "โปรดลองใหม่อีกครั้ง" });
    } finally {
      setIsRejecting(false);
    }
  };

  /* =========================
     Loading / Error / Empty
  ========================= */
  if (isLoading) {
    const v = loadingVariants[variantIndex] ?? loadingVariants[0];
    const petals = Array.from({ length: v.petals });
    return (
      <main className="relative flex min-h-dvh items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6 font-sans text-gray-800">
        <div className="mx-auto w-full max-w-sm text-center">
          <div className="relative mx-auto h-44 w-44">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/60 to-white/10 shadow-xl ring-1 ring-black/5 backdrop-blur-md" />
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "6s" }}>
              <div className="relative h-full w-full">
                {petals.map((_, i) => (
                  <span
                    key={i}
                    className={`absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${v.from} ${v.to} shadow-md`}
                    style={{
                      transform: `rotate(${(360 / v.petals) * i}deg) translateY(-${v.radius}px)`,
                    }}
                  />
                ))}
                <span className="absolute top-1/2 left-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 shadow-lg ring-2 ring-white/70" />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="text-base font-semibold text-slate-700">กำลังจัดเตรียมข้อมูลคิว</div>
            <div className="mt-1 text-sm text-slate-500">{loadingMessages[messageIndex]}</div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return <div className="p-10 text-center text-red-600">เกิดข้อผิดพลาด: {error.message}</div>;
  }

  if (!myAppointment || myAppointment.status === "CANCELLED") {
    return (
      <main className="relative flex min-h-dvh items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6 font-sans text-gray-800">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-950 via-indigo-700 to-purple-500 text-white shadow-lg">
            <CalendarPlus size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">ยังไม่มีการจอง</h1>
          <p className="mt-1 text-slate-600">คุณยังไม่มีคิวที่กำลังจะถึง เริ่มจองคิวใหม่ได้เลย</p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/queue-services"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <CalendarPlus size={16} /> จองคิวใหม่
            </Link>
            <Link
              href="/appointments/history"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
            >
              <History size={16} /> ประวัติ
            </Link>
          </div>
        </div>
        <BottomNavbar />
      </main>
    );
  }

  console.log(myAppointment);

  const serviceText = parseService(myAppointment.note);
  const translatedStatus = statusThai(myAppointment.status);
  const statusGradientClass = statusColor(myAppointment.status);
  const offered = getOfferedInfo(myAppointment);

  // แสดงปุ่มเมื่อสถานะเป็น OFFERED
  const hasOffer = myAppointment.status === "OFFERED";

  return (
    <main className="relative min-h-screen p-4 pb-24 text-gray-800">
      <div className="mx-auto max-w-3xl">
        <header className="mb-4 flex items-center justify-between">
          <Link
            href="/queue-services"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <ChevronLeft size={16} /> กลับ
          </Link>
          <div className="text-xs text-gray-500">
            อัปเดตล่าสุด: {new Date(myAppointment.updatedAt).toLocaleString("th-TH")}
          </div>
        </header>

        <article className="overflow-hidden rounded-2xl">
          <div className="p-4">
            <div
              className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${statusGradientClass} px-3 py-1 text-sm font-semibold`}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-white/80" />
              {translatedStatus}
            </div>

            <h2 className="mt-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              <Wrench size={16} /> บริการ
            </h2>
            <div className="mt-2 inline-block rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 px-3 py-1.5 text-sm font-semibold text-white">
              {serviceText}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 p-3 text-white">
                <Calendar size={18} />
                <div>
                  <div className="text-[11px] opacity-90">วันที่เดิม</div>
                  <div className="text-base font-semibold">{formatDate(myAppointment.date)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-rose-400 to-orange-400 p-3 text-white">
                <Clock size={18} />
                <div>
                  <div className="text-[11px] opacity-90">เวลาเดิม</div>
                  <div className="text-base font-semibold">{formatTime(myAppointment.section)}</div>
                </div>
              </div>
            </div>

            {/* --- SECTION FOR OFFERED TIME --- */}
            {hasOffer && (
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <div className="text-sm font-semibold text-indigo-900">เวลาใหม่ที่เสนอให้</div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-lg bg-white p-3 text-slate-800 shadow-sm ring-1 ring-indigo-100">
                    <Calendar size={18} className="text-indigo-600" />
                    <div>
                      <div className="text-[11px] opacity-70">วันที่เสนอ</div>
                      <div className="text-base font-semibold">
                        {myAppointment.offerDate ? formatDate(myAppointment.offerDate) : "-"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white p-3 text-slate-800 shadow-sm ring-1 ring-indigo-100">
                    <Clock size={18} className="text-indigo-600" />
                    <div>
                      <div className="text-[11px] opacity-70">เวลาเสนอ</div>
                      <div className="text-base font-semibold">
                        {myAppointment.offerDate
                          ? new Date(myAppointment.offerDate).toLocaleTimeString("th-TH", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }) + " น."
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-indigo-900/80">
                  *โปรดตอบรับหรือปฏิเสธเพื่อยืนยันนัดหมาย ระบบจะสำรองคิวไว้ช่วงสั้น ๆ เท่านั้น
                </p>

                {/* ปุ่มตอบรับ/ปฏิเสธ */}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleRejectOffer}
                    disabled={isRejecting || isAccepting}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 shadow-sm hover:bg-rose-50 disabled:opacity-50"
                  >
                    {isRejecting ? (
                      "กำลังส่ง..."
                    ) : (
                      <>
                        <XCircle size={18} /> ปฏิเสธ
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleAcceptOffer}
                    disabled={isAccepting || isRejecting}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isAccepting ? (
                      "กำลังยืนยัน..."
                    ) : (
                      <>
                        <CheckCircle2 size={18} /> รับเวลาใหม่
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 rounded-xl bg-slate-50 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold">รายละเอียดเพิ่มเติม</h3>
                  <p className="mt-1 text-sm text-gray-600">{myAppointment.note || "-"}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">ประเภท</div>
                  <div className="font-medium">{myAppointment.type}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  onClick={handleShareQueue}
                  disabled={sharing}
                  className="col-span-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:shadow-md"
                >
                  <Share2 size={16} className="mr-1 inline-block" /> แชร์คิว
                </button>
                <button
                  onClick={handleShareLocation}
                  disabled={sharing}
                  className="col-span-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:shadow-md"
                >
                  <MapPin size={16} className="mr-1 inline-block" /> ตำแหน่ง
                </button>
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_SHOP_PHONE || ""}`}
                  className="col-span-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm hover:shadow-md"
                >
                  <Phone size={16} className="mr-1 inline-block" /> โทร
                </a>
              </div>
              <button
                onClick={handleCancel}
                disabled={myAppointment.status !== "PENDING" || isCancelling}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${myAppointment.status === "PENDING" && !isCancelling ? "bg-rose-600 text-white hover:bg-rose-700" : "cursor-not-allowed bg-slate-100 text-slate-500"}`}
              >
                <X size={16} className="inline-block" />
                {isCancelling ? "กำลังยกเลิก..." : "ยกเลิกการจอง"}
              </button>
            </div>
          </div>
        </article>
      </div>

      <BottomNavbar />
    </main>
  );
}
