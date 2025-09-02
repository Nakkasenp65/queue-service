"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import NotificationBell from "./components/NotificationBell";
import {
  Clock,
  CheckCircle,
  Calendar,
  Star,
  Target,
  TrendingUp,
  ArrowRight,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useGetEmployeeAppointmentByTags } from "./hooks/useEmployee";
import NotificationPanel from "../components/NotificationPanel";

// Mock employee data
const mockEmployee = {
  adminId: "68aea10ba4d0d8f4b37327cc",
  username: "nakasen",
  fullName: "นาคเสน พุทธเจริญ",
  staffId: "OKM011",
  centralRole: ["admin", "ENGINEER"],
  isActive: true,
  hasCurrentTask: true,
  todayStats: {
    assignedTasks: 8,
    completedTasks: 5,
    pendingTasks: 3,
    averageRating: 4.8,
  },
};

const initialEmployeeNotifications = [
  {
    id: 1,
    notificationType: "NEW_BOOKING_REQUEST",
    title: "งานใหม่ได้รับมอบหมาย",
    description: "คุณได้รับมอบหมายงานซ่อมมือถือจากคุณสมศรี",
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isRead: false,
  },
  {
    id: 2,
    notificationType: "FEEDBACK_REQUEST",
    title: "ได้รับ Feedback ใหม่",
    description: "ลูกค้าให้คะแนน 5 ดาว สำหรับงานซ่อมมือถือ",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
  },
  {
    id: 3,
    notificationType: "SYSTEM_ANNOUNCEMENT",
    title: "อัปเดตระบบ",
    description: "มีฟีเจอร์ใหม่สำหรับการรายงานงาน",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
  },
];

// --- Main Component ---

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const tags = mockEmployee.centralRole;
  const {
    data: employeeAppointments,
    isLoading: employeeAppointmentsLoading,
    isError: employeeAppointmentsError,
  } = useGetEmployeeAppointmentByTags(tags);
  console.log("employeeAppointments: ", employeeAppointments);
  const employeeKpiData = {
    assignedToday: mockEmployee.todayStats.assignedTasks,
    completedToday: mockEmployee.todayStats.completedTasks,
    pendingTasks: mockEmployee.todayStats.pendingTasks,
    averageRating: mockEmployee.todayStats.averageRating,
  };

  const [notifications, setNotifications] = useState(initialEmployeeNotifications);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              Employee Dashboard
            </h1>
            <p className="mt-1 text-slate-500">
              สวัสดี, {mockEmployee.fullName} - ภาพรวมงานของคุณวันนี้
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              จัดการนัดหมาย
            </button>
            <NotificationBell
              unreadCount={unreadCount}
              isOpen={isNotificationOpen}
              setIsOpen={setIsNotificationOpen}
            >
              <NotificationPanel
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClose={() => setIsNotificationOpen(false)}
              />
            </NotificationBell>
          </div>
        </header>

        {/* Employee Profile Section */}
        <section className="mb-8">
          <EmployeeProfile employee={mockEmployee} />
        </section>

        {/* KPIs Section */}
        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="งานที่ได้รับวันนี้"
            value={employeeKpiData.assignedToday}
            icon={Target}
            color="blue"
          />
          <KpiCard
            title="งานที่เสร็จแล้ว"
            value={employeeKpiData.completedToday}
            icon={CheckCircle}
            color="emerald"
          />
          <KpiCard
            title="งานที่รอดำเนินการ"
            value={employeeKpiData.pendingTasks}
            icon={Clock}
            color="amber"
          />
          <KpiCard
            title="คะแนนเฉลี่ย"
            value={`${employeeKpiData.averageRating}/5`}
            icon={Star}
            color="rose"
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TodaySchedule
              router={router}
              appointments={employeeAppointments}
              loading={employeeAppointmentsLoading}
            />
          </div>
          <div className="lg:col-span-1">
            <PerformanceInsights employee={mockEmployee} />
          </div>
        </div>
      </div>

      {/* Appointment Management Modal */}
      <AppointmentManagementModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        employee={mockEmployee}
        appointments={employeeAppointments}
        appointmentsLoading={employeeAppointmentsLoading}
      />
    </main>
  );
}

