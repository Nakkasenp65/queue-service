import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

/**
 * Hook for cancelling an appointment
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId) => {
      const response = await axios.post(
        `http://localhost:3000${API_BASE}/appointments/cancel/${appointmentId}`,
      );
      return response.data;
    },
    onSuccess: (data, appointmentId) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["customer-appointment"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });

      // Show success message
      Swal.fire({
        icon: "success",
        title: "ยกเลิกเรียบร้อย",
        timer: 1200,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      console.error("cancel error", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถยกเลิกได้",
      });
    },
  });
}

/**
 * Hook for accepting an offer (reschedule)
 */
export function useAcceptOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId) => {
      const response = await axios.patch(
        `http://localhost:3000${API_BASE}/appointments/offer/${appointmentId}/accept`,
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["customer-appointment"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });

      // Show success message
      Swal.fire({
        icon: "success",
        title: "ยืนยันสำเร็จ",
        timer: 1100,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      console.error("accept-offer error", error);
      Swal.fire({
        icon: "error",
        title: "ยืนยันไม่สำเร็จ",
        text: "โปรดลองใหม่อีกครั้ง",
      });
    },
  });
}

/**
 * Hook for rejecting an offer (reschedule)
 */
export function useRejectOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, reason }) => {
      const response = await axios.patch(
        `http://localhost:3000${API_BASE}/appointments/offer/${appointmentId}/reject`,
        { reason: reason || "" },
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["customer-appointment"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });

      // Show success message
      Swal.fire({
        icon: "success",
        title: "ส่งคำตอบแล้ว",
        timer: 1100,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      console.error("reject-offer error", error);
      Swal.fire({
        icon: "error",
        title: "ปฏิเสธไม่สำเร็จ",
        text: "โปรดลองใหม่อีกครั้ง",
      });
    },
  });
}

/**
 * Combined hook that provides all appointment mutation actions
 * This is the main hook to use in components
 */
export function useAppointmentActions() {
  const cancelMutation = useCancelAppointment();
  const acceptOfferMutation = useAcceptOffer();
  const rejectOfferMutation = useRejectOffer();

  return {
    // Individual mutations
    cancelMutation,
    acceptOfferMutation,
    rejectOfferMutation,

    // Convenience action handlers that include confirmation dialogs
    handleCancel: async (appointment, { parseService, formatDate, formatTime }) => {
      if (!appointment) return;

      const result = await Swal.fire({
        title: "ยืนยันการยกเลิกการจอง?",
        html: `คุณต้องการยกเลิกการจอง<br/><strong>${parseService(appointment.note)}</strong><br/>วันที่ ${formatDate(
          appointment.date,
        )} เวลา ${formatTime(appointment.section)}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        cancelMutation.mutate(appointment.id);
      }
    },

    handleAcceptOffer: async (appointment, getOfferedInfo) => {
      if (!appointment) return;
      const offered = getOfferedInfo(appointment);

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

      if (confirm.isConfirmed) {
        acceptOfferMutation.mutate(appointment.id);
      }
    },

    handleRejectOffer: async (appointment) => {
      if (!appointment) return;

      const { value: reason } = await Swal.fire({
        title: "ปฏิเสธเวลาใหม่?",
        input: "text",
        inputPlaceholder: "ระบุเหตุผล (ถ้ามี)",
        showCancelButton: true,
        confirmButtonText: "ปฏิเสธ",
        cancelButtonText: "ยกเลิก",
      });

      if (reason !== undefined) {
        rejectOfferMutation.mutate({
          appointmentId: appointment.id,
          reason: reason || "",
        });
      }
    },

    // Loading states
    isLoading:
      cancelMutation.isPending || acceptOfferMutation.isPending || rejectOfferMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isAccepting: acceptOfferMutation.isPending,
    isRejecting: rejectOfferMutation.isPending,
  };
}
