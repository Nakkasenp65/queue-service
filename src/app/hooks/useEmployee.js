import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export function useGetAppointmentsByTags(tags) {
  return useQuery({
    queryKey: ["employee-appointments", tags],
    queryFn: async () => {
      // สร้าง query string จาก array ของ tags
      // ผลลัพธ์จะเป็น: "?tags=admin&tags=ENGINEER"
      const params = new URLSearchParams();
      tags.forEach((tag) => params.append("tags", tag));
      const queryString = params.toString();

      // เรียก API ไปยัง Backend พร้อมกับ query string
      const response = await fetch(`${API_URL}/appointments/employee-appointments?${queryString}`, {
        credentials: "include", // สำคัญมาก! เพื่อส่ง Cookie ไปด้วย
      });

      const data = await response.json();

      console.log(data);

      if (data.error) {
        throw new Error("Failed to fetch employee appointments");
      }
      return data;
    },

    // enabled: เงื่อนไขในการรัน query นี้
    // จะทำงานก็ต่อเมื่อ `tags` ไม่ใช่ค่าว่างและมีสมาชิกใน array
    // ป้องกันการยิง API ที่ไม่จำเป็น
    enabled: !!tags && tags.length > 0,
  });
}

/**
 * Hook สำหรับอัปเดตสถานะของ Appointment (Accept, Reject, Offer)
 * @returns {object} The mutation object from React Query.
 */
export function useUpdateAppointmentAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, action, offerDate }) => {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/action`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, offerDate }), // ส่ง action และ offerDate ไปใน body
        credentials: "include",
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
      queryClient.invalidateQueries({ queryKey: ["available-appointments"] });
    },
  });
}
