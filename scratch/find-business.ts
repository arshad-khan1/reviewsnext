import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const business = await prisma.business.findFirst({
    where: { isDeleted: false },
    select: { slug: true }
  })
  console.log(JSON.stringify(business))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
