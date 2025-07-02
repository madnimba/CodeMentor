const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const JUDGE0_API = process.env.JUDGE0_API;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Debug: Check if environment variables are loaded
console.log('Environment variables:');
console.log('JUDGE0_API:', JUDGE0_API);
console.log('RAPIDAPI_HOST:', RAPIDAPI_HOST);
console.log('RAPIDAPI_KEY:', RAPIDAPI_KEY ? '***' + RAPIDAPI_KEY.slice(-4) : 'NOT SET');

// Language IDs from Judge0: https://ce.judge0.com/languages
const languageMap = {
  cpp: 54,
  python: 71,
  javascript: 63,
  java: 62
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Judge0 server is running' });
});

app.post('/run', async (req, res) => {
  const { code, language } = req.body;
  const languageId = languageMap[language];

  if (!languageId) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  // Check if environment variables are set
  if (!JUDGE0_API || !RAPIDAPI_HOST || !RAPIDAPI_KEY) {
    console.error('Missing environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    console.log(`Submitting ${language} code to Judge0...`);
    
    // Step 1: Submit the code
    const submissionRes = await axios.post(
      `${JUDGE0_API}/submissions`,
      {
        source_code: code,
        language_id: languageId,
        stdin: "",
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'X-RapidAPI-Key': RAPIDAPI_KEY
        }
      }
    );

    const token = submissionRes.data.token;
    console.log(`Submission token: ${token}`);

    // Step 2: Poll for result
    let result;
    for (let i = 0; i < 10; i++) {
      const statusRes = await axios.get(`${JUDGE0_API}/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'X-RapidAPI-Key': RAPIDAPI_KEY
        },
        params: { base64_encoded: 'false' }
      });

      if (statusRes.data.status.id <= 2) {
        await new Promise((r) => setTimeout(r, 1000)); // Wait and retry
      } else {
        result = statusRes.data;
        break;
      }
    }

    if (result) {
      return res.json({
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output,
        status: result.status.description
      });
    } else {
      return res.status(500).json({ error: 'Timed out waiting for execution result' });
    }

  } catch (error) {
    console.error('Judge0 Error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Execution failed' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Judge0 server is running on port ${process.env.PORT || 3000}`);
});
