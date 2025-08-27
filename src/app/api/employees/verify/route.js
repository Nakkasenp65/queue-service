import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken"; // Add this import

/**
 * POST /api/employees/verify - verify email and activate employee account
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "กรุณากรอกโทเค็นการยืนยัน" }, { status: 400 });
    }

    // Find employee with matching verification token
    const employee = await prisma.employee.findFirst({
      where: {
        verificationToken: token,
        tokenExpiry: {
          gte: new Date(), // Token must not be expired
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว" }, { status: 400 });
    }

    // Activate the employee account
    const updatedEmployee = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        isActive: true,
        verificationToken: null, // Clear the token
        tokenExpiry: null, // Clear the expiry
      },
    });

    // Create JWT using jsonwebtoken library (consistent with profile route)
    const jwtSecret = process.env.MAGIC_LINK_JWT_SECRET || process.env.MAGIC_LINK_SECRET || "secret-demo";
    const jwtToken = jwt.sign(
      {
        employee: {
          id: updatedEmployee.id,
          email: updatedEmployee.email,
          fullname: updatedEmployee.fullname,
          role: updatedEmployee.role,
        },
      },
      jwtSecret,
      { expiresIn: "60d" } // 60 days
    );

    // Return success with JWT token for frontend to set cookie
    const response = NextResponse.json({
      message: "ยืนยันอีเมลสำเร็จ กำลังเปลี่ยนเส้นทางไปยังแดชบอร์ด...",
      employeeId: updatedEmployee.id,
      email: updatedEmployee.email,
      redirectTo: "/queueManagement/employees/myAppointment", // Updated redirect
      token: jwtToken,
    });

    // Set HTTP-only cookie with the JWT token
    response.cookies.set("auth_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("POST /api/employees/verify error", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการยืนยัน" }, { status: 500 });
  }
}
