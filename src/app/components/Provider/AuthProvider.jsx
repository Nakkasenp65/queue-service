"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// 1. สร้าง Context
const AuthContext = createContext(null);

// 2. สร้าง Provider Component
export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // State สำหรับบอกว่ากำลังโหลดข้อมูล

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setEmployee(data.employee); // เก็บข้อมูลพนักงานไว้ใน state
        } else {
          setEmployee(null);
        }
      } catch (error) {
        setEmployee(null);
      } finally {
        setIsLoading(false); // โหลดเสร็จแล้ว
      }
    };

    checkCurrentUser();
  }, []);

  const value = { employee, isEmployee: !!employee, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. สร้าง Custom Hook เพื่อให้เรียกใช้ง่าย
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
