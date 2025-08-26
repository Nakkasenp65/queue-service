import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @description Get all employees (mocked with tag)
 * @route GET /api/employees
 */
export async function GET(request) {
  // This would be the real Prisma query:
  // const employees = await prisma.employee.findMany({
  //   include: {
  //     employeeTags: { include: { tag: true } },
  //   },
  // });

  // Mocked response with tag
  const mockEmployees = [
    {
      id: "1",
      code: "EMP001",
      name: "John Doe",
      perHourCapacity: 2,
      isActive: true,
      tags: [{ name: "ENGINEER" }, { name: "GENERAL" }],
    },
    {
      id: "2",
      code: "EMP002",
      name: "Jane Smith",
      perHourCapacity: 1,
      isActive: true,
      tags: [{ name: "REFINANCE" }],
    },
  ];

  return NextResponse.json(mockEmployees);
}
