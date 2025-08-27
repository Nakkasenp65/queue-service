import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

/**
 * @description GET appointments matching an employee's ability tags
 * @route GET /api/employees/appointments
 * @example
 *   GET /api/employees/appointments?employeeId=123&startAt=2023-01-01&endAt=2023-01-31&status=CONFIRMED
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let employeeId = searchParams.get("employeeId");

    // If no employeeId provided, get from JWT token
    if (!employeeId || employeeId === "current") {
      const token = request.cookies.get("auth_token")?.value;
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const jwtSecret = process.env.MAGIC_LINK_JWT_SECRET || process.env.MAGIC_LINK_SECRET || "secret-demo";
      const payload = jwt.verify(token, jwtSecret);

      console.log("payload", payload);

      if (!payload?.employee?.id) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      employeeId = payload.employee.id;

      // Get employee tags from centralServer.roles in JWT
      const centralRoles = payload.centralServer?.roles || [];
      console.log("Central roles:", centralRoles);

      // Map central server roles to our internal tag system
      const getTagsFromRoles = (roles) => {
        const tagMap = [];
        roles.forEach((role) => {
          switch (role.toLowerCase()) {
            case "engineer":
              tagMap.push("ENGINEER");
              break;
            case "refinance":
              tagMap.push("REFINANCE");
              break;
            case "admin":
              // Admin can see all appointments
              tagMap.push("ENGINEER", "REFINANCE", "GENERAL");
              break;
            default:
              // For other roles, add GENERAL
              if (!tagMap.includes("GENERAL")) {
                tagMap.push("GENERAL");
              }
          }
        });
        return [...new Set(tagMap)]; // Remove duplicates
      };

      const employeeTagNames = getTagsFromRoles(centralRoles);
      console.log("Mapped employee tags:", employeeTagNames);

      // Build where clause using tags from JWT
      const whereClause = {
        requiredTags: {
          hasSome: employeeTagNames, // Match appointments with at least one overlapping tag
        },
      };

      // Optional date range filter
      const startAt = searchParams.get("startAt");
      const endAt = searchParams.get("endAt");
      if (startAt || endAt) {
        whereClause.date = {};
        if (startAt) {
          const s = new Date(startAt);
          if (!isNaN(s)) whereClause.date.gte = s;
        }
        if (endAt) {
          const e = new Date(endAt);
          if (!isNaN(e)) whereClause.date.lte = e;
        }
      }

      // Optional status filter
      const status = searchParams.get("status");
      if (status) {
        whereClause.status = status;
      }

      console.log("Where clause for appointments:", JSON.stringify(whereClause, null, 2));

      // Fetch matching appointments
      const appointments = await prisma.appointment.findMany({
        where: whereClause,
        include: {
          customer: true,
          employee: true,
        },
        orderBy: { date: "asc" },
      });

      console.log(`Found ${appointments.length} matching appointments for employee`);
      return NextResponse.json(appointments);
    }

    // Fallback: If explicit employeeId provided, fetch from database
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        employeeTags: {
          include: { tag: true },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Use database tags if available, otherwise fall back to centralRoles
    let employeeTagNames = [];
    if (employee.employeeTags && employee.employeeTags.length > 0) {
      employeeTagNames = employee.employeeTags.map((et) => et.tag.name);
    } else if (employee.centralRoles) {
      // Use central roles as fallback
      const centralRoles = Array.isArray(employee.centralRoles) ? employee.centralRoles : [];
      const getTagsFromRoles = (roles) => {
        const tagMap = [];
        roles.forEach((role) => {
          switch (role.toLowerCase()) {
            case "engineer":
              tagMap.push("ENGINEER");
              break;
            case "refinance":
              tagMap.push("REFINANCE");
              break;
            case "admin":
              tagMap.push("ENGINEER", "REFINANCE", "GENERAL");
              break;
            default:
              if (!tagMap.includes("GENERAL")) {
                tagMap.push("GENERAL");
              }
          }
        });
        return [...new Set(tagMap)];
      };
      employeeTagNames = getTagsFromRoles(centralRoles);
    } else {
      // If no tags available, default to GENERAL
      employeeTagNames = ["GENERAL"];
    }

    console.log("Employee tags for explicit ID:", employeeTagNames);

    // Build where clause
    const whereClause = {
      requiredTags: {
        hasSome: employeeTagNames,
      },
    };

    // Optional date range filter
    const startAt = searchParams.get("startAt");
    const endAt = searchParams.get("endAt");
    if (startAt || endAt) {
      whereClause.date = {};
      if (startAt) {
        const s = new Date(startAt);
        if (!isNaN(s)) whereClause.date.gte = s;
      }
      if (endAt) {
        const e = new Date(endAt);
        if (!isNaN(e)) whereClause.date.lte = e;
      }
    }

    // Optional status filter
    const status = searchParams.get("status");
    if (status) {
      whereClause.status = status;
    }

    console.log("Where clause:", JSON.stringify(whereClause, null, 2));

    // Fetch matching appointments
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        customer: true,
        employee: true,
      },
      orderBy: { date: "asc" },
    });

    console.log(`Found ${appointments.length} appointments for employee ID: ${employeeId}`);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("GET /api/employees/appointments error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
