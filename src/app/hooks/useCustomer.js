import { useMutation, useQuery } from "@tanstack/react-query";

export function useCustomer(line_user_id) {
  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", line_user_id],
    queryFn: async () => {
      const response = await fetch(`/api/customers?line_user_id=${line_user_id}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data) {
        // Store in localStorage to avoid unnecessary fetches
        localStorage.setItem("customer", JSON.stringify(data));
      }
      return data;
    },
    enabled: !!line_user_id,
    staleTime: 1000 * 60 * 5,
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error("Failed to create customer");
      }

      const data = await response.json();
      // Store in localStorage after successful creation
      localStorage.setItem("customer", JSON.stringify(data));
      return data;
    },
  });

  return {
    customer,
    isLoading,
    createCustomer: createCustomerMutation.mutate,
    isCreating: createCustomerMutation.isPending,
    error: createCustomerMutation.error,
  };
}
