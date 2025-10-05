const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFields() {
  try {
    console.log('Testing database fields...\n');

    // Get the first inquiry
    const inquiry = await prisma.contactInquiry.findFirst({
      where: { id: '6c19d4f9-0683-4ac2-9e27-5c2b465e83c2' }
    });

    if (!inquiry) {
      console.log('Inquiry not found');
      return;
    }

    console.log('Current field values:');
    console.log('- notes:', inquiry.notes);
    console.log('- quotedAmount:', inquiry.quotedAmount);
    console.log('- commissionRate:', inquiry.commissionRate);
    console.log('- commissionAmount:', inquiry.commissionAmount);
    console.log('- checklist:', inquiry.checklist);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFields();
