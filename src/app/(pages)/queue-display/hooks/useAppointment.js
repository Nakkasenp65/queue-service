import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useGetMock = () => {
  return useQuery({
    queryKey: ["mock"],
    queryFn: () =>
      new Promise((resolve) => {
        setTimeout(async () => {
          console.log("เรียกข้อมูลหลังบ้าน: คิว");
          resolve({
            mockQueue,
          });
        }, 500);
      }),
    refetchInterval: 1 * 30,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateMock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      // เราจะไม่แก้ไข mockQueue โดยตรงในนี้แล้ว
      // เราจะจำลองว่าส่ง request ไป backend และรอผลลัพธ์
      console.log(
        `🚀 [Mutation] จำลองการส่งคำสั่งอัพเดท ID: ${id} เป็น: ${status}`,
      );

      await new Promise((resolve) => setTimeout(resolve, 300)); // จำลอง network delay
      // คืนค่าข้อมูลที่ต้องการนำไปอัพเดท
      return { id, status };
    },

    // เราจะใช้ onMutate + onError + onSettled เพื่อทำ Optimistic Update
    // ซึ่งเป็นวิธีที่ Advance และดีที่สุด แต่สำหรับตอนนี้ใช้ onSuccess ก็เพียงพอ

    onSuccess: (updatedData) => {
      queryClient.setQueryData(["mock"], (oldData) => {
        if (!oldData) return;
        const newAppointments = oldData.mockQueue.appointments.map((apt) => {
          if (apt.id === updatedData.id) {
            return { ...apt, status: updatedData.status };
          }
          return apt;
        });
        return {
          ...oldData,
          mockQueue: {
            ...oldData.mockQueue,
            appointments: newAppointments,
          },
        };
      });
    },
  });
};

let mockQueue = {
  appointments: [
    {
      id: "q001",
      queueNumber: "F1105",
      customerName: "นายสมชาย ใจดี",
      customerImage: "https://placehold.co/100x100/orange/white?text=SJ",
      serviceName: "ซ่อมโทรศัพท์",
      channel: "1",
      status: "Calling",
      timestamp: "2025-09-06T10:30:05Z", // เวลาที่เริ่มเรียก
    },
    {
      id: "q002",
      queueNumber: "G1106",
      customerName: "คุณสิริพร งามวงศ์",
      customerImage: "https://placehold.co/100x100/blue/white?text=SN",
      serviceName: "บริการทั่วไป",
      channel: "3",
      status: "Skip",
      timestamp: "2025-09-06T10:29:58Z", // เวลาที่เริ่มเรียก
    },
    {
      id: "q003",
      queueNumber: "R1107",
      customerName: "David Beckham",
      customerImage: "https://placehold.co/100x100/green/white?text=DB",
      serviceName: "รับของคืน",
      channel: null, // ยังไม่มีช่องบริการเพราะยังไม่ถูกเรียก
      status: "Pending", // <-- สถานะ: รอเรียก
      timestamp: "2025-09-06T10:25:10Z", // เวลาที่กดรับคิว
    },
    {
      id: "q004",
      queueNumber: "F1108",
      customerName: "ลิซ่า Blackpink",
      customerImage: "https://placehold.co/100x100/pink/white?text=LS",
      serviceName: "ซ่อมโทรศัพท์",
      channel: null,
      status: "Pending", // <-- สถานะ: รอเรียก
      timestamp: "2025-09-06T10:24:30Z", // เวลาที่กดรับคิว
    },

    {
      id: "q005",
      queueNumber: "R1104",
      customerName: "Robert Downey Jr.",
      customerImage: "https://placehold.co/100x100/red/white?text=RD",
      serviceName: "รับของคืน test",
      channel: "2",
      status: "Finished", // <-- สถานะ: บริการเสร็จสิ้น
      timestamp: "2025-09-06T10:28:15Z", // เวลาที่เรียกและจบไปแล้ว
    },

    {
      id: "q006",
      queueNumber: "G1103",
      customerName: "Taylor Swift",
      customerImage: "https://placehold.co/100x100/purple/white?text=TS",
      serviceName: "บริการทั่วไป",
      channel: "4",
      status: "Skip", // <-- สถานะ: ข้ามคิว
      timestamp: "2025-09-06T10:27:40Z", // เวลาที่กดข้ามคิว
    },
  ],
  mockConfigDisplayPage: {
    isDisplay: true,
    isRunning: false,
  },
};
