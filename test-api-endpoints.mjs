import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

// Real session token from database
const SESSION_TOKEN = '92a26d51-f126-4c86-abb8-c7ff7f8994b4';
const AUTH_COOKIE = `session_token=${SESSION_TOKEN}`;

async function testFeature1_PrivateNotes(inquiryId) {
  console.log('\n========================================');
  console.log('FEATURE 1: PRIVATE NOTES');
  console.log('========================================\n');

  try {
    // Step 1: Get initial inquiry data
    console.log('Step 1: Fetching initial inquiry...');
    const getResponse = await fetch(`${BASE_URL}/api/admin/inquiries/${inquiryId}`, {
      headers: { Cookie: AUTH_COOKIE }
    });

    console.log('GET Status:', getResponse.status);
    const getResult = await getResponse.json();
    console.log('Initial notes:', getResult.inquiry?.notes || '(empty)');

    // Step 2: Save new notes
    console.log('\nStep 2: Saving new notes...');
    const testNotes = `Test notes created at ${new Date().toISOString()}`;
    const patchResponse = await fetch(`${BASE_URL}/api/admin/inquiries/${inquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: AUTH_COOKIE
      },
      body: JSON.stringify({ notes: testNotes })
    });

    console.log('PATCH Status:', patchResponse.status);
    const patchResult = await patchResponse.json();
    console.log('Response success:', patchResult.success);
    console.log('Saved notes:', patchResult.inquiry?.notes);

    // Step 3: Verify persistence (refetch)
    console.log('\nStep 3: Verifying persistence...');
    const verifyResponse = await fetch(`${BASE_URL}/api/admin/inquiries/${inquiryId}`, {
      headers: { Cookie: AUTH_COOKIE }
    });

    const verifyResult = await verifyResponse.json();
    console.log('Persisted notes:', verifyResult.inquiry?.notes);

    const passed = verifyResult.inquiry?.notes === testNotes;
    console.log(`\n✅ Feature 1 Result: ${passed ? 'PASSED' : 'FAILED'}`);

    return {
      feature: 'Private Notes',
      passed,
      details: {
        getStatus: getResponse.status,
        patchStatus: patchResponse.status,
        notesPersisted: passed
      }
    };
  } catch (error) {
    console.error('❌ Feature 1 Error:', error.message);
    return { feature: 'Private Notes', passed: false, error: error.message };
  }
}

async function testFeature2_QuoteCommission(inquiryId) {
  console.log('\n========================================');
  console.log('FEATURE 2: QUOTE & COMMISSION TRACKING');
  console.log('========================================\n');

  try {
    // Step 1: Save quote and commission data
    console.log('Step 1: Saving quote with $5000 quoted amount and 15% commission...');
    const quotedAmount = 5000;
    const commissionRate = 15;
    const commissionAmount = (quotedAmount * commissionRate) / 100; // 750

    const patchResponse = await fetch(`${BASE_URL}/api/admin/inquiries/${inquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: AUTH_COOKIE
      },
      body: JSON.stringify({
        quotedAmount,
        commissionRate,
        commissionAmount
      })
    });

    console.log('PATCH Status:', patchResponse.status);
    const patchResult = await patchResponse.json();

    console.log('Response success:', patchResult.success);
    console.log('Response quotedAmount:', patchResult.inquiry?.quotedAmount, typeof patchResult.inquiry?.quotedAmount);
    console.log('Response commissionRate:', patchResult.inquiry?.commissionRate, typeof patchResult.inquiry?.commissionRate);
    console.log('Response commissionAmount:', patchResult.inquiry?.commissionAmount, typeof patchResult.inquiry?.commissionAmount);

    // Step 2: Verify persistence and data types
    console.log('\nStep 2: Verifying persistence and serialization...');
    const getResponse = await fetch(`${BASE_URL}/api/admin/inquiries/${inquiryId}`, {
      headers: { Cookie: AUTH_COOKIE }
    });

    const getResult = await getResponse.json();
    console.log('Persisted quotedAmount:', getResult.inquiry?.quotedAmount, typeof getResult.inquiry?.quotedAmount);
    console.log('Persisted commissionRate:', getResult.inquiry?.commissionRate, typeof getResult.inquiry?.commissionRate);
    console.log('Persisted commissionAmount:', getResult.inquiry?.commissionAmount, typeof getResult.inquiry?.commissionAmount);

    // Validation
    const valuesPersisted =
      getResult.inquiry?.quotedAmount === quotedAmount &&
      getResult.inquiry?.commissionRate === commissionRate &&
      getResult.inquiry?.commissionAmount === commissionAmount;

    const correctTypes =
      typeof getResult.inquiry?.quotedAmount === 'number' &&
      typeof getResult.inquiry?.commissionRate === 'number' &&
      typeof getResult.inquiry?.commissionAmount === 'number';

    const passed = valuesPersisted && correctTypes && patchResponse.status === 200;
    console.log(`\n✅ Feature 2 Result: ${passed ? 'PASSED' : 'FAILED'}`);

    return {
      feature: 'Quote & Commission',
      passed,
      details: {
        patchStatus: patchResponse.status,
        valuesPersisted,
        correctTypes,
        commissionCalculation: commissionAmount === 750
      }
    };
  } catch (error) {
    console.error('❌ Feature 2 Error:', error.message);
    return { feature: 'Quote & Commission', passed: false, error: error.message };
  }
}

