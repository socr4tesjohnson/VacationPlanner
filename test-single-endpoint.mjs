// Quick diagnostic test to see detailed error responses

const SESSION_TOKEN = "92a26d51-f126-4c86-abb8-c7ff7f8994b4";
const BASE_URL = "http://localhost:3000";
const INQUIRY_ID = "6c19d4f9-0683-4ac2-9e27-5c2b465e83c2";

async function testPatchRequest() {
  console.log("Testing PATCH request...\n");

  try {
    const response = await fetch(
      `${BASE_URL}/api/admin/inquiries/${INQUIRY_ID}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_token=${SESSION_TOKEN}`,
        },
        body: JSON.stringify({ notes: "Test notes" }),
      }
    );

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log("\nResponse body:");
    console.log(text);

    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      console.log("\nParsed JSON:");
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log("Response is not JSON");
    }
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  }
}

testPatchRequest();
