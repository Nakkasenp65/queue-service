import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use jsonwebtoken to verify token
    const jwtSecret = process.env.MAGIC_LINK_JWT_SECRET || process.env.MAGIC_LINK_SECRET || "secret-demo";
    const payload = jwt.verify(token, jwtSecret);

    if (!payload?.employee?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: payload.employee.id },
      include: { employeeTags: { include: { tag: true } } },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("GET /api/auth/profile error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jwtSecret = process.env.MAGIC_LINK_JWT_SECRET || process.env.MAGIC_LINK_SECRET || "secret-demo";
    const payload = jwt.verify(token, jwtSecret);

    if (!payload?.employee?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { fullname, phone, bio, profileImageUrl, abilityTags } = body;

    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id: payload.employee.id },
      data: {
        fullname,
        phone,
        bio,
        profileImageUrl,
        employeeTags: abilityTags
          ? {
              deleteMany: {}, // Remove existing tags
              create: abilityTags.map((tagName) => ({
                tag: { connectOrCreate: { where: { name: tagName }, create: { name: tagName } } },
              })),
            }
          : undefined,
      },
      include: { employeeTags: { include: { tag: true } } },
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("PUT /api/auth/profile error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
