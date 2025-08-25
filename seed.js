const { PrismaClient } = require("./src/generated/client");
const prisma = new PrismaClient();

async function seed() {
  try {
    // Create employees if they don't exist
    const existingEmployee = await prisma.employee.findFirst();
    if (!existingEmployee) {
      await prisma.employee.createMany({
        data: [
          {
            code: "EMP001",
            name: "พนักงาน 1",
            perHourCapacity: 2,
            isActive: true,
          },
          {
            code: "EMP002",
            name: "พนักงาน 2",
            perHourCapacity: 1,
            isActive: true,
          },
        ],
      });
      console.log("Created employees");
    } else {
      console.log("Employees already exist");
    }
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
