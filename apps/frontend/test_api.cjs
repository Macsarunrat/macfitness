const http = require('http');

console.log("--- PinkFit API Integration Test ---");
console.log("This script simulates the frontend making requests to http://localhost:8000");
console.log("to verify that the FastAPI backend and Gemini API connection works.");
console.log("------------------------------------------------------------\n");

function post(path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: body ? JSON.parse(body) : {}
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: { rawContent: body } });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

async function run() {
  try {
    // 1. Try to register a test user
    const testEmail = `test.bunny.${Math.floor(Math.random() * 1000)}@test.com`;
    const testPassword = "password123";

    console.log(`[Step 1] Registering test user: ${testEmail}...`);
    const regRes = await post('/auth/register', { email: testEmail, password: testPassword });
    
    if (regRes.statusCode !== 201 && regRes.statusCode !== 400) {
      console.error("[-] FAIL: Failed to register test user. Status:", regRes.statusCode, regRes.data);
      return;
    }
    console.log("[+] SUCCESS: User registered or already exists.\n");

    // 2. Login to retrieve the JWT Token
    console.log("[Step 2] Logging in to retrieve JWT Auth token...");
    const loginData = `username=${encodeURIComponent(testEmail)}&password=${encodeURIComponent(testPassword)}`;
    const loginRes = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 8000,
        path: '/auth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(loginData)
        }
      };
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body) }));
      });
      req.on('error', (err) => reject(err));
      req.write(loginData);
      req.end();
    });

    if (loginRes.statusCode !== 200) {
      console.error("[-] FAIL: Failed to log in. Status:", loginRes.statusCode, loginRes.data);
      return;
    }
    
    const token = loginRes.data.access_token;
    console.log("[+] SUCCESS: JWT Auth Token retrieved.\n");

    // 3. Test Gemini API Text estimation
    console.log("[Step 3] Querying backend text estimation (Gemini 2.5 Flash)...");
    const estRes = await post('/nutrition/estimate-text', 
      { food_name: "ข้าวกะเพราอกไก่ไข่ดาว" },
      { 'Authorization': `Bearer ${token}` }
    );

    if (estRes.statusCode !== 200) {
      console.error("[-] FAIL: Estimation failed. Status:", estRes.statusCode, estRes.data);
      return;
    }

    console.log("\n============================================================");
    console.log("🎉 DIAGNOSTIC TEST SUCCESSFUL!");
    console.log("------------------------------------------------------------");
    console.log("Dish Query:  ข้าวกะเพราอกไก่ไข่ดาว");
    console.log(`Calories:    ${estRes.data.calories} kcal`);
    console.log(`Protein:     ${estRes.data.proteinAmount} g`);
    console.log(`AI Remarks:  ${estRes.data.remarks}`);
    console.log("============================================================");

  } catch (err) {
    console.error("[-] FAIL: Test failed with connection error:", err.message);
    console.log("\nMake sure your FastAPI server is currently running locally at:");
    console.log("👉 http://localhost:8000");
  }
}

run();
