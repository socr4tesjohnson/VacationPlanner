const https = require("http");

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/admin/inquiries/6c19d4f9-0683-4ac2-9e27-5c2b465e83c2",
  method: "GET",
  headers: {
    Authorization: "Bearer bf08879f-19db-4281-b2d8-92c1896701cb",
  },
};

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    const parsed = JSON.parse(data);
    console.log("Response status:", res.statusCode);
    console.log("\nInquiry fields:");
    console.log("- notes:", parsed.inquiry.notes);
    console.log("- quotedAmount:", parsed.inquiry.quotedAmount);
    console.log("- commissionRate:", parsed.inquiry.commissionRate);
    console.log("- commissionAmount:", parsed.inquiry.commissionAmount);
    console.log("- checklist:", parsed.inquiry.checklist);
  });
});

req.on("error", (error) => {
  console.error("Error:", error);
});

req.end();
