const http = require('http');

// Simulate what the frontend sends
const tests = [
  {
    name: 'Private Notes (string)',
    payload: { notes: 'Client wants family suite with connecting rooms' }
  },
  {
    name: 'Quoted Amount (number)',
    payload: { quotedAmount: 12500.50, commissionRate: 10, commissionAmount: 1250.05 }
  },
  {
    name: 'Checklist (JSON string)',
    payload: {
      checklist: JSON.stringify([
        { id: '1', text: 'Travel insurance discussed', completed: true },
        { id: '2', text: 'Dining plan preferences', completed: false }
      ])
    }
  }
];

async function runTest(testCase) {
  return new Promise((resolve) => {
    const data = JSON.stringify(testCase.payload);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/inquiries/6c19d4f9-0683-4ac2-9e27-5c2b465e83c2',
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer bf08879f-19db-4281-b2d8-92c1896701cb',
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    console.log('\n' + '='.repeat(60));
    console.log('TEST:', testCase.name);
    console.log('='.repeat(60));
    console.log('Sending:', testCase.payload);

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log('\nStatus Code:', res.statusCode);

        try {
          const parsed = JSON.parse(responseData);
          console.log('Response:', JSON.stringify(parsed, null, 2));

          if (res.statusCode === 200) {
            console.log('✓ SUCCESS');
          } else {
            console.log('✗ FAILED');
          }
        } catch (e) {
          console.log('Response (non-JSON):', responseData);
          console.log('✗ FAILED - Invalid JSON response');
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('✗ REQUEST ERROR:', error.message);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

async function runAllTests() {
  console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  TESTING CLIENT MANAGEMENT FEATURES - SIMULATED FRONTEND     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  for (const test of tests) {
    await runTest(test);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('VERIFYING DATABASE STATE');
  console.log('='.repeat(60));

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const inquiry = await prisma.contactInquiry.findUnique({
    where: { id: '6c19d4f9-0683-4ac2-9e27-5c2b465e83c2' }
  });

  console.log('\nFinal database values:');
  console.log('- notes:', inquiry.notes || '(null)');
  console.log('- quotedAmount:', inquiry.quotedAmount?.toString() || '(null)');
  console.log('- commissionRate:', inquiry.commissionRate?.toString() || '(null)');
  console.log('- commissionAmount:', inquiry.commissionAmount?.toString() || '(null)');
  console.log('- checklist:', inquiry.checklist ? `Present (${inquiry.checklist.length} chars)` : '(null)');

  await prisma.$disconnect();

  console.log('\n' + '='.repeat(60));
  console.log('TESTS COMPLETE');
  console.log('='.repeat(60) + '\n');
}

runAllTests().catch(console.error);
