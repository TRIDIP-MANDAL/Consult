import fs from 'fs';
import path from 'path';

const baseUrl = `http://localhost:5100`;

const runTests = async (dataPath) => {
    try {
        const fullPath = path.resolve(dataPath);
        const dataStr = fs.readFileSync(fullPath, 'utf-8');
        const { base_path, test_data } = JSON.parse(dataStr);
        const login_credentials = {
            email:"bokachoda7384@gmail.com",
            password:"Abcd@1234"
        }
        console.log(`\n🚀 Starting secure tests for base path: ${base_path} (from ${dataPath})`);
        
        let cookie = "";

        // 1. Perform Login if credentials are provided
        if (login_credentials) {
            console.log("\n🔒 Attempting to login...");
            const loginRes = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(login_credentials)
            });

            if (loginRes.ok) {
                const setCookieHeader = loginRes.headers.get('set-cookie');
                if (setCookieHeader) {
                    cookie = setCookieHeader.split(';')[0]; // Extract just the cookie value
                    console.log("✅ Login successful. Cookie saved for tests.");
                } else {
                    console.log("⚠️ Login succeeded but no cookie was returned.");
                }
            } else {
                console.log(`❌ Login failed: ${loginRes.status}`);
                const errText = await loginRes.text();
                console.log(`Response: ${errText}`);
                return; // Stop if login fails
            }
        }

        // 2. Run Tests Sequentially
        for (const data of test_data) {
            if (!data.enabled) {
                continue;
            }
            console.log(`\n---------------------------------------------------`);
            console.log(`Test: ${data.name}`);
            console.log(`Description: ${data.description}`);
            
            const url = baseUrl + base_path + data.endpoint;
            console.log(`Endpoint: ${data.method} ${url}`);
            
            const options = {
                method: data.method,
                headers: { ...data.header }
            };

            // Inject the stored cookie into the headers
            if (cookie) {
                options.headers['Cookie'] = cookie;
            }

            if (data.payload && !['GET', 'HEAD'].includes(data.method.toUpperCase())) {
                options.body = JSON.stringify(data.payload);
            }

            try {
                const response = await fetch(url, options);
                let responseData;
                const text = await response.text();
                try {
                    responseData = JSON.parse(text);
                } catch(e) {
                    responseData = text;
                }
                console.log("Response data : ", responseData);
                if (response.status === data.expected_status) {
                    console.log(`✅ Passed (Status: ${response.status})`);
                } else {
                    console.log(`❌ Failed: Expected Status ${data.expected_status}, but got ${response.status}`);
                }
            } catch (err) {
                console.log(`❌ Request Failed: ${err.message}`);
            }
        }
        
        // 3. Perform Logout
        if (login_credentials && cookie) {
            console.log("\n🔓 Logging out to clean up token...");
            const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
                 method: 'GET',
                 headers: { 'Cookie': cookie }
            });
            if (logoutRes.ok) {
                console.log("✅ Logout successful. Token deleted.");
            } else {
                console.log(`⚠️ Logout failed: ${logoutRes.status}`);
            }
        }

        console.log(`\n---------------------------------------------------\n`);
    } catch (error) {
        console.error(`Error reading or parsing test data from ${dataPath}:`, error.message);
    }
};

// Command line usage: node secure_api.test.js <path-to-data.json>
const dataFile = process.argv[2];
if (dataFile) {
    runTests(dataFile);
} else {
    console.log("Usage: node secure_api.test.js <path-to-data.json>");
    console.log("Example: node secure_api.test.js ./feedback/data.json");
}

export default runTests;
