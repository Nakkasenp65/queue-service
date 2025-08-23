// src/app/api/appointments/availability/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/appointment.model";

/**
 * @description GET all future appointment times for calendar display
 * @route GET /api/appointments/availability
 */
export async function GET(request) {
  try {
    await dbConnect();

    const now = new Date();

    // ดึงข้อมูลเฉพาะคิวที่ยังไม่เกิดขึ้น และเลือกเฉพาะ field ที่จำเป็น
    const appointments = await Appointment.find(
      { appointmentAt: { $gte: now } },
      "appointmentAt appointmentType" // Select only these two fields
    ).lean(); // .lean() for faster query, returns plain JS objects

    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
