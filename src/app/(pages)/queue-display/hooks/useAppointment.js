import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useGetMock = () => {
  return useQuery({
    queryKey: ["queues"],
    queryFn: async () => {
      const supabaseToken = process.env.NEXT_PUBLIC_SUPABASE_TOKEN;
      const { data } = await axios.get(
        "https://dtqpahvitdfjutgqfkud.supabase.co/functions/v1/get-all-queues",
        {
          headers: {
            Authorization: `Bearer ${supabaseToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("Supabase data: ", data);
      console.log("เรียกข้อมูลหลังบ้าน: คิว");
      return data.queues;
    },
    refetchInterval: 1 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateMock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, channel }) => {
      // เราจะไม่แก้ไข mockQueue โดยตรงในนี้แล้ว
      // เราจะจำลองว่าส่ง request ไป backend และรอผลลัพธ์
      const queueUpdateUrl = NEXT_PUBLIC_QUEUE_UPDATE;
      if (!queueUpdateUrl) console.error("Queue update url is not provided");
      const { data } = await axios.patch(process.env.NEXT_PUBLIC_QUEUE_UPDATE, {
        id: id,
        status: "Skip",
        channel: channel,
      });

      console.log(
        `🚀 [Mutation] จำลองการส่งคำสั่งอัพเดท ID: ${id} เป็น: ${status}`,
      );

      return { id, status };
    },
    // เราจะใช้ onMutate + onError + onSettled เพื่อทำ Optimistic Update
    // ซึ่งเป็นวิธีที่ Advance และดีที่สุด แต่สำหรับตอนนี้ใช้ onSuccess ก็เพียงพอ
  });
};

let mockQueue = {
  appointments: [
    {
      id: "q001",
      queueNumber: "F-1105",
      customerName: "นายสมชาย ใจดี",
      customerImage: "https://placehold.co/100x100/orange/white?text=SJ",
      serviceName: "ซ่อมโทรศัพท์",
      channel: "1",
      status: "Skip",
      timestamp: "2025-09-06T10:30:05Z", // เวลาที่เริ่มเรียก
    },
    {
      id: "q002",
      queueNumber: "G-1106",
      customerName: "คุณสิริพร งามวงศ์",
      customerImage: "https://placehold.co/100x100/blue/white?text=SN",
      serviceName: "บริการทั่วไป",
      channel: "3",
      status: "Calling",
      timestamp: "2025-09-06T10:29:58Z", // เวลาที่เริ่มเรียก
    },
    {
      id: "q003",
      queueNumber: "R-1107",
      customerName: "David Beckham",
      customerImage: "https://placehold.co/100x100/green/white?text=DB",
      serviceName: "รับของคืน",
      channel: 2, // ยังไม่มีช่องบริการเพราะยังไม่ถูกเรียก
      status: "Calling", // <-- สถานะ: รอเรียก
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
};
