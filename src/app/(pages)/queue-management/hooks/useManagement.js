import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export const useGetDashboardAppointment = () => {
  return useQuery({
    queryKey: ["dashboardAppointments"],
    queryFn: async () => {
      const { data } = await axios.get("/v2/appointments/dashboard");
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
