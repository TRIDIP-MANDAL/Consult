import fs from 'fs';
import path from 'path';

const baseUrl = `http://localhost:5100`;

const runTests = async (dataPath) => {
    try {
        const fullPath = path.resolve(dataPath);
        const dataStr = fs.readFileSync(fullPath, 'utf-8');
        const { base_path, test_data } = JSON.parse(dataStr);

        console.log(`\n🚀 Starting tests for base path: ${base_path} (from ${dataPath})`);

        test_data.forEach((data) => {
            if (data.enabled) {
                console.log(`\n---------------------------------------------------`);
                console.log(`Test: ${data.name}`);
                console.log(`Description: ${data.description}`);

                const url = baseUrl + base_path + data.endpoint;
                console.log(`Endpoint: ${data.method} ${url}`);

                const options = {
                    method: data.method,
                    headers: data.header || { 'Content-Type': 'application/json' }
                };

                // Only add body for methods that allow it
                if (data.payload && !['GET', 'HEAD'].includes(data.method.toUpperCase())) {
                    options.body = JSON.stringify(data.payload);
                }

                fetch(url, options)
                    .then(async (response) => {
                        let responseData;
                        const text = await response.text();
                        try {
                            responseData = JSON.parse(text);
                        } catch (e) {
                            responseData = text;
                        }
                        console.log("Response data : ", responseData);
                        if (response.status === data.expected_status) {
                            console.log(`✅ Passed (Status: ${response.status})`);
                        } else {
                            console.log(`❌ Failed: Expected Status ${data.expected_status}, but got ${response.status}`);
                            console.log(`Response Data:`, responseData);
                        }
                    })
                    .catch((err) => {
                        console.log(`❌ Request Failed: ${err.message}`);
                    });
            }
        });
        console.log(`\n---------------------------------------------------\n`);
    } catch (error) {
        console.error(`Error reading or parsing test data from ${dataPath}:`, error.message);
    }
};

// Command line usage: node api.test.js <path-to-data.json>
const dataFile = process.argv[2];
if (dataFile) {
    runTests(dataFile);
} else {
    console.log("Usage: node api.test.js <path-to-data.json>");
    console.log("Example: node api.test.js ./freedback/data.json");
}

export default runTests;