import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { eachDayOfInterval, format, startOfDay, endOfDay, addDays } from "date-fns";

/**
 * @description CREATE a new appointment
 * @route POST /api/appointments
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      lineUserId,
      lineDisplayName,
      lineProfilePicUrl,
      appointmentAt,
      serviceType,
      appointmentType,
      note,
    } = body;

    console.log("Received appointment request:", body);

    if (!lineUserId || !appointmentAt) {
      return NextResponse.json({ error: "lineUserId and appointmentAt are required" }, { status: 400 });
    }

    // First, find or create the customer
    let customer = await prisma.customer.findUnique({
      where: { line_user_id: lineUserId },
    });

    if (!customer) {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          line_user_id: lineUserId,
          line_display_name: lineDisplayName,
          fullname: customerName,
          phone: customerPhone,
        },
      });
      console.log("Created new customer:", customer);
    } else {
      // Update existing customer with latest info
      customer = await prisma.customer.update({
        where: { line_user_id: lineUserId },
        data: {
          line_display_name: lineDisplayName,
          fullname: customerName,
          phone: customerPhone,
        },
      });
      console.log("Updated existing customer:", customer);
    }

    // Map appointment types to enum values
    let mappedType = "ONSITE";
    if (appointmentType === "offsite" || appointmentType === "off-store") {
      mappedType = "OFFSITE";
    } else if (appointmentType === "online") {
      mappedType = "ONLINE";
    }

    // For now, do not assign employee at creation (employeeId: null)
    // Compute 'day' and 'section' fields required by Prisma schema from appointmentAt
    const appointmentDate = new Date(appointmentAt);
    const day = format(appointmentDate, "yyyy-MM-dd");
    const section = String(appointmentDate.getHours());

    // You can add logic here to assign employee for specific types if needed
    const appointment = await prisma.appointment.create({
      data: {
        customerId: customer.id,
        employeeId: null,
        date: appointmentDate,
        day,
        section,
        type: mappedType,
        status: "PENDING",
        note: note || `Service: ${serviceType}`,
      },
      include: {
        customer: true,
        employee: true,
      },
    });

    console.log("Created appointment:", appointment);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Failed to create appointment", details: error.message }, { status: 500 });
  }
}

/**
 * @description VIEW all appointments
 * @route GET /api/appointments
 */
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const customerId = searchParams.get("customerId");
//     const lineUserId = searchParams.get("lineUserId");
//     const startAt = searchParams.get("startAt");
//     const endAt = searchParams.get("endAt");
//     const query = searchParams.get("query");

//     const whereClause = {};

//     // customer filter: allow direct customerId or lookup by lineUserId
//     if (customerId) {
//       whereClause.customerId = customerId;
//     } else if (lineUserId) {
//       const customer = await prisma.customer.findUnique({ where: { line_user_id: lineUserId }, select: { id: true } });
//       if (!customer) return NextResponse.json([]);
//       whereClause.customerId = customer.id;
//     }

//     // date range filter
//     if (startAt || endAt) {
//       whereClause.date = {};
//       if (startAt) {
//         const s = new Date(startAt);
//         if (!isNaN(s)) whereClause.date.gte = s;
//       }
//       if (endAt) {
//         const e = new Date(endAt);
//         if (!isNaN(e)) whereClause.date.lte = e;
//       }
//     }

//     // text query: search in note or customer.fullname
//     if (query) {
//       whereClause.OR = [
//         { note: { contains: query, mode: "insensitive" } },
//         { customer: { fullname: { contains: query, mode: "insensitive" } } },
//       ];
//     }

//     const appointments = await prisma.appointment.findMany({
//       where: whereClause,
//       include: {
//         customer: true,
//         employee: true,
//       },
//       orderBy: { date: "desc" },
//     });

//     return NextResponse.json(appointments);
//   } catch (error) {
//     console.error("Error fetching appointments:", error);
//     return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
//   }
// }
const HOURS = Array.from({ length: 9 }, (_, i) => 11 + i);
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const startAtParam = searchParams.get("startAt");
    const endAtParam = searchParams.get("endAt");

    const startDate = startAtParam ? new Date(startAtParam) : new Date();
    const endDate = endAtParam ? new Date(endAtParam) : addDays(new Date(), 6);

    const dateRange = eachDayOfInterval({
      start: startOfDay(startDate),
      end: endOfDay(endDate),
    });

    // Create a map for quick lookup: 'YYYY-MM-DD' -> dayIndex (0, 1, 2...)
    const dateToIndexMap = new Map(dateRange.map((date, index) => [format(date, "yyyy-MM-dd"), index]));

    // --- The rest of the filtering logic remains the same ---
    const lineUserId = searchParams.get("lineUserId");
    const query = searchParams.get("query");
    const whereClause = {};

    if (lineUserId) {
      const customer = await prisma.customer.findUnique({ where: { line_user_id: lineUserId } });
      if (!customer) return NextResponse.json(Array(dateRange.length).fill(Array(HOURS.length).fill([]))); // Return empty grid
      whereClause.customerId = customer.id;
    }

    whereClause.date = {
      gte: startOfDay(startDate),
      lte: endOfDay(endDate),
    };

    if (query) {
      whereClause.OR = [
        { note: { contains: query, mode: "insensitive" } },
        { customer: { fullname: { contains: query, mode: "insensitive" } } },
      ];
    }

    // 2. ดึงข้อมูลนัดหมายทั้งหมดในช่วงวันที่ที่กำหนด (ยังเป็น Flat List)
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        customer: true,
        employee: true,
      },
      orderBy: { date: "asc" }, // Order by date ascending for easier processing
    });

    // 3. สร้างตารางว่าง (Empty Grid) 2 มิติ
    const dailyAppointments = Array.from({ length: dateRange.length }, () =>
      Array.from({ length: HOURS.length }, () => [])
    );

    // 4. นำข้อมูลจาก Flat List มาใส่ในตาราง 2 มิติ
    for (const appointment of appointments) {
      const appDate = new Date(appointment.date);
      const dateKey = format(appDate, "yyyy-MM-dd");
      const hour = appDate.getHours();

      const dayIndex = dateToIndexMap.get(dateKey);
      const sectionIndex = hour - HOURS[0]; // Calculate section (e.g., 11:00 -> 0, 12:00 -> 1)

      // Ensure the appointment falls within our defined days and sections
      if (dayIndex !== undefined && sectionIndex >= 0 && sectionIndex < HOURS.length) {
        dailyAppointments[dayIndex][sectionIndex].push(appointment);
      }
    }

    return NextResponse.json(dailyAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

/**
 * @description Check availability for a given date and time
 * @route GET /api/appointments/availability
 */
export async function CHECK_AVAILABILITY(request) {
  try {
    const { date, type } = await request.json();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all appointments for the specified day
    const appointments = await prisma.appointment.findMany({
      where: {
        startDateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Count appointments by type and time slot
    const slots = {};
    appointments.forEach((apt) => {
      const hour = apt.startDateTime.getHours();
      slots[hour] = slots[hour] || { onsite: 0, online: 0, offsite: 0 };
      slots[hour][apt.type] += 1;

      // For online appointments, block the next hour too
      if (apt.type === "online" && hour < 23) {
        slots[hour + 1] = slots[hour + 1] || { onsite: 0, online: 0, offsite: 0 };
        slots[hour + 1].online += 1;
      }
    });

    return NextResponse.json({ success: true, data: slots });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