// --- Sub-components for this page ---

function KpiCard({ title, value, icon: Icon, color }) {
  const colors = {
    amber: "from-amber-500 to-yellow-500",
    blue: "from-blue-600 to-sky-500",
    emerald: "from-emerald-600 to-green-500",
    rose: "from-rose-600 to-red-500",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors[color]} p-5 text-white shadow-lg`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium uppercase">{title}</h3>
          <Icon className="h-7 w-7 text-white/50" />
        </div>
        <p className="mt-2 text-4xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function EmployeeProfile({ employee }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <span className="text-2xl font-bold">{employee.fullName.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-800">{employee.fullName}</h2>
          <p className="text-slate-500">รหัสพนักงาน: {employee.staffId}</p>
          <div className="mt-2 flex items-center gap-2">
            {employee.centralRole.map((role) => (
              <span
                key={role}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
              >
                {role}
              </span>
            ))}
            <div className="flex items-center gap-1">
              <div
                className={`h-2 w-2 rounded-full ${employee.isActive ? "bg-green-500" : "bg-gray-400"}`}
              ></div>
              <span className="text-sm text-slate-600">
                {employee.isActive ? "ออนไลน์" : "ออฟไลน์"}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-800">
            {employee.todayStats.averageRating}
          </div>
          <div className="text-sm text-slate-500">คะแนนเฉลี่ย</div>
          <div className="mt-1 flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(employee.todayStats.averageRating)
                    ? "fill-current text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TodaySchedule({ router, appointments = [], loading = false }) {
  // Map appointments to today's schedule entries
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const mapped = (appointments || []).map((a) => {
    const dateObj = a.date ? new Date(a.date) : null;
    const appointmentDate = a.day || (dateObj ? dateObj.toISOString().split("T")[0] : "");

    let appointmentTime = "";
    if (a.section) {
      if (typeof a.section === "string" && !a.section.includes(":")) {
        const hour = parseInt(a.section, 10);
        appointmentTime = `${hour.toString().padStart(2, "0")}:00`;
      } else {
        appointmentTime = a.section;
      }
    } else if (dateObj) {
      appointmentTime = `${dateObj.getHours().toString().padStart(2, "0")}:${dateObj
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    }

    return {
      id: a.id,
      time: appointmentTime,
      customer: (a.customer && a.customer.name) || a.customerName || a.customerId || "",
      service: a.note ? a.note.replace(/^Service:\s*/i, "") : a.type || a.service || "",
      status: a.status,
      note: a.note || "",
      appointmentDate,
    };
  });

  const todaySchedule = mapped
    .filter((m) => m.appointmentDate === todayStr)
    .sort((a, b) => {
      if (!a.time || !b.time) return 0;
      const [ah, am] = a.time.split(":").map(Number);
      const [bh, bm] = b.time.split(":").map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });

  const statusMap = {
    COMPLETED: { label: "เสร็จแล้ว", color: "bg-green-100 text-green-800" },
    IN_PROGRESS: { label: "กำลังดำเนินการ", color: "bg-blue-100 text-blue-800" },
    PENDING: { label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-800" },
  };

  const handleAcceptAppointment = (appointmentId) => {
    console.log("Accepting appointment:", appointmentId);
  };

  const handleRejectAppointment = (appointmentId) => {
    console.log("Rejecting appointment:", appointmentId);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-b from-indigo-600 to-purple-600 text-white">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">ตารางงานวันนี้</h2>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString("th-TH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{todaySchedule.length} นัด</span>
          <button
            onClick={() => router.push("/queue-management/employee/my-appointments")}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            ดูทั้งหมด
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {todaySchedule.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100"
          >
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-600">{item.time}</div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{item.customer}</p>
                <p className="text-sm text-slate-600">{item.service}</p>
                <p className="mt-1 text-xs text-slate-500">{item.note}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {item.status === "PENDING" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcceptAppointment(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 transition-colors hover:bg-green-200"
                    title="ยอมรับ"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRejectAppointment(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200"
                    title="ปฏิเสธ"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {(() => {
                const sm = statusMap[item.status] || {
                  label: item.status || "ไม่ระบุ",
                  color: "bg-slate-100 text-slate-800",
                };
                return (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sm.color}`}
                  >
                    {sm.label}
                  </span>
                );
              })()}
            </div>
          </div>
        ))}

        {todaySchedule.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">ไม่มีงานที่กำหนดในวันนี้</p>
        )}
      </div>
    </div>
  );
}

function PerformanceInsights({ employee }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-b from-slate-700 to-slate-900 text-white">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">สถิติการทำงาน</h2>
          <p className="text-sm text-slate-500">ภาพรวมประสิทธิภาพของคุณ</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg bg-slate-100 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">งานเสร็จวันนี้</span>
            <span className="text-lg font-bold text-slate-800">
              {employee.todayStats.completedTasks}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{
                width: `${(employee.todayStats.completedTasks / employee.todayStats.assignedTasks) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="rounded-lg bg-slate-100 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">คะแนนเฉลี่ย</span>
            <span className="text-lg font-bold text-slate-800">
              {employee.todayStats.averageRating}/5
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-yellow-500"
              style={{ width: `${(employee.todayStats.averageRating / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="mb-3 font-semibold text-slate-700">เป้าหมายสัปดาห์นี้</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">งานเสร็จ 40 รายการ</span>
              <span className="font-medium text-slate-800">32/40</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200">
              <div className="h-1.5 rounded-full bg-blue-500" style={{ width: "80%" }}></div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <button className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
            ดูรายงานแบบละเอียด
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Appointment Management Modal Component
function AppointmentManagementModal({
  isOpen,
  onClose,
  employee,
  appointments = [],
  appointmentsLoading = false,
}) {
  const [selectedDateRange, setSelectedDateRange] = useState("upcoming"); // Changed default to 'upcoming'
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const itemsPerPage = 5;

  // Map incoming appointments (from useGetEmployeeAppointmentByTags) into the shape the modal expects
  const mappedAppointments = (appointments || []).map((a) => {
    const dateObj = a.date ? new Date(a.date) : null;
    const appointmentDate = a.day || (dateObj ? dateObj.toISOString().split("T")[0] : "");

    let appointmentTime = "";
    if (a.section) {
      if (typeof a.section === "string" && !a.section.includes(":")) {
        const hour = parseInt(a.section, 10);
        appointmentTime = `${hour.toString().padStart(2, "0")}:00`;
      } else {
        appointmentTime = a.section;
      }
    } else if (dateObj) {
      appointmentTime = `${dateObj.getHours().toString().padStart(2, "0")}:${dateObj
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    }

    return {
      id: a.id,
      customerName: (a.customer && a.customer.name) || a.customerId || a.customerName || "",
      service: a.note ? a.note.replace(/^Service:\s*/i, "") : a.type || a.service || "",
      appointmentDate,
      appointmentTime,
      status: a.status,
      note: a.note || "",
      customerPhone: (a.customer && a.customer.phone) || a.customerPhone || "",
      rating: a.score || null,
    };
  });

  // Filter appointments based on date range - prioritizing upcoming appointments
  const getFilteredByDateRange = (appointments) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    switch (selectedDateRange) {
      case "upcoming":
        // Show today + next 7 days (most important for queue management)
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return appointments.filter(
          (apt) =>
            apt.appointmentDate >= todayStr &&
            apt.appointmentDate <= nextWeek.toISOString().split("T")[0],
        );
      case "today":
        return appointments.filter((apt) => apt.appointmentDate === todayStr);
      case "tomorrow":
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        return appointments.filter((apt) => apt.appointmentDate === tomorrowStr);
      case "next7days":
        // Next 7 days excluding today
        const next7 = new Date(today);
        next7.setDate(next7.getDate() + 7);
        const tomorrowStart = new Date(today);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        return appointments.filter(
          (apt) =>
            apt.appointmentDate >= tomorrowStart.toISOString().split("T")[0] &&
            apt.appointmentDate <= next7.toISOString().split("T")[0],
        );
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        return appointments.filter((apt) => apt.appointmentDate === yesterdayStr);
      case "past7days":
        // Past 7 days excluding today
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const yesterdayEnd = new Date(today);
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        return appointments.filter(
          (apt) =>
            apt.appointmentDate >= weekAgo.toISOString().split("T")[0] &&
            apt.appointmentDate <= yesterdayEnd.toISOString().split("T")[0],
        );
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return appointments.filter(
          (apt) => apt.appointmentDate >= monthAgo.toISOString().split("T")[0],
        );
      case "all":
      default:
        return appointments;
    }
  };

  // Apply all filters and sort by date/time priority
  const filteredAppointments = mappedAppointments
    .filter((apt) => statusFilter === "ALL" || apt.status === statusFilter)
    .filter(
      (apt) =>
        searchTerm === "" ||
        apt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const dateFilteredAppointments = getFilteredByDateRange(filteredAppointments).sort((a, b) => {
    // First sort by date
    const dateCompare =
      new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
    if (dateCompare !== 0) return dateCompare;

    // Then sort by time if same date
    const timeA = a.appointmentTime.split(":").map(Number);
    const timeB = b.appointmentTime.split(":").map(Number);
    const timeAMinutes = timeA[0] * 60 + timeA[1];
    const timeBMinutes = timeB[0] * 60 + timeB[1];
    return timeAMinutes - timeBMinutes;
  });
  const totalPages = Math.ceil(dateFilteredAppointments.length / itemsPerPage);
  const paginatedAppointments = dateFilteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleUpdateStatus = (appointmentId, newStatus) => {
    console.log(`Updating appointment ${appointmentId} to ${newStatus}`);
    // Here you would update the appointment status
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
  };

  const handleSaveEdit = (appointmentData) => {
    console.log("Saving appointment:", appointmentData);
    setEditingAppointment(null);
    // Here you would save the edited appointment
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="h-[80vh] max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">จัดการนัดหมาย</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="border-b border-slate-200 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Date Range Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">ช่วงเวลา</label>
              <select
                value={selectedDateRange}
                onChange={(e) => {
                  setSelectedDateRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="upcoming">📅 คิวที่จะมา (วันนี้ + 7 วัน)</option>
                <option value="today">🔥 วันนี้</option>
                <option value="tomorrow">⏰ พรุ่งนี้</option>
                <option value="next7days">📆 7 วันข้างหน้า</option>
                <option value="yesterday">📋 เมื่อวาน</option>
                <option value="past7days">📊 7 วันที่แล้ว</option>
                <option value="month">📈 30 วันที่แล้ว</option>
                <option value="all">🗂️ ทั้งหมด</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">สถานะ</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="ALL">ทั้งหมด</option>
                <option value="PENDING">รอดำเนินการ</option>
                <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                <option value="COMPLETED">เสร็จแล้ว</option>
                <option value="CANCELLED">ยกเลิก</option>
              </select>
            </div>

            {/* Search */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">ค้นหา</label>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อลูกค้าหรือบริการ..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-10 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">
              นัดหมาย ({dateFilteredAppointments.length} รายการ)
            </h3>
          </div>

          {paginatedAppointments.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="text-slate-500">ไม่พบนัดหมายในช่วงเวลาที่เลือก</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onUpdateStatus={handleUpdateStatus}
                  onEdit={handleEditAppointment}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                แสดง {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, dateFilteredAppointments.length)} จาก{" "}
                {dateFilteredAppointments.length} รายการ
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-2 text-sm font-medium text-slate-700">
                  หน้า {currentPage} จาก {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingAppointment && (
          <EditAppointmentModal
            appointment={editingAppointment}
            onSave={handleSaveEdit}
            onClose={() => setEditingAppointment(null)}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

// Individual Appointment Card Component
function AppointmentCard({ appointment, onUpdateStatus, onEdit }) {
  const statusConfig = {
    PENDING: {
      label: "รอดำเนินการ",
      color: "bg-yellow-100 text-yellow-800",
      actions: ["accept", "reject"],
    },
    IN_PROGRESS: {
      label: "กำลังดำเนินการ",
      color: "bg-blue-100 text-blue-800",
      actions: ["complete", "cancel"],
    },
    COMPLETED: { label: "เสร็จแล้ว", color: "bg-green-100 text-green-800", actions: [] },
    CANCELLED: { label: "ยกเลิก", color: "bg-red-100 text-red-800", actions: [] },
  };

  const config = statusConfig[appointment.status] || {
    label: appointment.status || "ไม่ระบุ",
    color: "bg-slate-100 text-slate-800",
    actions: [],
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h4 className="font-semibold text-slate-800">{appointment.customerName}</h4>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
            >
              {config.label}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-3">
            <div>📞 {appointment.customerPhone}</div>
            <div>🛠️ {appointment.service}</div>
            <div>
              📅 {appointment.appointmentDate} เวลา {appointment.appointmentTime}
            </div>
          </div>
          {appointment.note && <p className="mt-2 text-sm text-slate-500">📝 {appointment.note}</p>}
          {appointment.rating && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-sm text-slate-600">⭐ คะแนน:</span>
              <span className="font-medium text-yellow-600">{appointment.rating}/5</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(appointment)}
            className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
            title="แก้ไข"
          >
            <Edit className="h-4 w-4" />
          </button>

          {config.actions.includes("accept") && (
            <button
              onClick={() => onUpdateStatus(appointment.id, "IN_PROGRESS")}
              className="rounded-lg bg-green-100 p-2 text-green-600 transition-colors hover:bg-green-200"
              title="ยอมรับ"
            >
              <Check className="h-4 w-4" />
            </button>
          )}

          {config.actions.includes("reject") && (
            <button
              onClick={() => onUpdateStatus(appointment.id, "CANCELLED")}
              className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200"
              title="ปฏิเสธ"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {config.actions.includes("complete") && (
            <button
              onClick={() => onUpdateStatus(appointment.id, "COMPLETED")}
              className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
              title="เสร็จสิ้น"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Edit Appointment Modal Component
function EditAppointmentModal({ appointment, onSave, onClose }) {
  const [formData, setFormData] = useState({
    customerName: appointment.customerName,
    customerPhone: appointment.customerPhone,
    service: appointment.service,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    note: appointment.note,
    status: appointment.status,
  });

  const handleSave = () => {
    onSave({ ...appointment, ...formData });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">แก้ไขนัดหมาย</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">ชื่อลูกค้า</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">เบอร์โทรศัพท์</label>
            <input
              type="text"
              value={formData.customerPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerPhone: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">บริการ</label>
            <select
              value={formData.service}
              onChange={(e) => setFormData((prev) => ({ ...prev, service: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="ซ่อมมือถือ">ซ่อมมือถือ</option>
              <option value="รีไฟแนนซ์">รีไฟแนนซ์</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">วันที่</label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, appointmentDate: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">เวลา</label>
              <input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, appointmentTime: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">สถานะ</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="PENDING">รอดำเนินการ</option>
              <option value="IN_PROGRESS">กำลังดำเนินการ</option>
              <option value="COMPLETED">เสร็จแล้ว</option>
              <option value="CANCELLED">ยกเลิก</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">หมายเหตุ</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            บันทึก
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
