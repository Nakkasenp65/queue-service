import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

/**
 * POST /api/auth/login - Login using central server API
 */
export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }, { status: 400 });
    }

    // Call central server login API
    const response = await fetch("https://adminregister.vercel.app/api?action=login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    // Handle different response status codes
    if (!response.ok) {
      if (response.status === 400) {
        return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 400 });
      } else if (response.status === 500) {
        return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบเซิร์ฟเวอร์กลาง" }, { status: 500 });
      } else {
        return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }, { status: 500 });
      }
    }

    // Success response - sync with local database
    if (data.message === "Login successful." && data.data) {
      const centralData = data.data;

      // Find or create employee in local database
      let employee = await prisma.employee.findFirst({
        where: {
          OR: [{ centralServerId: centralData.adminId }, { centralUsername: centralData.username }],
        },
      });

      if (!employee) {
        // Create new employee from central server data
        employee = await prisma.employee.create({
          data: {
            centralServerId: centralData.adminId,
            centralUsername: centralData.username,
            fullname: centralData.fullName || centralData.username,
            email: centralData.email || `${centralData.username}@company.com`, // Fallback email
            staffId: centralData.staffId,
            role: centralData.roles?.includes("admin") ? "ADMIN" : "STAFF",
            centralRoles: centralData.roles,
            firstLogin: true,
            isActive: true,
            password: "", // No local password needed
          },
        });

        console.log("✅ New employee created from central server:", employee.id);
      } else {
        // Update existing employee data if needed
        if (employee.firstLogin) {
          employee = await prisma.employee.update({
            where: { id: employee.id },
            data: {
              centralRoles: centralData.roles,
              staffId: centralData.staffId,
              fullname: centralData.fullName || employee.fullname,
            },
          });
        }
      }

      // Create JWT using LOCAL employee ID (not central server ID)
      const jwtSecret = process.env.MAGIC_LINK_JWT_SECRET || process.env.MAGIC_LINK_SECRET || "secret-demo";
      const jwtToken = jwt.sign(
        {
          employee: {
            id: employee.id, // Use LOCAL employee ID
            email: employee.email,
            fullname: employee.fullname,
            role: employee.role,
            staffId: employee.staffId,
            firstLogin: employee.firstLogin,
          },
          centralServer: {
            adminId: centralData.adminId,
            username: centralData.username,
            roles: centralData.roles,
          },
        },
        jwtSecret,
        { expiresIn: "60d" }
      );

      // Set HTTP-only cookie with the JWT token
      const loginResponse = NextResponse.json({
        message: "เข้าสู่ระบบสำเร็จ",
        employeeId: employee.id,
        firstLogin: employee.firstLogin,
        redirectTo: employee.firstLogin ? "/queueManagement/profile" : "/queueManagement/admin",
      });

      loginResponse.cookies.set("auth_token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 60, // 60 days
        path: "/",
      });

      return loginResponse;
    } else {
      return NextResponse.json({ error: "รูปแบบการตอบกลับไม่ถูกต้อง" }, { status: 500 });
    }
  } catch (error) {
    console.error("POST /api/auth/login error", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }, { status: 500 });
  }
}
