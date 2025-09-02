"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NotificationBell from "./components/NotificationBell";
import { Clock, CheckCircle, Star, Target, Edit } from "lucide-react";
import {
  useGetEmployeeAppointmentByTags,
  useGetEmployeeNotificationsByTags,
} from "./hooks/useEmployee";
import NotificationPanel from "../components/NotificationPanel";
import EmployeeProfile from "./components/EmployeeProfile";
import KpiCard from "./components/KpiCard";
import TodaySchedule from "./components/TodaySchedule";
import PerformanceInsights from "./components/PerformanceInsights";
import AppointmentManagementModal from "./components/AppointmentManagementModal";

// Mock employee data remains for profile and KPI sections
const mockEmployee = {
  adminId: "68aea10ba4d0d8f4b37327cc",
  username: "nakasen",
  fullName: "นาคเสน พุทธเจริญ",
  staffId: "OKM011",
  centralRole: ["admin", "ENGINEER", "REFINANCE"],
  isActive: true,
  hasCurrentTask: true,
  todayStats: {
    assignedTasks: 8,
    completedTasks: 5,
    pendingTasks: 3,
    averageRating: 4.8,
  },
};

// ประเภทนอกสถานที่
// 1. รับคิวมาจากผู้ใช้ PENDING
// 2. ยอมรับคิว ACCEPT_BY_EMPLOYEE
// 3. จ่ายค่าและแนบสลิปค่ามัดจำ WAITING_FOR_PAYMENT
// 4. เปลี่ยนสถานะเป็น confirmed CONFIRMED

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const tags = mockEmployee.centralRole;

  // Hooks to fetch real data
  const { data: employeeAppointments, isLoading: employeeAppointmentsLoading } =
    useGetEmployeeAppointmentByTags(tags);
  const {
    data: employeeNotificationsData, // Renamed to avoid conflict
    isLoading: employeeNotificationsLoading,
  } = useGetEmployeeNotificationsByTags(tags);

  // Local state for notifications, appointments, and UI
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Effect to update local notifications state when fetched data changes
  useEffect(() => {
    if (employeeNotificationsData) {
      // Map the 'type' field from the Prisma schema to 'notificationType'
      // which the NotificationPanel component expects.
      const formattedNotifications = employeeNotificationsData.map((n) => ({
        ...n,
        notificationType: n.type,
      }));
      setNotifications(formattedNotifications);
    }
  }, [employeeNotificationsData]);

  const employeeKpiData = {
    assignedToday: mockEmployee.todayStats.assignedTasks,
    completedToday: mockEmployee.todayStats.completedTasks,
    pendingTasks: mockEmployee.todayStats.pendingTasks,
    averageRating: mockEmployee.todayStats.averageRating,
  };

  // Calculate unread count from the live notifications state
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handlers to manage local state (in a real app, these would trigger mutations)
  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    // TODO: Add mutation to mark notification as read on the server
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    // TODO: Add mutation to mark all notifications as read on the server
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
                notifications={notifications} // Pass the live notifications state
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
