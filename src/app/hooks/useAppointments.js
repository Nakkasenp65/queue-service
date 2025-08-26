import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const buildUrl = (startAt, endAt, query, lineUserId) => {
  const now = new Date();
  const defaultStart = startAt ? new Date(startAt) : now;
  const defaultEnd = endAt ? new Date(endAt) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams();
  if (defaultStart) params.set("startAt", defaultStart.toISOString());
  if (defaultEnd) params.set("endAt", defaultEnd.toISOString());
  if (query) params.set("query", query);
  if (lineUserId) params.set("lineUserId", lineUserId);

  return `/api/appointments?${params.toString()}`;
};

/** ดึงรายการนัดหมายตามช่วงวันที่ (รองรับ calendar 7 วัน) */
export function useGetAppointments(params = {}) {
  // Accept either a lineUserId string or an options object
  let lineUserId;
  let startAt;
  let endAt;
  let query;

  if (typeof params === "string") {
    lineUserId = params;
  } else if (params && typeof params === "object") {
    ({ startAt, endAt, query, lineUserId } = params);
  }

  const queryResult = useQuery({
    queryKey: ["appointments", startAt, endAt, query, lineUserId],
    queryFn: async () => {
      const url = buildUrl(startAt, endAt, query, lineUserId);
      const response = await fetch(url);

      if (response.status === 404) {
        return [];
      }
      if (!response.ok) {
        const errText = await response.text();
        console.error("useAppointments fetch failed:", response.status, errText);
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
    },
    enabled: true,
  });

  // Provide a createAppointment helper backed by the mutation hook so callers can create appointments
  const { refetch } = queryResult;
  const createMutation = useCreateAppointmentMutation(refetch);

  const createAppointment = async (appointmentData) => {
    return createMutation.mutateAsync(appointmentData);
  };

  return {
    ...queryResult,
    createAppointment,
    isCreating: createMutation.isLoading,
  };
}

/** สร้างนัดหมายใหม่ แล้ว refresh รายการนัดหมาย */
export function useCreateAppointmentMutation(refetch) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentData) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create appointment");
      }

      return response.json();
    },
    onSuccess: () => {
      if (refetch) refetch(); // Refetch appointments after successful creation
    },
  });
}
