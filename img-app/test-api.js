const https = require('http');

function testAPI(url, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Testing ${description}...`);
    console.log(`📍 URL: ${url}`);
    
    const req = https.get(url, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📦 Response length: ${data.length} characters`);
        if (data.length > 0) {
          try {
            const parsed = JSON.parse(data);
            console.log(`✅ Valid JSON response:`);
            console.log(JSON.stringify(parsed, null, 2));
          } catch (e) {
            console.log(`📄 Raw response:`);
            console.log(data);
          }
        } else {
          console.log(`⚠️  Empty response body`);
        }
        resolve(data);
      });
    });
    
    req.on('error', (err) => {
      console.error(`❌ Error: ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      console.error(`⏰ Request timeout`);
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function runTests() {
  try {
    await testAPI('http://localhost:8888/.netlify/functions/images', 'Netlify Images API');
    await testAPI('http://localhost:3001/api/images', 'Panel Images API');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();