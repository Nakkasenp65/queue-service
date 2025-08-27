import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @description GET specific person's appointments using their ID
 * @route GET /api/appointments/my-appointment
 * @example GET /api/appointments/my-appointment?lineUserId=12345
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lineUserId = searchParams.get("lineUserId");

    if (!lineUserId) {
      return NextResponse.json({ error: "lineUserId is required" }, { status: 400 });
    }

    // Find the customer by lineUserId
    const customer = await prisma.customer.findUnique({
      where: { line_user_id: lineUserId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Fetch appointments for the customer
    const appointments = await prisma.appointment.findMany({
      where: { customerId: customer.id },
      include: {
        employee: true,
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error("Error fetching appointments for user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lineUserId = searchParams.get("lineUserId");

    if (!lineUserId) {
      return NextResponse.json({ error: "lineUserId is required" }, { status: 400 });
    }

    // Find customer
    const customer = await prisma.customer.findUnique({ where: { line_user_id: lineUserId } });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Delete appointment(s) for the customer. customerId is unique per schema, but use deleteMany for safety.
    const deleted = await prisma.appointment.deleteMany({ where: { customerId: customer.id } });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "No appointment found for this user" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Appointment deleted", data: deleted });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
