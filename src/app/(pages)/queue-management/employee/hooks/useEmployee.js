import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employeeAppointments"] });
    },
    onError: (error) => {
      console.error("Failed to update appointment:", error);
    },
  });
}

export function useGetEmployeeAppointmentByTags(tags) {
  return useQuery({
    queryKey: ["employeeAppointments"],
    queryFn: async () => {
      const { data } = await axios.get(`/v1/employees/`, {
        params: {
          tags,
        },
      });
      if (!data) throw Error("Failed getting employee appointment");
      return data;
    },
    refetchOnWindowFocus: "always",
  });
}

export function useGetEmployeeNotificationsByTags(tags) {
  return useQuery({
    queryKey: ["employeeNotifications"],
    queryFn: async () => {
      const { data } = await axios.get("/v1/notifications", {
        params: {
          tags,
        },
      });
      console.log(data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
    refetchOnWindowFocus: "always",
  });
}
