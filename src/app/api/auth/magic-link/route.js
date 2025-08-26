import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

function signToken(token, employeeId) {
  const secret = process.env.MAGIC_LINK_SECRET || "";
  return crypto
    .createHmac("sha256", secret)
    .update(token + "|" + employeeId)
    .digest("hex");
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    // find or create a lightweight employee placeholder (so verify can return JWT)
    let employee = await prisma.employee.findUnique({ where: { email } });
    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          email,
          fullname: null,
        },
      });
      console.log("Created placeholder employee for magic link", email);
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

    const magic = await prisma.magicLink.create({
      data: {
        token,
        employeeId: employee.id,
        expiresAt,
      },
    });

    // Create a signature so the link can't be trivially forged without secret
    const sig = signToken(token, employee.id);
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const link = `${base}/queueManagement/auth/verify?token=${token}&sig=${sig}`;

    // Try to send email using nodemailer if SMTP env is present
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const { createTransport } = await import("nodemailer");
        const transporter = createTransport({
          host: smtpHost,
          port: smtpPort || 587,
          secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const fromAddress = process.env.SMTP_FROM || `no-reply@${new URL(base).hostname}`;
        const to = employee.email;
        const subject = "Magic link สำหรับเข้าระบบผู้ดูแล";
        const text = `สวัสดี ${
          employee.fullname || "พนักงาน"
        },\n\nคลิกที่ลิงก์ด้านล่างเพื่อเข้าสู่ระบบ (ลิงก์ใช้ได้ 15 นาที):\n\n${link}\n\nถ้าคุณไม่ได้ร้องขอนี้ ให้เพิกเฉยอีเมลนี้.`;

        await transporter.sendMail({ from: fromAddress, to, subject, text });
        console.log("Magic link emailed to", to);
      } catch (err) {
        console.error("Failed to send magic link email via nodemailer:", err);
        console.log("Fallback - magic link:", link);
      }
    } else {
      // No SMTP configured — log the link for dev
      console.log("Magic link (no SMTP configured):", link);
    }

    return NextResponse.json({ ok: true, message: "magic link created" });
  } catch (error) {
    console.error("POST /api/auth/magic-link", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
