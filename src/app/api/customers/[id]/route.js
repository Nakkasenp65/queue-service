import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @description Get a specific customer by ID
 * @route GET /api/customers/[id]
 */
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const customer = await prisma.customer.findUnique({
      where: { line_user_id: id },
      include: {
        appointments: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found or not registered" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * @description Update a customer
 * @route PATCH /api/customers/[id]
 */
export async function PATCH(request, { params }) {
  try {
    const body = await request.json();

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!existingCustomer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        line_display_name: body.line_display_name,
        fullname: body.fullname,
        phone: body.phone,
        email: body.email,
        note: body.note,
      },
    });

    return NextResponse.json({ success: true, data: updatedCustomer });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * @description Delete a customer
 * @route DELETE /api/customers/[id]
 */
export async function DELETE(request, { params }) {
  try {
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!existingCustomer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Customer deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