async function testFeature3_Checklist(inquiryId) {
  console.log('\n========================================');
  console.log('FEATURE 3: CLIENT CHECKLIST');
  console.log('========================================\n');

  try {
    // Step 1: Get initial checklist
    console.log('Step 1: Fetching initial checklist...');
    const getResponse = await fetch(`${BASE_URL}/api/admin/inquiries/${inquiryId}`, {
      headers: { Cookie: AUTH_COOKIE }
    });

    const getResult = await getResponse.json();
    console.log('Initial checklist:', getResult.inquiry?.checklist || '(empty)');

    // Step 2: Toggle first 3 items
    console.log('\nStep 2: Creating checklist with 3 items checked...');
    const checklist = JSON.stringify({
      "Travel insurance discussed": true,
      "Dining plan preferences": true,
      "Park tickets included": true,
      "Accommodation booked": false,
      "FastPass selections made": false
    });

    const patchResponse = await fetch(`${BASE_URL}/api/admin/inquiries/${inquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: AUTH_COOKIE
      },
      body: JSON.stringify({ checklist })
    });

    console.log('PATCH Status:', patchResponse.status);
    const patchResult = await patchResponse.json();
    console.log('Response success:', patchResult.success);
    console.log('Saved checklist:', patchResult.inquiry?.checklist);

    // Step 3: Verify persistence
    console.log('\nStep 3: Verifying persistence...');
    const verifyResponse = await fetch(`${BASE_URL}/api/admin/inquiries/${inquiryId}`, {
      headers: { Cookie: AUTH_COOKIE }
    });

    const verifyResult = await verifyResponse.json();
    console.log('Persisted checklist:', verifyResult.inquiry?.checklist);

    const checklistPersisted = verifyResult.inquiry?.checklist === checklist;
    const passed = checklistPersisted && patchResponse.status === 200;
    console.log(`\n✅ Feature 3 Result: ${passed ? 'PASSED' : 'FAILED'}`);

    return {
      feature: 'Client Checklist',
      passed,
      details: {
        patchStatus: patchResponse.status,
        checklistPersisted
      }
    };
  } catch (error) {
    console.error('❌ Feature 3 Error:', error.message);
    return { feature: 'Client Checklist', passed: false, error: error.message };
  }
}

async function main() {
  console.log('🧪 CLIENT MANAGEMENT FEATURES TEST SUITE');
  console.log('==========================================\n');

  try {
    // Get first inquiry ID
    const inquiries = await prisma.contactInquiry.findMany({ take: 1 });
    if (inquiries.length === 0) {
      console.error('❌ No inquiries found in database. Please create test data first.');
      return;
    }

    const inquiryId = inquiries[0].id;
    console.log(`Testing with inquiry ID: ${inquiryId}\n`);

    // Run all tests
    const results = [];
    results.push(await testFeature1_PrivateNotes(inquiryId));
    results.push(await testFeature2_QuoteCommission(inquiryId));
    results.push(await testFeature3_Checklist(inquiryId));

    // Summary
    console.log('\n========================================');
    console.log('TEST SUMMARY');
    console.log('========================================\n');

    results.forEach(result => {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${status} - ${result.feature}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.details) {
        console.log(`   Details:`, JSON.stringify(result.details, null, 2));
      }
    });

    const allPassed = results.every(r => r.passed);
    console.log(`\n${'='.repeat(40)}`);
    console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
    console.log('='.repeat(40));

  } catch (error) {
    console.error('❌ Test suite error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
