import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    // ✅ Fixed: createTransport (not createTransporter)
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

// Send verification email
const sendVerificationEmail = async (to, verificationLink) => {
  const transporter = createTransporter();

  const subject = "ยืนยันการลงทะเบียนพนักงาน - OKMobile Queue Management";
  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ยืนยันการลงทะเบียน</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 16px;
          color: #6b7280;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          background-color: #2563eb;
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          text-align: center;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        .warning {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
          color: #92400e;
        }
        .link-text {
          word-break: break-all;
          color: #6b7280;
          font-size: 12px;
          margin-top: 10px;
        }
        #verification-link {
          color: #ffffff;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">OKMobile</div>
          <h1 class="title">ยืนยันการลงทะเบียนพนักงาน</h1>
          <p class="subtitle">ระบบจัดการคิวออนไลน์</p>
        </div>

        <div class="content">
          <p>สวัสดี,</p>
          <p>คุณได้ลงทะเบียนบัญชีพนักงานในระบบจัดการคิวของ OKMobile กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>

          <div style="text-align: center;">
            <a href="${verificationLink}" id="verification-link" class="button">ยืนยันอีเมล</a>
          </div>

          <div class="warning">
            <strong>⚠️ สำคัญ:</strong> ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง หากลิงก์ไม่ทำงาน กรุณาลงทะเบียนใหม่อีกครั้ง
          </div>

          <p>หากคุณไม่ได้ลงทะเบียนบัญชีนี้ กรุณาละเว้นอีเมลนี้</p>

          <div class="link-text">
            หรือคัดลอกลิงก์นี้ไปเปิดในเบราว์เซอร์:<br>
            <span style="color: #2563eb;">${verificationLink}</span>
          </div>
        </div>

        <div class="footer">
          <p>ระบบจัดการคิวออนไลน์ OKMobile<br>
          © 2025 OKMobile. สงวนลิขสิทธิ์</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ยืนยันการลงทะเบียนพนักงาน - OKMobile Queue Management

    สวัสดี,

    คุณได้ลงทะเบียนบัญชีพนักงานในระบบจัดการคิวของ OKMobile
    กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลของคุณ:

    ${verificationLink}

    ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง

    หากคุณไม่ได้ลงทะเบียนบัญชีนี้ กรุณาละเว้นอีเมลนี้

    ระบบจัดการคิวออนไลน์ OKMobile
  `;

  const info = await transporter.sendMail({
    from: `"OKMobile-Queue-Management" <${process.env.EMAIL_USERNAME}>`,
    replyTo: "no-reply@oknumberone.com",
    to,
    subject,
    text,
    html,
  });

  return info;
};

/**
 * POST /api/employees/register - initiate employee registration with email verification
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Basic validation
    if (!email) {
      return NextResponse.json({ error: "กรุณากรอกอีเมล" }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "กรุณากรอกอีเมลที่ถูกต้อง" }, { status: 400 });
    }

    // Check if email already exists
    const existingEmployee = await prisma.employee.findUnique({ where: { email } });
    if (existingEmployee) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 409 });
    }

    // Generate verification token
    const verificationToken = await crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create pending employee record
    const pendingEmployee = await prisma.employee.create({
      data: {
        email,
        fullname: "", // Empty for now, will be filled later
        password: "", // Empty for now, will be set later
        role: "STAFF",
        isActive: false, // Not active until verified
        verificationToken: verificationToken,
        tokenExpiry,
      },
    });

    // TODO: Send verification email
    // For now, we'll just return success and log the verification link
    const verificationLink = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/queueManagement/auth/verify?token=${verificationToken}`;

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationLink);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails, just log it
      // In production, you might want to implement a retry mechanism or queue
    }

    return NextResponse.json({
      message: "กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันการลงทะเบียน",
      // For development/testing, you might want to include the link in the response
      // verificationLink: process.env.NODE_ENV === 'development' ? verificationLink : undefined
    });
  } catch (error) {
    console.error("POST /api/employees/register error", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการส่งอีเมล" }, { status: 500 });
  }
}
