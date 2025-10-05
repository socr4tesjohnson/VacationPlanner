import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const inquiries = await prisma.contactInquiry.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    console.log('Total inquiries:', inquiries.length);
    if (inquiries.length > 0) {
      console.log('\nFirst inquiry ID:', inquiries[0].id);
      console.log('Status:', inquiries[0].status);
      console.log('Name:', inquiries[0].name);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
