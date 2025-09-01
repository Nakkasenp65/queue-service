'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Share2,
  Phone,
  Wrench,
  X,
  CalendarPlus,
  History,
  RotateCw,
  Home,
} from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useGetCustomerAppointmentDetails } from '@/app/hooks/useAppointments';
import { useLiff } from '@/app/components/Provider/LiffProvider';
import BottomNavbar from '../../queue-services/components/BottomNavbar';

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

  // Fancy loading variants (petals count, radius, gradients)
  const loadingVariants = [
    { petals: 6, radius: 38, from: 'from-pink-500', to: 'to-rose-400' },
    { petals: 8, radius: 42, from: 'from-indigo-500', to: 'to-sky-400' },
    { petals: 10, radius: 46, from: 'from-emerald-500', to: 'to-lime-400' },
    { petals: 12, radius: 50, from: 'from-violet-500', to: 'to-fuchsia-400' },
  ];
  const loadingMessages = [
    'กำลังดึงข้อมูลการจองของคุณ…',
    'กำลังจัดคิวให้เหมาะสมที่สุด…',
    'รอสักครู่ กำลังเตรียมดอกไม้สวยๆ…',
    'กำลังประมวลผลข้อมูลล่าสุด…',
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

  console.log('MyAppointmentPage render', { myAppointment, isLoading, error });

  const statusThai = (status) => {
    switch (status) {
      case 'PENDING':
        return 'รอดำเนินการ';
      case 'CONFIRMED':
        return 'ยืนยันแล้ว';
      case 'COMPLETED':
        return 'เสร็จสิ้น';
      case 'CANCELLED':
        return 'ยกเลิก';
      case 'NO_SHOW':
        return 'ไม่มา';
      case 'OFFERED':
        return 'เสนอเวลาใหม่';
      case 'ACCEPTED_BY_EMPLOYEE':
        return 'รับโดยพนักงาน';
      case 'REJECTED_BY_EMPLOYEE':
        return 'ปฏิเสธโดยพนักงาน';
      default:
        return status || '-';
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'from-green-400 to-emerald-500 text-white';
      case 'COMPLETED':
        return 'from-gray-300 to-gray-400 text-white';
      case 'CANCELLED':
        return 'from-red-400 to-rose-500 text-white';
      case 'NO_SHOW':
        return 'from-yellow-300 to-amber-400 text-black';
      case 'OFFERED':
        return 'from-indigo-400 to-violet-500 text-white';
      case 'ACCEPTED_BY_EMPLOYEE':
        return 'from-emerald-400 to-teal-500 text-white';
      case 'REJECTED_BY_EMPLOYEE':
        return 'from-rose-300 to-rose-500 text-white';
      default:
        return 'from-blue-400 to-cyan-500 text-white'; // PENDING and fallback
    }
  };

  const parseService = (note) => {
    if (!note) return '-';
    const marker = 'Service:';
    if (note.includes(marker)) {
      return note.split(marker)[1].trim();
    }
    return note;
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (section) => `${section}:00 น.`;

  const handleShareQueue = async () => {
    if (!actions || !myAppointment) return;
    setSharing(true);
    try {
      const serviceText = parseService(myAppointment.note);
      const message = `การจองของฉัน\nบริการ: ${serviceText}\nวันที่: ${formatDate(
        myAppointment.date,
      )}\nเวลา: ${formatTime(myAppointment.section)}\nสถานะ: ${statusThai(myAppointment.status)}`;

      const res = await actions.share(message);
      if (res?.status === 'shared') {
        alert('แชร์คิวเรียบร้อย');
      } else if (res?.status === 'dev-copied') {
        alert('(Dev) ข้อความคิวถูกคัดลอกไปยังคลิปบอร์ด');
      } else if (res?.status === 'unsupported') {
        alert('ไม่สามารถแชร์ผ่าน LIFF ได้ (ไม่อยู่ใน LINE client)');
      } else if (res?.status === 'error') {
        alert('เกิดข้อผิดพลาดในการแชร์: ' + (res.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (e) {
      console.error('share error', e);
      alert('เกิดข้อผิดพลาดในการแชร์');
    } finally {
      setSharing(false);
    }
  };

  const handleShareLocation = async () => {
    if (!actions) return;
    setSharing(true);
    try {
      const shopTitle = process.env.NEXT_PUBLIC_SHOP_NAME || 'ร้านของเรา';
      const shopAddress = process.env.NEXT_PUBLIC_SHOP_ADDRESS || '';
      const lat = process.env.NEXT_PUBLIC_SHOP_LAT;
      const lng = process.env.NEXT_PUBLIC_SHOP_LNG;

      const res = await actions.shareLocation({
        latitude: lat,
        longitude: lng,
        title: shopTitle,
        address: shopAddress,
      });
      if (res?.status === 'shared') {
        alert('แชร์โลเคชั่นเรียบร้อย');
      } else if (res?.status === 'dev-copied') {
        alert('(Dev) ลิงก์ตำแหน่งถูกคัดลอกไปยังคลิปบอร์ด');
      } else if (res?.status === 'unsupported') {
        alert('ไม่สามารถแชร์ตำแหน่งผ่าน LIFF ได้ (ไม่อยู่ใน LINE client)');
      } else if (res?.status === 'error') {
        alert('เกิดข้อผิดพลาดในการแชร์ตำแหน่ง: ' + (res.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (e) {
      console.error('shareLocation error', e);
      alert('เกิดข้อผิดพลาดในการแชร์ตำแหน่ง');
    } finally {
      setSharing(false);
    }
  };

  const handleCancel = async () => {
    if (!myAppointment) return;

    const result = await Swal.fire({
      title: 'ยืนยันการยกเลิกการจอง?',
      html: `คุณต้องการยกเลิกการจอง\n<strong>${parseService(myAppointment.note)}</strong><br/>วันที่ ${formatDate(
        myAppointment.date,
      )} เวลา ${formatTime(myAppointment.section)}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setIsCancelling(true);
    try {
      const lineUserId = liffProfile?.userId;
      if (!lineUserId) {
        await Swal.fire({ icon: 'error', title: 'ไม่พบข้อมูลผู้ใช้', text: 'ไม่สามารถยกเลิกได้' });
        return;
      }
      const { data } = await axios.post(
        `http://localhost:3000/api/v1/appointments/cancel/${myAppointment.id}`,
      );
      console.log(data);

      if (!data) {
        await Swal.fire({
          icon: 'error',
          title: 'ยกเลิกไม่สำเร็จ',
          text: data.message || 'เกิดข้อผิดพลาด',
        });
        return;
      }

      await Swal.fire({
        icon: 'success',
        title: 'ยกเลิกเรียบร้อย',
        timer: 1400,
        showConfirmButton: false,
      });
      if (refetch) refetch();
    } catch (e) {
      console.error('cancel error', e);
      await Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถยกเลิกได้' });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    const v = loadingVariants[variantIndex] ?? loadingVariants[0];
    const petals = Array.from({ length: v.petals });
    return (
      <main className="relative flex min-h-dvh items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6 font-sans text-gray-800">
        <div className="mx-auto w-full max-w-sm text-center">
          <div className="relative mx-auto h-44 w-44">
            {/* soft glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/60 to-white/10 shadow-xl ring-1 ring-black/5 backdrop-blur-md" />

            {/* rotating flower */}
            <div
              className="absolute inset-0 animate-spin"
              style={{ animationDuration: '6s', transformOrigin: '50% 50%' }}
            >
              <div className="relative h-full w-full">
                {petals.map((_, i) => {
                  const angle = (360 / v.petals) * i;
                  const transform = `rotate(${angle}deg) translateY(-${v.radius}px)`;
                  return (
                    <span
                      key={i}
                      className={`absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${v.from} ${v.to} shadow-md`}
                      style={{ transform }}
                    />
                  );
                })}

                {/* center bud */}
                <span className="absolute top-1/2 left-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 shadow-lg ring-2 ring-white/70" />

                {/* sparkle accents */}
                <span className="absolute top-[28%] left-[20%] h-2 w-2 rounded-full bg-white/90 blur-[0.5px]" />
                <span className="absolute right-[18%] bottom-[30%] h-1.5 w-1.5 rounded-full bg-white/80" />
                <span className="absolute bottom-[18%] left-[35%] h-1.5 w-1.5 animate-ping rounded-full bg-white/70" />
              </div>
            </div>
          </div>

          {/* text */}
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

  if (!myAppointment) {
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
              <CalendarPlus size={16} />
              จองคิวใหม่
            </Link>
            <Link
              href="/appointments/history"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
            >
              <History size={16} />
              ประวัติ
            </Link>
          </div>

          <button
            type="button"
            onClick={() => refetch && refetch()}
            className="mt-4 inline-flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700"
          >
            <RotateCw size={16} />
            ลองรีเฟรช
          </button>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
            <Link
              href="/queue-services"
              className="inline-flex items-center gap-1 hover:text-slate-700"
            >
              <Home size={14} />
              หน้าหลัก
            </Link>
            <button
              type="button"
              onClick={handleShareLocation}
              className="inline-flex items-center gap-1 hover:text-slate-700"
            >
              <MapPin size={14} />
              ตำแหน่งร้าน
            </button>
            <a
              href={`tel:${process.env.NEXT_PUBLIC_SHOP_PHONE || ''}`}
              className="inline-flex items-center gap-1 hover:text-slate-700"
            >
              <Phone size={14} />
              โทรศัพท์ร้าน
            </a>
          </div>
        </div>
        <BottomNavbar />
      </main>
    );
  }

  const serviceText = parseService(myAppointment.note);
  const translatedStatus = statusThai(myAppointment.status);
  const statusGradientClass = statusColor(myAppointment.status);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 font-sans text-gray-800">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold md:text-3xl">การจองของฉัน</h1>
            <p className="mt-1 text-sm text-gray-500">ดูสถานะและรายละเอียดนัดหมายของคุณ</p>
          </div>
          <div className="text-sm text-gray-500">
            อัปเดตล่าสุด: {new Date(myAppointment.updatedAt).toLocaleString('th-TH')}
          </div>
        </header>

        <article className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex flex-col md:flex-row">
            {/* Left accent */}
            <div className="bg-white p-6 md:w-2/5">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div
                    className={`bg-accent-gold text-md inline-block rounded-full px-3 py-1 font-semibold ${statusGradientClass}`}
                  >
                    {translatedStatus}
                  </div>

                  <h2 className="mt-6 flex items-center gap-2 text-lg font-bold text-slate-800">
                    <Wrench size={16} /> บริการ
                  </h2>
                  <div className="mt-2">
                    <div className="inline-block rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow">
                      {serviceText}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 p-3 text-white">
                      <Calendar size={18} />
                      <div>
                        <div className="text-xs opacity-90">วันที่</div>
                        <div className="text-base font-semibold">
                          {formatDate(myAppointment.date)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-rose-400 to-orange-400 p-3 text-white">
                      <Clock size={18} />
                      <div>
                        <div className="text-xs opacity-90">เวลา</div>
                        <div className="text-base font-semibold">
                          {formatTime(myAppointment.section)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {myAppointment.requiredTags && myAppointment.requiredTags.length > 0 && (
                    <div className="mt-6">
                      <div className="mb-2 text-xs text-gray-500">ทักษะที่ต้องการ</div>
                      <div className="flex flex-wrap gap-2">
                        {myAppointment.requiredTags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium lowercase"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 text-xs text-gray-500">
                  สร้างเมื่อ {new Date(myAppointment.createdAt).toLocaleString('th-TH')}
                </div>
              </div>
            </div>

            {/* Right content */}
            <div className="p-6 md:flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">รายละเอียดเพิ่มเติม</h3>
                  <p className="mt-2 text-sm text-gray-600">{myAppointment.note || '-'}</p>
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-medium">
                      {myAppointment.employee.fullname
                        ? myAppointment.employee.fullname.charAt(0)
                        : '-'}
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

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <button
                  onClick={handleShareQueue}
                  disabled={sharing}
                  className="col-span-1 rounded-lg border border-slate-200 bg-white px-4 py-3 hover:shadow-md sm:col-span-1"
                >
                  {sharing ? (
                    'กำลังแชร์...'
                  ) : (
                    <>
                      <Share2 size={16} className="mr-2 inline-block" /> แชร์คิว
                    </>
                  )}
                </button>

                <button
                  onClick={handleShareLocation}
                  disabled={sharing}
                  className="col-span-1 rounded-lg border border-slate-200 bg-white px-4 py-3 hover:shadow-md"
                >
                  <MapPin size={16} className="mr-2 inline-block" /> แชร์โลเคชั่นร้าน
                </button>
              </div>
              <button
                onClick={handleCancel}
                disabled={myAppointment.status !== 'PENDING' || isCancelling}
                className={`col-span-1 mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold ${
                  myAppointment.status === 'PENDING' && !isCancelling
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'cursor-not-allowed bg-slate-100 text-slate-500'
                }`}
              >
                <X size={16} className="inline-block" />{' '}
                {isCancelling ? 'กำลังยกเลิก...' : 'ยกเลิกการจอง'}
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
