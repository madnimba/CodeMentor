const axios = require('axios');

const JUDGE_SERVER_URL = 'http://localhost:3000';

// Test cases for different languages
const testCases = [
  {
    name: 'JavaScript Test',
    language: 'javascript',
    code: `
console.log('Hello from JavaScript!');
const sum = (a, b) => a + b;
console.log('Sum of 5 and 3:', sum(5, 3));
`
  },
  {
    name: 'Python Test',
    language: 'python',
    code: `
print("Hello from Python!")
def sum_numbers(a, b):
    return a + b
print(f"Sum of 5 and 3: {sum_numbers(5, 3)}")
`
  },
  {
    name: 'C++ Test',
    language: 'cpp',
    code: `
#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++!" << endl;
    int a = 5, b = 3;
    int sum = a + b;
    cout << "Sum of " << a << " and " << b << ": " << sum << endl;
    return 0;
}
`
  },
  {
    name: 'Java Test',
    language: 'java',
    code: `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        int a = 5, b = 3;
        int sum = a + b;
        System.out.println("Sum of " + a + " and " + b + ": " + sum);
    }
}
`
  }
];

async function testJudge0() {
  console.log('🧪 Testing Judge0 API Integration...\n');

  for (const testCase of testCases) {
    console.log(`📝 Testing ${testCase.name}`);
    console.log(`Language: ${testCase.language}`);
    console.log('Code:');
    console.log(testCase.code);
    console.log('─'.repeat(50));

    try {
      const response = await axios.post(`${JUDGE_SERVER_URL}/run`, {
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
      
      if (response.data.compile_output) {
        console.log('Compilation Output:');
        console.log(response.data.compile_output);
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

// Test connection first
async function testConnection() {
  console.log('🔌 Testing connection to Judge0 server...');
  
  try {
    const response = await axios.get(`${JUDGE_SERVER_URL}/health`);
    console.log('✅ Server is running!');
    return true;
  } catch (error) {
    console.log('❌ Cannot connect to server. Make sure judge.js is running on port 3000');
    console.log('Run: node src/judge.js');
    return false;
  }
}

async function main() {
  const isConnected = await testConnection();
  
  if (isConnected) {
    await testJudge0();
  }
}

main().catch(console.error); 