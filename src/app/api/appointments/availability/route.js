// src/app/api/appointments/availability/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @description GET all future appointment times for calendar display
 * @route GET /api/appointments/availability
 */
export async function GET(request) {
  try {
    const now = new Date();

    // Query upcoming appointments using Prisma's `date` field
    const appointments = await prisma.appointment.findMany({
      where: { date: { gte: now } },
      select: { date: true, type: true },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
