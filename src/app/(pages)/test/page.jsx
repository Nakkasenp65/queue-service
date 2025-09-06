"use client";
import React, { useState, useEffect } from "react";
import AudioPlayer from "../../components/AudioPlayer";

const HomePage = () => {
  // State สำหรับเก็บค่าในช่อง input
  const [inputValue, setInputValue] = useState("G-1105");
  const [playTrigger, setPlayTrigger] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  // ฟังก์ชันที่จะทำงานเมื่อกดปุ่ม "ประกาศเสียง"
  const handleAnnounceClick = () => {
    // ตั้งค่า announcement เพื่อส่ง props ไปให้ AudioPlayer และกระตุ้นให้มันทำงาน
    setPlayTrigger((currentTrigger) => currentTrigger + 1);
  };

  // ฟังก์ชันสำหรับจัดการการกด Enter ในช่อง input
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAnnounceClick();
    }
  };

  return (
    <div className="flex h-dvh w-full flex-col justify-center gap-2 px-6 py-24">
      <h1>ระบบประกาศเรียกคิว</h1>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="เช่น G-1105"
          className="flex rounded-lg border border-stone-400 px-2"
        />
        <button
          onClick={handleAnnounceClick}
          className="rounded-lg bg-black p-2 text-white"
        >
          ประกาศเสียง
        </button>
      </div>

      {/* 
        AudioPlayer จะรอรับค่า 'announcement'
        และจะเริ่มทำงานเมื่อค่านี้มีการเปลี่ยนแปลง 
      */}
      <AudioPlayer
        announcementText={"R-1402"}
        trigger={playTrigger}
        channel={5}
      />
    </div>
  );
};

export default HomePage;
