import { useState, useEffect } from "react";

export function useCustomer(lineUserId) {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if we have a lineUserId and haven't already determined this user doesn't exist
    if (!lineUserId) {
      setCustomer(null);
      setIsLoading(false);
      return;
    }

    // Prevent multiple calls for the same userId
    if (customer !== null || isLoading) return;

    const fetchCustomer = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/customers/${lineUserId}`);

        if (response.status === 404) {
          // Customer doesn't exist - this is expected for new users
          setCustomer(null); // Set to null to indicate no customer found
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCustomer(data);
      } catch (err) {
        console.error("Error fetching customer:", err);
        setError(err.message);
        setCustomer(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [lineUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { customer, isLoading, error };
}
