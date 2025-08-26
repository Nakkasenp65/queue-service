import { useMutation, useQuery } from "@tanstack/react-query";

export function useAppointments(lineUserId) {
  const {
    data: appointments,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["appointments", lineUserId],
    queryFn: async () => {
      const response = await fetch(`/api/appointments/${lineUserId}`);
      if (response.status === 404) {
        return [];
      }
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: !!lineUserId,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }

      return response.json();
    },
    onSuccess: () => {
      refetch(); // Refetch appointments after successful creation
    },
  });

  return {
    appointments,
    isLoading,
    createAppointment: createAppointmentMutation.mutateAsync,
    isCreating: createAppointmentMutation.isPending,
    error: createAppointmentMutation.error,
    refetch,
  };
}
