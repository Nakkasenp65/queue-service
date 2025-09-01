import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

/**
 * (อัปเกรด) Hook สำหรับดึงรายการ Appointment ทั้งหมดที่เกี่ยวข้องกับพนักงาน
 * @param {object} employee - Object ข้อมูลพนักงานที่ได้จาก Central Server (มีทั้ง roles และ id)
 */
export function useGetEmployeeAppointments(employeeId) {
  return useQuery({
    // ใช้ employeeId ใน queryKey เพื่อให้แน่ใจว่าถ้าเปลี่ยนคน ข้อมูลจะโหลดใหม่
    queryKey: ["employee-appointments", employeeId],
    queryFn: async () => {
      const { data } = await axios.get(`/v2/appointments/employee/${employeeId}`);
      if (!data) {
        throw new Error(data.message || "Failed to fetch employee appointments");
      }
      return data;
    },
    // จะรัน query ต่อเมื่อมีข้อมูล employee และมี roles
    enabled: !!employeeId,
  });
}

/**
 * Hook สำหรับอัปเดตสถานะของ Appointment (Accept, Reject, Offer)
 * @returns {object} The mutation object from React Query.
 */
export function useUpdateAppointmentAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, action, offerDate, employeeInfo }) => {
      const { data } = await axios.patch(`/v1/appointments/${appointmentId}/action`, {
        action,
        offerDate,
        employeeInfo,
      });

      if (!data) {
        throw new Error(data.message || "Failed to update appointment");
      }
      return data;
    },
    onSuccess: () => {
      // เมื่ออัปเดตสำเร็จ ให้สั่งให้ query 'available-appointments' โหลดข้อมูลใหม่
      // นี่คือหัวใจที่ทำให้ข้อมูลในหน้ารีเฟรชอัตโนมัติ!
      queryClient.invalidateQueries({ queryKey: ["employee-appointments"] });
    },
  });
}

export function useGetEmployeeAppointmentByTags(tags) {
  return useQuery({
    queryKey: ["employeeAppointments", tags],
    queryFn: async () => {
      const { data } = await axios.get(`/v1/employees/`, {
        params: {
          tags,
        },
      });
      console.log(data);

      if (!data) throw Error("Failed getting employee appointment");
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
  });
}
