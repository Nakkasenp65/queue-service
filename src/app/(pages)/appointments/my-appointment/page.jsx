"use client";

import { useState } from "react";
import { useGetMyAppointment } from "@/app/hooks/useAppointments";
import { useLiff } from "@/app/components/Provider/LiffProvider";
import { Calendar, Clock, MapPin, User, Share2, Phone, Wrench, X } from "lucide-react";
import Swal from "sweetalert2";

export default function MyAppointmentPage() {
  const { liffProfile, actions } = useLiff();
  const { data: myAppointment, isLoading, error, refetch } = useGetMyAppointment(liffProfile?.userId);
  const [sharing, setSharing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  console.log("MyAppointmentPage render", { myAppointment, isLoading, error });

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
        return "from-green-400 to-emerald-500 text-white";
      case "COMPLETED":
        return "from-gray-300 to-gray-400 text-white";
      case "CANCELLED":
        return "from-red-400 to-rose-500 text-white";
      case "NO_SHOW":
        return "from-yellow-300 to-amber-400 text-black";
      case "OFFERED":
        return "from-indigo-400 to-violet-500 text-white";
      case "ACCEPTED_BY_EMPLOYEE":
        return "from-emerald-400 to-teal-500 text-white";
      case "REJECTED_BY_EMPLOYEE":
        return "from-rose-300 to-rose-500 text-white";
      default:
        return "from-blue-400 to-cyan-500 text-white"; // PENDING and fallback
    }
  };

  const parseService = (note) => {
    if (!note) return "-";
    const marker = "Service:";
    if (note.includes(marker)) {
      return note.split(marker)[1].trim();
    }
    return note;
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
  const formatTime = (section) => `${section}:00 น.`;

  const handleShareQueue = async () => {
    if (!actions || !myAppointment) return;
    setSharing(true);
    try {
      const serviceText = parseService(myAppointment.note);
      const message = `การจองของฉัน\nบริการ: ${serviceText}\nวันที่: ${formatDate(
        myAppointment.date
      )}\nเวลา: ${formatTime(myAppointment.section)}\nสถานะ: ${statusThai(myAppointment.status)}`;

      const res = await actions.share(message);
      if (res?.status === "shared") {
        alert("แชร์คิวเรียบร้อย");
      } else if (res?.status === "dev-copied") {
        alert("(Dev) ข้อความคิวถูกคัดลอกไปยังคลิปบอร์ด");
      } else if (res?.status === "unsupported") {
        alert("ไม่สามารถแชร์ผ่าน LIFF ได้ (ไม่อยู่ใน LINE client)");
      } else if (res?.status === "error") {
        alert("เกิดข้อผิดพลาดในการแชร์: " + (res.error || "ไม่ทราบสาเหตุ"));
      }
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

      const res = await actions.shareLocation({
        latitude: lat,
        longitude: lng,
        title: shopTitle,
        address: shopAddress,
      });
      if (res?.status === "shared") {
        alert("แชร์โลเคชั่นเรียบร้อย");
      } else if (res?.status === "dev-copied") {
        alert("(Dev) ลิงก์ตำแหน่งถูกคัดลอกไปยังคลิปบอร์ด");
      } else if (res?.status === "unsupported") {
        alert("ไม่สามารถแชร์ตำแหน่งผ่าน LIFF ได้ (ไม่อยู่ใน LINE client)");
      } else if (res?.status === "error") {
        alert("เกิดข้อผิดพลาดในการแชร์ตำแหน่ง: " + (res.error || "ไม่ทราบสาเหตุ"));
      }
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
      html: `คุณต้องการยกเลิกการจอง\n<strong>${parseService(myAppointment.note)}</strong><br/>วันที่ ${formatDate(
        myAppointment.date
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
      const lineUserId = liffProfile?.userId;
      if (!lineUserId) {
        await Swal.fire({ icon: "error", title: "ไม่พบข้อมูลผู้ใช้", text: "ไม่สามารถยกเลิกได้" });
        return;
      }

      const res = await fetch(`/api/appointments/my-appointment?lineUserId=${encodeURIComponent(lineUserId)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        await Swal.fire({ icon: "error", title: "ยกเลิกไม่สำเร็จ", text: data.message || "เกิดข้อผิดพลาด" });
        return;
      }

      await Swal.fire({ icon: "success", title: "ยกเลิกเรียบร้อย", timer: 1400, showConfirmButton: false });
      if (refetch) refetch();
    } catch (e) {
      console.error("cancel error", e);
      await Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถยกเลิกได้" });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">กำลังโหลดข้อมูลคิว...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">เกิดข้อผิดพลาด: {error.message}</div>;
  }

  if (!myAppointment) {
    return <div className="text-center p-10">ไม่มีการจองในขณะนี้</div>;
  }

  const serviceText = parseService(myAppointment.note);
  const translatedStatus = statusThai(myAppointment.status);
  const statusGradientClass = statusColor(myAppointment.status);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-gray-800 font-sans p-6">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">การจองของฉัน</h1>
            <p className="text-sm text-gray-500 mt-1">ดูสถานะและรายละเอียดนัดหมายของคุณ</p>
          </div>
          <div className="text-sm text-gray-500">
            อัปเดตล่าสุด: {new Date(myAppointment.updatedAt).toLocaleString("th-TH")}
          </div>
        </header>

        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left accent */}
            <div className="md:w-2/5 p-6 bg-white">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div
                    className={`inline-block bg-accent-gold px-3 py-1 rounded-full font-semibold text-md ${statusGradientClass}`}
                  >
                    {translatedStatus}
                  </div>

                  <h2 className="mt-6 text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Wrench size={16} /> บริการ
                  </h2>
                  <div className="mt-2">
                    <div className="inline-block bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow">
                      {serviceText}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg p-3 flex items-center gap-2">
                      <Calendar size={18} />
                      <div>
                        <div className="text-xs opacity-90">วันที่</div>
                        <div className="text-base font-semibold">{formatDate(myAppointment.date)}</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-rose-400 to-orange-400 text-white rounded-lg p-3 flex items-center gap-2">
                      <Clock size={18} />
                      <div>
                        <div className="text-xs opacity-90">เวลา</div>
                        <div className="text-base font-semibold">{formatTime(myAppointment.section)}</div>
                      </div>
                    </div>
                  </div>

                  {myAppointment.requiredTags && myAppointment.requiredTags.length > 0 && (
                    <div className="mt-6">
                      <div className="text-xs text-gray-500 mb-2">ทักษะที่ต้องการ</div>
                      <div className="flex flex-wrap gap-2">
                        {myAppointment.requiredTags.map((t) => (
                          <span key={t} className="text-xs lowercase font-medium bg-slate-100 px-2 py-1 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 text-xs text-gray-500">
                  สร้างเมื่อ {new Date(myAppointment.createdAt).toLocaleString("th-TH")}
                </div>
              </div>
            </div>

            {/* Right content */}
            <div className="md:flex-1 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">รายละเอียดเพิ่มเติม</h3>
                  <p className="mt-2 text-sm text-gray-600">{myAppointment.note || "-"}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">ประเภท</div>
                  <div className="font-medium">{myAppointment.type}</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold">พนักงานที่รับผิดชอบ</h4>
                {myAppointment.employee ? (
                  <div className="mt-3 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-medium">
                      {myAppointment.employee.fullname ? myAppointment.employee.fullname.charAt(0) : "-"}
                    </div>
                    <div>
                      <div className="font-medium">{myAppointment.employee.fullname}</div>
                      <div className="text-sm text-gray-600">{myAppointment.employee.phone}</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-gray-600">
                    ยังไม่มีพนักงานรับผิดชอบ — ระบบจะแจ้งเมื่อมีการรับงาน
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleShareQueue}
                  disabled={sharing}
                  className="col-span-1 sm:col-span-1 px-4 py-3 bg-white border border-slate-200 rounded-lg hover:shadow-md"
                >
                  {sharing ? (
                    "กำลังแชร์..."
                  ) : (
                    <>
                      <Share2 size={16} className="inline-block mr-2" /> แชร์คิว
                    </>
                  )}
                </button>

                <button
                  onClick={handleShareLocation}
                  disabled={sharing}
                  className="col-span-1 px-4 py-3 bg-white border border-slate-200 rounded-lg hover:shadow-md"
                >
                  <MapPin size={16} className="inline-block mr-2" /> แชร์โลเคชั่นร้าน
                </button>
              </div>
              <button
                onClick={handleCancel}
                disabled={myAppointment.status !== "PENDING" || isCancelling}
                className={`w-full mt-3 col-span-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                  myAppointment.status === "PENDING" && !isCancelling
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-slate-100 text-slate-500 cursor-not-allowed"
                }`}
              >
                <X size={16} className="inline-block" /> {isCancelling ? "กำลังยกเลิก..." : "ยกเลิกการจอง"}
              </button>

              <div className="mt-6 text-sm text-gray-500">
                หมายเหตุ: ข้อมูลในหน้านี้จะถูกอัปเดตเมื่อพนักงานตอบรับหรือระบบเปลี่ยนแปลงสถานะ
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
