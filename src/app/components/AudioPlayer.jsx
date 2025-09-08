"use client";

import { useEffect, useState, useRef } from "react";

export default function AudioPlayer({
  announcementText,
  trigger,
  channel,
  firstTime = true,
}) {
  const [audioQueue, setAudioQueue] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const audioRef = useRef(null); // useRef สำหรับเก็บ Audio object เพียงตัวเดียว

  // Object ที่จับคู่ตัวอักษรกับไฟล์เสียง
  const audioMap = {
    notification: "/audio/notify-queue-2.mp3",
    G: "/audio/G.wav",
    F: "/audio/F.wav",
    R: "/audio/R.wav",
    1: "/audio/1.wav",
    2: "/audio/2.wav",
    3: "/audio/3.wav",
    4: "/audio/4 (1).wav",
    5: "/audio/5 (1).wav",
    6: "/audio/6.wav",
    7: "/audio/7.wav",
    8: "/audio/8.wav",
    9: "/audio/9.wav",
    0: "/audio/0 (1).wav",
    serviceCounter: "/audio/ที่ช่องบริการ.wav",
    ka: "/audio/ค่ะ (1).wav",
    pleaseWelcome: "/audio/ขอเชิญหมายเลข.wav",
    again: "/audio/ประกาศอีกครั้งนะคะ (1).wav",
  };

  // Effect 1: สร้าง Audio object เพียงครั้งเดียวเมื่อ component โหลด
  useEffect(() => {
    // สร้าง instance ของ Audio และเก็บไว้ใน ref
    audioRef.current = new Audio();

    // Event listener เมื่อเสียงเล่นจบ
    const handleAudioEnded = () => {
      // เล่นเสียงถัดไปในคิว
      setCurrentAudioIndex((prevIndex) => prevIndex + 1);
    };

    audioRef.current.addEventListener("ended", handleAudioEnded);

    // Cleanup function: จะถูกเรียกเมื่อ component unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleAudioEnded);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // dependency array ว่าง [] เพื่อให้ effect นี้ทำงานแค่ครั้งเดียว

  // Effect 2: สร้างคิวเสียงเมื่อ 'trigger' เปลี่ยน
  useEffect(() => {
    if (trigger === 0 || !announcementText) {
      setAudioQueue([]);
      setCurrentAudioIndex(0);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    const announcementParts = announcementText.split("-");
    const prefix = announcementParts[0];
    const number = announcementParts[1] || "";

    let queue = [];
    if (!firstTime) {
      queue.push(audioMap.again);
    } else {
      queue.push(audioMap.notification);
    }
    queue.push(audioMap.pleaseWelcome);

    for (const char of prefix) {
      if (audioMap[char.toUpperCase()]) {
        queue.push(audioMap[char.toUpperCase()]);
      }
    }

    for (const char of number) {
      if (audioMap[char]) {
        queue.push(audioMap[char]);
      }
    }

    queue.push(audioMap.serviceCounter);
    if (audioMap[String(channel)]) {
      queue.push(audioMap[String(channel)]);
    }
    queue.push(audioMap.ka);

    setAudioQueue(queue);
    setCurrentAudioIndex(0); // เริ่มเล่นจาก index แรกเสมอ
    console.log("สร้างคิวเสียงใหม่:", queue);
  }, [trigger, announcementText, channel, firstTime]); // เพิ่ม dependencies ให้ครบ

  // Effect 3: จัดการการเล่นเสียงตามคิว
  useEffect(() => {
    // ตรวจสอบว่ามีคิวเสียงให้เล่นหรือไม่ และ index ไม่เกินความยาวของคิว
    if (
      audioRef.current &&
      audioQueue.length > 0 &&
      currentAudioIndex < audioQueue.length
    ) {
      const audioSrc = audioQueue[currentAudioIndex];
      audioRef.current.src = audioSrc;

      // การเรียก .play() จะคืนค่า Promise
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then((_) => {
            // เล่นเสียงสำเร็จ
            console.log(`กำลังเล่น: ${audioSrc}`);
          })
          .catch((error) => {
            // ส่วนนี้สำคัญมากสำหรับการดีบัก
            console.error(`ไม่สามารถเล่นเสียงได้: ${audioSrc}`, error);
            // กรณีนี้มักเกิดจาก Autoplay Policy, ลองให้ผู้ใช้คลิกเพื่อเริ่ม
          });
      }
    } else if (
      audioQueue.length > 0 &&
      currentAudioIndex >= audioQueue.length
    ) {
      // เมื่อเล่นจนจบครบทุกคิวแล้ว
      console.log("เล่นเสียงประกาศครบแล้ว");
      setAudioQueue([]); // ล้างคิวเพื่อหยุดการทำงาน
    }
  }, [audioQueue, currentAudioIndex]);

  // Component นี้ไม่จำเป็นต้อง render element ใดๆ ออกมา
  return null;
}
