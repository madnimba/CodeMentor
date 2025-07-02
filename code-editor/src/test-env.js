const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('Testing environment variables...');
console.log('JUDGE0_API:', process.env.JUDGE0_API);
console.log('RAPIDAPI_HOST:', process.env.RAPIDAPI_HOST);
console.log('RAPIDAPI_KEY:', process.env.RAPIDAPI_KEY ? '***' + process.env.RAPIDAPI_KEY.slice(-4) : 'NOT SET');
console.log('PORT:', process.env.PORT);

if (process.env.JUDGE0_API && process.env.RAPIDAPI_HOST && process.env.RAPIDAPI_KEY) {
  console.log('✅ All environment variables are loaded correctly!');
} else {
  console.log('❌ Some environment variables are missing!');
} 