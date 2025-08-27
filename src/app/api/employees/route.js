import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

/**
 * GET /api/employees - list employees
 */
export async function GET(request) {
  try {
    const employees = await prisma.employee.findMany({
      include: { employeeTags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("GET /api/employees error", error);
    return NextResponse.json({ error: "failed to fetch employees" }, { status: 500 });
  }
}

/**
 * POST /api/employees - create employee
 */
export async function POST(request) {
  try {
    const text = await request.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      console.error("Invalid JSON received:", parseError.message, "Raw body:", text);
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }
    console.log(body);
    const {
      fullname,
      email,
      password,
      phone,
      role = "STAFF",
      abilityTags = [],
      isActive = true,
      profileImageUrl,
      bio,
    } = body;

    // Basic validation
    if (!fullname || !email || !password) {
      return NextResponse.json({ error: "fullname, email and password are required" }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }

    // Uniqueness checks
    const existingEmail = await prisma.employee.findUnique({ where: { email } });
    if (existingEmail) return NextResponse.json({ error: "email already in use" }, { status: 409 });

    if (phone) {
      const existingPhone = await prisma.employee.findUnique({ where: { phone } });
      if (existingPhone) return NextResponse.json({ error: "phone already in use" }, { status: 409 });
    }

    const passwordHash = hashPassword(password);

    const employee = await prisma.employee.create({
      data: {
        fullname,
        email,
        password: passwordHash,
        phone,
        role,
        isActive,
        profileImageUrl,
        bio,
        employeeTags: {
          create: abilityTags.map((t) => ({ tag: { connectOrCreate: { where: { name: t }, create: { name: t } } } })),
        },
      },
      include: { employeeTags: { include: { tag: true } } },
    });

    const { password: _p, ...safeEmployee } = employee;
    return NextResponse.json(safeEmployee, { status: 201 });
  } catch (error) {
    console.error("POST /api/employees error", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
