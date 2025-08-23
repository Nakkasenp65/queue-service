// src/app/api/appointments/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/appointment.model";
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
    // 1. Authenticate the user via LIFF ID Token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Authorization header missing or invalid" }, { status: 401 });
    }
    const idToken = authHeader.split(" ")[1];
    const lineProfile = await verifyLineToken(idToken);

    if (!lineProfile) {
      return NextResponse.json({ success: false, message: "Invalid or expired LINE token" }, { status: 403 });
    }

    // 2. Connect to the database
    await dbConnect();

    // 3. Get the request body
    const body = await request.json();

    // 4. Create the new appointment with verified LINE data
    const newAppointment = await Appointment.create({
      ...body,
      lineUserId: lineProfile.sub,
      lineDisplayName: lineProfile.name,
      lineProfilePicUrl: lineProfile.picture,
    });

    return NextResponse.json({ success: true, data: newAppointment }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    // Handle potential validation errors from Mongoose
    if (error.name === "ValidationError") {
      return NextResponse.json({ success: false, message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * @description VIEW all appointments
 * @route GET /api/appointments
 */
export async function GET(request) {
  try {
    await dbConnect();

    // Find all appointments and sort by the newest appointment date first
    const appointments = await Appointment.find({}).sort({ appointmentAt: -1 });

    return NextResponse.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
