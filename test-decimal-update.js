const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing direct Prisma updates with Decimal types...\n');

    // Test 1: Update notes (string)
    console.log('Test 1: Updating notes (string)...');
    const test1 = await prisma.contactInquiry.update({
      where: { id: '6c19d4f9-0683-4ac2-9e27-5c2b465e83c2' },
      data: { notes: 'Test note from script' }
    });
    console.log('Success! Notes:', test1.notes);
    console.log('');

    // Test 2: Update quotedAmount (Decimal)
    console.log('Test 2: Updating quotedAmount (Decimal)...');
    const test2 = await prisma.contactInquiry.update({
      where: { id: '6c19d4f9-0683-4ac2-9e27-5c2b465e83c2' },
      data: { quotedAmount: new Prisma.Decimal(12500.50) }
    });
    console.log('Success! QuotedAmount:', test2.quotedAmount?.toString());
    console.log('');

    // Test 3: Update quotedAmount (number - let Prisma convert)
    console.log('Test 3: Updating quotedAmount (plain number)...');
    const test3 = await prisma.contactInquiry.update({
      where: { id: '6c19d4f9-0683-4ac2-9e27-5c2b465e83c2' },
      data: { quotedAmount: 13000.75 }
    });
    console.log('Success! QuotedAmount:', test3.quotedAmount?.toString());
    console.log('');

    // Test 4: Update commissionRate
    console.log('Test 4: Updating commissionRate...');
    const test4 = await prisma.contactInquiry.update({
      where: { id: '6c19d4f9-0683-4ac2-9e27-5c2b465e83c2' },
      data: { commissionRate: 15 }
    });
    console.log('Success! CommissionRate:', test4.commissionRate?.toString());
    console.log('');

    // Test 5: Update commissionAmount
    console.log('Test 5: Updating commissionAmount...');
    const test5 = await prisma.contactInquiry.update({
      where: { id: '6c19d4f9-0683-4ac2-9e27-5c2b465e83c2' },
      data: { commissionAmount: 1950.1125 }
    });
    console.log('Success! CommissionAmount:', test5.commissionAmount?.toString());
    console.log('');

    // Test 6: Update checklist (JSON string)
    console.log('Test 6: Updating checklist (JSON string)...');
    const checklistData = JSON.stringify([
      { id: '1', text: 'Travel insurance discussed', completed: true },
      { id: '2', text: 'Dining plan preferences', completed: false }
    ]);
    const test6 = await prisma.contactInquiry.update({
      where: { id: '6c19d4f9-0683-4ac2-9e27-5c2b465e83c2' },
      data: { checklist: checklistData }
    });
    console.log('Success! Checklist:', test6.checklist?.substring(0, 50) + '...');
    console.log('');

    // Verify all updates persisted
    console.log('=== FINAL VERIFICATION ===');
    const final = await prisma.contactInquiry.findUnique({
      where: { id: '6c19d4f9-0683-4ac2-9e27-5c2b465e83c2' }
    });

    console.log('All values in database:');
    console.log('- notes:', final.notes);
    console.log('- quotedAmount:', final.quotedAmount?.toString());
    console.log('- commissionRate:', final.commissionRate?.toString());
    console.log('- commissionAmount:', final.commissionAmount?.toString());
    console.log('- checklist:', final.checklist ? 'Present (' + final.checklist.length + ' chars)' : 'null');

  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Code:', error.code);
    console.error('Meta:', error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

test();
