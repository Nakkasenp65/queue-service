import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * GET /api/auth/check-role - Check if current user is an employee
 */
export async function GET(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ isEmployee: false });
    }

    const jwtSecret = process.env.MAGIC_LINK_JWT_SECRET || process.env.MAGIC_LINK_SECRET || "secret-demo";

    try {
      const payload = jwt.verify(token, jwtSecret);

      // Check if user has employee role (ADMIN or STAFF)
      const isEmployee = payload?.employee?.role && ["ADMIN", "STAFF"].includes(payload.employee.role);

      return NextResponse.json({
        isEmployee: !!isEmployee,
        role: payload?.employee?.role || null,
        fullName: payload?.employee?.fullname || null,
      });
    } catch (error) {
      // Token is invalid/expired
      return NextResponse.json({ isEmployee: false });
    }
  } catch (error) {
    console.error("GET /api/auth/check-role error", error);
    return NextResponse.json({ isEmployee: false });
  }
}
