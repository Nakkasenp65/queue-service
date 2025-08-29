import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

/**
 * (อัปเกรด) Hook สำหรับดึงรายการ Appointment ทั้งหมดที่เกี่ยวข้องกับพนักงาน
 * @param {object} employee - Object ข้อมูลพนักงานที่ได้จาก Central Server (มีทั้ง roles และ id)
 */
export function useGetAppointmentsByTags(employee) {
  const tags = employee?.centralRole; // ดึง tags/roles จาก object
  const employeeAdminId = employee?.adminId;

  return useQuery({
    // ใช้ employeeAdminId ใน queryKey เพื่อให้แน่ใจว่าถ้าเปลี่ยนคน ข้อมูลจะโหลดใหม่
    queryKey: ["employee-appointments", employeeAdminId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tags) {
        tags.forEach((tag) => params.append("tags", tag));
      }
      params.append("employeeAdminId", employeeAdminId); // ส่ง adminId ไป
      const queryString = params.toString();

      const response = await fetch(`${API_URL}/appointments/employee-appointments?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch employee appointments");
      }
      return response.json();
    },
    // จะรัน query ต่อเมื่อมีข้อมูล employee และมี roles
    enabled: !!employee && !!tags && tags.length > 0,
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
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/action`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // ส่ง employeeInfo (Object) ไปใน body
        body: JSON.stringify({ action, offerDate, employeeInfo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update appointment");
      }
      return response.json();
    },
    onSuccess: () => {
      // เมื่ออัปเดตสำเร็จ ให้สั่งให้ query 'available-appointments' โหลดข้อมูลใหม่
      // นี่คือหัวใจที่ทำให้ข้อมูลในหน้ารีเฟรชอัตโนมัติ!
      queryClient.invalidateQueries({ queryKey: ["employee-appointments"] });
    },
  });
}
