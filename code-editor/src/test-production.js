const axios = require('axios');

const PRODUCTION_SERVER_URL = 'http://localhost:3000';

// Test cases for different scenarios
const testCases = [
  {
    name: 'Basic JavaScript Test',
    language: 'javascript',
    code: `
console.log('Hello from Production Server!');
const sum = (a, b) => a + b;
console.log('Sum of 10 and 20:', sum(10, 20));
`
  },
  {
    name: 'Python with Error Test',
    language: 'python',
    code: `
print("Testing error handling...")
x = 10 / 0  # This will cause an error
print("This won't print")
`
  },
  {
    name: 'C++ Complex Test',
    language: 'cpp',
    code: `
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> numbers = {1, 2, 3, 4, 5};
    int sum = 0;
    
    for(int num : numbers) {
        sum += num;
    }
    
    cout << "Sum of vector: " << sum << endl;
    cout << "Average: " << (double)sum / numbers.size() << endl;
    
    return 0;
}
`
  }
];

async function testHealthEndpoint() {
  console.log('🏥 Testing Health Endpoint...');
  
  try {
    const response = await axios.get(`${PRODUCTION_SERVER_URL}/health`);
    console.log('✅ Health Check Response:');
    console.log('Status:', response.data.status);
    console.log('Message:', response.data.message);
    console.log('Queue Length:', response.data.queueLength);
    console.log('Active Executions:', response.data.activeExecutions);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function testRateLimiting() {
  console.log('\n🚦 Testing Rate Limiting...');
  
  const promises = [];
  for (let i = 0; i < 15; i++) { // Try 15 requests quickly
    promises.push(
      axios.post(`${PRODUCTION_SERVER_URL}/run`, {
        code: `console.log('Request ${i + 1}');`,
        language: 'javascript'
      }).catch(error => ({ error: true, status: error.response?.status, message: error.response?.data?.error }))
    );
  }
  
  const results = await Promise.all(promises);
  let successCount = 0;
  let rateLimitCount = 0;
  
  results.forEach((result, index) => {
    if (result.error) {
      if (result.status === 429) {
        rateLimitCount++;
        console.log(`Request ${index + 1}: Rate limited`);
      } else {
        console.log(`Request ${index + 1}: Error - ${result.message}`);
      }
    } else {
      successCount++;
      console.log(`Request ${index + 1}: Success`);
    }
  });
  
  console.log(`\n📊 Rate Limiting Results:`);
  console.log(`Successful requests: ${successCount}`);
  console.log(`Rate limited requests: ${rateLimitCount}`);
}

async function testQueueManagement() {
  console.log('\n📋 Testing Queue Management...');
  
  // Make multiple requests simultaneously to test queue
  const promises = [];
  for (let i = 0; i < 8; i++) {
    promises.push(
      axios.post(`${PRODUCTION_SERVER_URL}/run`, {
        code: `
console.log('Queued request ${i + 1}');
// Simulate some work
for(let j = 0; j < 1000000; j++) {
  Math.random();
}
console.log('Request ${i + 1} completed');
`,
        language: 'javascript'
      }).catch(error => ({ error: true, status: error.response?.status, message: error.response?.data?.error }))
    );
  }
  
  console.log('Sending 8 concurrent requests...');
  const results = await Promise.all(promises);
  
  let successCount = 0;
  let queuedCount = 0;
  let errorCount = 0;
  
  results.forEach((result, index) => {
    if (result.error) {
      if (result.status === 503) {
        queuedCount++;
        console.log(`Request ${index + 1}: Queued`);
      } else {
        errorCount++;
        console.log(`Request ${index + 1}: Error - ${result.message}`);
      }
    } else {
      successCount++;
      console.log(`Request ${index + 1}: Executed successfully`);
    }
  });
  
  console.log(`\n📊 Queue Management Results:`);
  console.log(`Executed immediately: ${successCount}`);
  console.log(`Queued: ${queuedCount}`);
  console.log(`Errors: ${errorCount}`);
}

async function testCodeSizeLimit() {
  console.log('\n📏 Testing Code Size Limit...');
  
  // Create a large code string
  const largeCode = `
console.log('Testing size limit...');
${'console.log("Line " + i);'.repeat(1000)} // 1000 lines
console.log('End of large code');
`;
  
  try {
    const response = await axios.post(`${PRODUCTION_SERVER_URL}/run`, {
      code: largeCode,
      language: 'javascript'
    });
    console.log('✅ Large code executed successfully');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Code size limit working correctly');
    } else {
      console.log('❌ Unexpected error:', error.response?.data?.error);
    }
  }
}

async function testExecutionTimeout() {
  console.log('\n⏰ Testing Execution Timeout...');
  
  const infiniteLoop = `
console.log('Starting infinite loop...');
while(true) {
  // This should timeout
}
`;
  
  try {
    const response = await axios.post(`${PRODUCTION_SERVER_URL}/run`, {
      code: infiniteLoop,
      language: 'javascript'
    });
    console.log('❌ Infinite loop should have timed out');
  } catch (error) {
    if (error.response?.status === 408) {
      console.log('✅ Execution timeout working correctly');
    } else {
      console.log('❌ Unexpected error:', error.response?.data?.error);
    }
  }
}

async function runBasicTests() {
  console.log('🧪 Running Basic Production Tests...\n');
  
  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`Language: ${testCase.language}`);
    console.log('─'.repeat(50));
    
    try {
      const response = await axios.post(`${PRODUCTION_SERVER_URL}/run`, {
        code: testCase.code,
        language: testCase.language
      });
      
      console.log('✅ Success!');
      console.log('Status:', response.data.status);
      
      if (response.data.stdout) {
        console.log('Output:');
        console.log(response.data.stdout);
      }
      
      if (response.data.stderr) {
        console.log('Errors:');
        console.log(response.data.stderr);
      }
      
      if (response.data.execution_time) {
        console.log(`Execution time: ${response.data.execution_time}s`);
      }
      
      if (response.data.memory_used) {
        console.log(`Memory used: ${response.data.memory_used}KB`);
      }
      
    } catch (error) {
      console.log('❌ Error:');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data.error);
      } else {
        console.log('Network Error:', error.message);
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
}

async function main() {
  console.log('🚀 Testing Judge0 Production Server\n');
  
  // Test health endpoint first
  const isHealthy = await testHealthEndpoint();
  if (!isHealthy) {
    console.log('❌ Server is not healthy. Make sure judge-production.js is running.');
    return;
  }
  
  // Run basic tests
  await runBasicTests();
  
  // Test production features
  await testRateLimiting();
  await testQueueManagement();
  await testCodeSizeLimit();
  await testExecutionTimeout();
  
  console.log('\n🎉 All production tests completed!');
}

main().catch(console.error); 