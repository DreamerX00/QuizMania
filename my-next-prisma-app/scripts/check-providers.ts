// Script to check AI providers - must be run via tsx with proper env setup
import prisma from "../src/lib/prisma";

async function main() {
  const providers = await prisma.aIProvider.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      isActive: true,
      isRecommended: true,
    },
    orderBy: [{ isRecommended: "desc" }, { isActive: "desc" }],
  });

  console.log("Current AI Providers:");
  console.table(providers);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
