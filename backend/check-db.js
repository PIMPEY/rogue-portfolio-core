const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.investment.count();
  console.log('Investments in database:', count);
  
  if (count > 0) {
    const investments = await prisma.investment.findMany({ take: 3 });
    console.log('Sample investments:', JSON.stringify(investments, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
