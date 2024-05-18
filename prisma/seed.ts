import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    await seedUser();
  } catch (error) {
    console.error(error);
  }
}
const seedUser = async () => {
  for (let i = 0; i < 20; i++) {
    await prisma.user.create({
      data: {
        username: "username " + i,
        name: "name " + i,
        passwordHash: await bcrypt.hash("password", 10),
      },
    });
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
