// src/app/api/appointments/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import axios from "axios";

// Helper function to verify the LINE ID Token (for security)
async function verifyLineToken(token) {
  const params = new URLSearchParams();
  params.append("id_token", token);
  params.append("client_id", process.env.LINE_CHANNEL_ID);

  try {
    const response = await axios.post("https://api.line.me/oauth2/v2.1/verify", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data; // Returns { sub: 'userId', name: '...', picture: '...' }
  } catch (error) {
    console.error("Token verification failed:", error.response?.data);
    return null;
  }
}

/**
 * @description CREATE a new appointment
 * @route POST /api/appointments
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      lineUserId,
      lineDisplayName,
      lineProfilePicUrl,
      appointmentAt,
      serviceType,
      appointmentType,
      note,
    } = body;

    console.log("Received appointment request:", body);

    if (!lineUserId || !appointmentAt) {
      return NextResponse.json({ error: "lineUserId and appointmentAt are required" }, { status: 400 });
    }

    // First, find or create the customer
    let customer = await prisma.customer.findUnique({
      where: { line_user_id: lineUserId },
    });

    if (!customer) {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          line_user_id: lineUserId,
          line_display_name: lineDisplayName,
          fullname: customerName,
          phone: customerPhone,
        },
      });
      console.log("Created new customer:", customer);
    } else {
      // Update existing customer with latest info
      customer = await prisma.customer.update({
        where: { line_user_id: lineUserId },
        data: {
          line_display_name: lineDisplayName,
          fullname: customerName,
          phone: customerPhone,
        },
      });
      console.log("Updated existing customer:", customer);
    }

    // Map appointment types to enum values
    let mappedType = "ONSITE";
    if (appointmentType === "offsite" || appointmentType === "off-store") {
      mappedType = "OFFSITE";
    } else if (appointmentType === "online") {
      mappedType = "ONLINE";
    }

    // For now, do not assign employee at creation (employeeId: null)
    // You can add logic here to assign employee for specific types if needed
    const appointment = await prisma.appointment.create({
      data: {
        customerId: customer.id,
        employeeId: null,
        date: new Date(appointmentAt),
        type: mappedType,
        status: "PENDING",
        note: note || `Service: ${serviceType}`,
      },
      include: {
        customer: true,
        employee: true,
      },
    });

    console.log("Created appointment:", appointment);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Failed to create appointment", details: error.message }, { status: 500 });
  }
}

/**
 * @description VIEW all appointments
 * @route GET /api/appointments
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const lineUserId = searchParams.get("lineUserId");

    let whereClause = {};

    if (customerId) {
      whereClause.customerId = customerId;
    } else if (lineUserId) {
      // Find customer by LINE user ID first
      const customer = await prisma.customer.findUnique({
        where: { line_user_id: lineUserId },
      });

      if (customer) {
        whereClause.customerId = customer.id;
      } else {
        // No customer found, return empty array
        return NextResponse.json([]);
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        customer: true,
        employee: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

/**
 * @description Check availability for a given date and time
 * @route GET /api/appointments/availability
 */
export async function CHECK_AVAILABILITY(request) {
  try {
    const { date, type } = await request.json();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all appointments for the specified day
    const appointments = await prisma.appointment.findMany({
      where: {
        startDateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Count appointments by type and time slot
    const slots = {};
    appointments.forEach((apt) => {
      const hour = apt.startDateTime.getHours();
      slots[hour] = slots[hour] || { onsite: 0, online: 0, offsite: 0 };
      slots[hour][apt.type] += 1;

      // For online appointments, block the next hour too
      if (apt.type === "online" && hour < 23) {
        slots[hour + 1] = slots[hour + 1] || { onsite: 0, online: 0, offsite: 0 };
        slots[hour + 1].online += 1;
      }
    });

    return NextResponse.json({ success: true, data: slots });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
