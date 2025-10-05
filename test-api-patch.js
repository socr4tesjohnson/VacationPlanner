const http = require("http");

async function testPatch(field, value) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ [field]: value });

    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/admin/inquiries/6c19d4f9-0683-4ac2-9e27-5c2b465e83c2",
      method: "PATCH",
      headers: {
        Authorization: "Bearer bf08879f-19db-4281-b2d8-92c1896701cb",
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            field: field,
            sent: value,
            response: parsed,
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("=== TESTING PATCH ENDPOINTS ===\n");

  // Test 1: Private Notes
  console.log("Test 1: Private Notes");
  console.log("-------------------");
  const notesTest = await testPatch(
    "notes",
    "This is a test note for the Martinez family. They want a family suite."
  );
  console.log("Status:", notesTest.status);
  console.log("Success:", notesTest.response.success);
  console.log("Updated notes:", notesTest.response.inquiry?.notes);
  console.log("");

  // Test 2: Quoted Amount
  console.log("Test 2: Quoted Amount");
  console.log("-------------------");
  const quoteTest = await testPatch("quotedAmount", 12500.5);
  console.log("Status:", quoteTest.status);
  console.log("Success:", quoteTest.response.success);
  console.log(
    "Updated quotedAmount:",
    quoteTest.response.inquiry?.quotedAmount
  );
  console.log("");

  // Test 3: Commission Rate
  console.log("Test 3: Commission Rate");
  console.log("-------------------");
  const rateTest = await testPatch("commissionRate", 15);
  console.log("Status:", rateTest.status);
  console.log("Success:", rateTest.response.success);
  console.log(
    "Updated commissionRate:",
    rateTest.response.inquiry?.commissionRate
  );
  console.log("");

  // Test 4: Commission Amount (calculated)
  console.log("Test 4: Commission Amount");
  console.log("-------------------");
  const commissionTest = await testPatch("commissionAmount", 1875.075);
  console.log("Status:", commissionTest.status);
  console.log("Success:", commissionTest.response.success);
  console.log(
    "Updated commissionAmount:",
    commissionTest.response.inquiry?.commissionAmount
  );
  console.log("");

  // Test 5: Checklist
  console.log("Test 5: Checklist (JSON)");
  console.log("-------------------");
  const checklist = JSON.stringify([
    { id: "1", text: "Travel insurance discussed", completed: true },
    { id: "2", text: "Dining plan preferences", completed: false },
  ]);
  const checklistTest = await testPatch("checklist", checklist);
  console.log("Status:", checklistTest.status);
  console.log("Success:", checklistTest.response.success);
  console.log("Updated checklist:", checklistTest.response.inquiry?.checklist);
  console.log("");

  // Verify persistence - read from DB directly
  console.log("\n=== VERIFYING DATABASE PERSISTENCE ===\n");

  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  const inquiry = await prisma.contactInquiry.findUnique({
    where: { id: "6c19d4f9-0683-4ac2-9e27-5c2b465e83c2" },
  });

  console.log("Database values:");
  console.log("- notes:", inquiry.notes);
  console.log("- quotedAmount:", inquiry.quotedAmount?.toString());
  console.log("- commissionRate:", inquiry.commissionRate?.toString());
  console.log("- commissionAmount:", inquiry.commissionAmount?.toString());
  console.log(
    "- checklist:",
    inquiry.checklist ? inquiry.checklist.substring(0, 50) + "..." : null
  );

  await prisma.$disconnect();
}

runTests().catch(console.error);
