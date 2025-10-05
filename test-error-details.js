const http = require("http");

const data = JSON.stringify({ notes: "Test note" });

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
    console.log("Status Code:", res.statusCode);
    console.log("Response Body:", responseData);
    try {
      const parsed = JSON.parse(responseData);
      console.log("\nParsed:");
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log("Could not parse JSON");
    }
  });
});

req.on("error", (error) => {
  console.error("Request Error:", error);
});

req.write(data);
req.end();
