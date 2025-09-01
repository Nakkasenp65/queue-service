import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Best Practice: Store your API base URL in an environment variable
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
const API_BASE_URL = 'http://localhost:3000/api/v1';

/**
 * Builds the correct URL with query parameters for fetching appointments.
 */
const buildUrl = (startAt, endAt, query, lineUserId) => {
  const params = new URLSearchParams();

  // Use provided dates or default to a 7-day range from now
  const startDate = startAt ? new Date(startAt) : new Date();
  const endDate = endAt ? new Date(endAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  params.set('startAt', startDate.toISOString());
  params.set('endAt', endDate.toISOString());

  if (query) {
    params.set('query', query);
  }
  if (lineUserId) {
    params.set('lineUserId', lineUserId);
  }

  // FIXED: Added a '?' to correctly separate the path from the query string.
  return `${API_BASE_URL}/appointments?${params.toString()}`;
};

/**
 * Hook to fetch a list of appointments, typically for a calendar view.
 * @param {object} params - The query parameters.
 * @param {string|Date} [params.startAt] - The start date for the range.
 * @param {string|Date} [params.endAt] - The end date for the range.
 * @param {string} [params.query] - A search query.
 * @param {string} [params.lineUserId] - The user's LINE ID to filter by.
 */
export function useGetAppointments(params = {}) {
  const { startAt, endAt, query, lineUserId } = params;

  return useQuery({
    queryKey: ['appointments', startAt, endAt, query, lineUserId],
    queryFn: async () => {
      const url = buildUrl(startAt, endAt, query, lineUserId);
      const response = await fetch(url);

      if (!response.ok) {
        const errText = await response.text();
        console.error('useGetAppointments fetch failed:', response.status, errText);
        throw new Error('Failed to fetch appointments');
      }
      return response.json();
    },
    // The query will re-run if any of its dependencies in the queryKey change.
  });
}

/**
 * Hook สำหรับดึงข้อมูลคิวที่ว่างในวันที่เลือก
 * @param {Date} date - วันที่ต้องการตรวจสอบ
 */
export function useGetAvailability(date) {
  return useQuery({
    queryKey: ['availability', date?.toISOString().split('T')[0]], // ใช้แค่วันที่ ไม่เอาเวลา
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/appointments/availability?date=${date.toISOString()}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      return response.json();
    },
    enabled: !!date, // รัน query ต่อเมื่อมี `date` เท่านั้น
  });
}

/**
 * Hook to fetch all appointments for the currently logged-in user.
 * @param {string} lineUserId - The user's LINE ID.
 */
export function useGetCustomerAppointmentDetails(lineUserId) {
  return useQuery({
    queryKey: ['my-appointments', lineUserId],
    queryFn: async () => {
      if (!lineUserId) return []; // Return empty array if no user ID, don't throw error

      // FIXED: Updated the URL to point to the new backend endpoint.
      const response = await fetch(
        `${API_BASE_URL}/appointments/my-appointments?lineUserId=${lineUserId}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user appointments');
      }
      // Your backend returns an array, so we return it directly.
      return response.json();
    },
    enabled: !!lineUserId, // Only run query if lineUserId is provided
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentData) => {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();

      console.log(data);

      if (data.error) {
        throw new Error(data.error || 'Failed to create appointment');
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate queries that should be updated after a new appointment is created.
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
    },
  });
}

export function useGetDisplayAppointment(id) {
  return useQuery({
    queryKey: ['display-appointment', id],
    queryFn: async () => {
      try {
        console.log('Fetching display appointment:', id);
        const response = await fetch(`${API_BASE_URL}/appointments/display/${id}`);
        if (!response.ok) {
          throw new Error({ status: response.status, statusText: response.statusText });
        }
        console.log('Display appointment response:', response);
        const data = await response.json();
        console.log('Display appointment data:', data);
        return data;
      } catch (error) {
        console.log('Error fetching display appointment:', error);
        if (error.status === 404) {
          return null;
        } else {
          throw error;
        }
      }
    },
    enabled: !!id,
  });
}
