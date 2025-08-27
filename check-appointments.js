const { PrismaClient } = require("./src/generated/client");
const prisma = new PrismaClient();

async function checkAppointments() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { customer: true },
      take: 5,
    });

    console.log("Found", appointments.length, "appointments");
    appointments.forEach((apt) => {
      console.log("---");
      console.log("ID:", apt.id.slice(-6));
      console.log("Tags:", apt.requiredTags);
      console.log("Customer:", apt.customer?.fullname);
      console.log("Status:", apt.status);
      console.log("Note:", apt.note);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkAppointments();
