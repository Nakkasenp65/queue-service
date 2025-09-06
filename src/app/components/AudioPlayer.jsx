"use client";

import { useEffect, useState } from "react";

export default function AudioPlayer({ announcementText, trigger, channel }) {
  const [audioQueue, setAudioQueue] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Object ที่จับคู่ตัวอักษรกับไฟล์เสียง
  const audioMap = {
    notification: "/audio/notify-queue-2.wav",
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
  };

  // Effect 1: สร้างคิวเสียงเมื่อได้รับ 'announcement' ใหม่
  useEffect(() => {
    if (trigger === 0) {
      return;
    }

    if (!announcementText) {
      setAudioQueue([]);
      return;
    }

    const announcementParts = announcementText.split("-");
    if (announcementParts.length < 2) return; // ป้องกัน error ถ้า format ผิด

    const prefix = announcementParts[0]; // เช่น G
    const number = announcementParts[1]; // เช่น 1105

    let queue = [];
    queue.push(audioMap.notification);
    queue.push(audioMap.pleaseWelcome);

    // เพิ่มเสียงตัวอักษรนำหน้า
    for (const char of prefix) {
      if (audioMap[char.toUpperCase()]) {
        queue.push(audioMap[char.toUpperCase()]);
      }
    }

    // เพิ่มเสียงตัวเลข
    for (const char of number) {
      if (audioMap[char]) {
        queue.push(audioMap[char]);
      }
    }

    queue.push(audioMap.serviceCounter);
    queue.push(audioMap[String(channel)]);
    queue.push(audioMap.ka);

    setAudioQueue(queue);
    setCurrentAudioIndex(0); // รีเซ็ตลำดับการเล่นทุกครั้งที่มีคิวใหม่
    console.log("เล่นเสียง-------------------------------");
  }, [trigger]);

  // Effect 2: เริ่มเล่นเสียงอัตโนมัติเมื่อ 'audioQueue' พร้อม
  useEffect(() => {
    if (audioQueue.length > 0) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [audioQueue]);

  const playNextAudio = () => {
    if (currentAudioIndex < audioQueue.length - 1) {
      setCurrentAudioIndex((prevIndex) => prevIndex + 1);
    } else {
      setIsPlaying(false); // หยุดเล่นเมื่อหมดคิว
    }
  };

  // ไม่ต้องมีปุ่มใน Component นี้แล้ว
  // การเล่นจะถูกควบคุมจาก props ที่ส่งเข้ามา
  return (
    <>
      {isPlaying && audioQueue.length > 0 && (
        <audio
          key={currentAudioIndex}
          src={audioQueue[currentAudioIndex]}
          autoPlay
          onEnded={playNextAudio}
          onError={(e) =>
            console.error(
              `ไม่สามารถเล่นไฟล์เสียง: ${audioQueue[currentAudioIndex]}`,
              e,
            )
          }
        />
      )}
    </>
  );
}
