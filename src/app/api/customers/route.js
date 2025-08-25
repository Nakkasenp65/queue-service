import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @description Create a new customer
 * @route POST /api/customers
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.line_user_id) {
      return NextResponse.json({ error: "LINE User ID is required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.customer.findUnique({
      where: { line_user_id: body.line_user_id },
    });

    if (existingUser) {
      // Instead of returning an error, update the existing user
      const updatedCustomer = await prisma.customer.update({
        where: { line_user_id: body.line_user_id },
        data: {
          line_display_name: body.line_display_name,
          fullname: body.fullname,
          phone: body.phone,
          email: body.email,
          note: body.note,
        },
      });
      return NextResponse.json(updatedCustomer);
    }

    // Create new customer
    const newCustomer = await prisma.customer.create({
      data: {
        line_user_id: body.line_user_id,
        line_display_name: body.line_display_name,
        fullname: body.fullname,
        phone: body.phone,
        email: body.email,
        note: body.note,
      },
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * @description Get all customers or filter by query params
 * @route GET /api/customers
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lineUserId = searchParams.get("line_user_id");
    const phone = searchParams.get("phone");

    let whereClause = {};

    // Add filters if provided
    if (lineUserId) {
      whereClause.line_user_id = lineUserId;
    }
    if (phone) {
      whereClause.phone = phone;
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        appointments: {
          orderBy: {
            date: "desc",
          },
          take: 5, // Get only the 5 most recent appointments
        },
      },
    });

    // If we're looking for a specific user by line_user_id, return the first match
    if (lineUserId && customers.length > 0) {
      return NextResponse.json(customers[0]);
    }

    // Otherwise return the full list
    return NextResponse.json(customers);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
