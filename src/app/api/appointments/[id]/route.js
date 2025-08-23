// src/app/api/appointments/[id]/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/appointment.model";

/**
 * @description VIEW a single appointment by ID
 * @route GET /api/appointments/:id
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: appointment });
  } catch (error) {
    console.error("API Error:", error);
    if (error.kind === "ObjectId") {
      return NextResponse.json({ success: false, message: "Invalid appointment ID format" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * @description EDIT an appointment by ID
 * @route PUT /api/appointments/:id
 */
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json();

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, body, {
      new: true, // Return the modified document rather than the original
      runValidators: true, // Re-run schema validators on update
    });

    if (!updatedAppointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedAppointment });
  } catch (error) {
    console.error("API Error:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ success: false, message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * @description DELETE an appointment by ID
 * @route DELETE /api/appointments/:id
 */
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const deletedAppointment = await Appointment.findByIdAndDelete(id);

    if (!deletedAppointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
    }

    // Return a success message with no content
    return NextResponse.json({ success: true, message: "Appointment deleted successfully", data: {} });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
