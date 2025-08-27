import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

// ฟังก์ชันสำหรับสร้าง HMAC signature ด้วย SHA-256
function signHmac(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// ฟังก์ชันสำหรับเข้ารหัสข้อมูลเป็น base64 URL-safe
function base64UrlEncode(str) {
  return Buffer.from(str).toString("base64url");
}

// ฟังก์ชันสำหรับสร้าง JWT token ด้วย HMAC-SHA256
function createJwt(payloadObj, secret, expiresInSeconds = 60 * 60) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + expiresInSeconds, ...payloadObj };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = signHmac(`${headerB64}.${payloadB64}`, secret);
  const sigB64 = base64UrlEncode(signature);
  return `${headerB64}.${payloadB64}.${sigB64}`;
}

// จัดการการเข้าสู่ระบบด้วยอีเมลและรหัสผ่านจากเซิร์ฟเวอร์กลาง
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // ตรวจสอบข้อมูลรับรองกับเซิร์ฟเวอร์กลาง
    // แทนที่ด้วย endpoint จริงของคุณ (เช่น POST ไปยัง https://central-server.com/verify)
    const centralResponse = await fetch("https://central-server.com/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!centralResponse.ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const centralData = await centralResponse.json();
    // สมมติว่า centralData รวม employeeId หรืออีเมลสำหรับการค้นหา

    // ดึงข้อมูลพนักงานจากฐานข้อมูลท้องถิ่นโดยใช้ข้อมูลจากเซิร์ฟเวอร์กลาง
    const employee = await prisma.employee.findUnique({ where: { email } });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // สร้าง JWT token
    const jwtSecret = process.env.MAGIC_LINK_JWT_SECRET || process.env.MAGIC_LINK_SECRET || "secret-demo";
    const jwt = createJwt(
      { employee: { id: employee.id, email: employee.email, fullname: employee.fullname, role: employee.role } },
      jwtSecret,
      60 * 60 * 24 * 60 // 60 วัน
    );

    return NextResponse.json({ ok: true, jwt, employeeId: employee.id });
  } catch (error) {
    console.error("POST /api/auth/login error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
