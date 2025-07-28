const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// CORS configuration for production
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost', 'http://frontend'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' })); // Limit request size

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/run', limiter);



const JUDGE0_API = process.env.JUDGE0_API;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Language IDs from Judge0
const languageMap = {
  cpp: 54,
  python: 71,
  javascript: 63,
};

// Request queue for managing concurrent executions
const executionQueue = [];
const maxConcurrentExecutions = 5;
let activeExecutions = 0;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Judge0 server is running',
    queueLength: executionQueue.length,
    activeExecutions: activeExecutions
  });
});

// Queue management
function processQueue() {
  if (executionQueue.length > 0 && activeExecutions < maxConcurrentExecutions) {
    const { req, res } = executionQueue.shift();
    activeExecutions++;
    
    executeCode(req, res).finally(() => {
      activeExecutions--;
      processQueue(); // Process next in queue
    });
  }
}

async function executeCode(req, res) {
  const { code, language, input = "" } = req.body; // Extract input parameter
  const languageId = languageMap[language];

  if (!languageId) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  // Validate code length
  if (code.length > 50000) { // 50KB limit
    return res.status(400).json({ error: 'Code too long (max 50KB)' });
  }

  // Check if environment variables are set
  if (!JUDGE0_API || !RAPIDAPI_HOST || !RAPIDAPI_KEY) {
    console.error('Missing environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    console.log(`[${new Date().toISOString()}] Executing ${language} code with input: ${input}`);
    
    // Step 1: Submit the code
    const submissionRes = await axios.post(
      `${JUDGE0_API}/submissions`,
      {
        source_code: code,
        language_id: languageId,
        stdin: input, // Use the provided input
        cpu_time_limit: 5, // 5 seconds limit
        memory_limit: 512000, // 512MB limit
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'X-RapidAPI-Key': RAPIDAPI_KEY
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const token = submissionRes.data.token;
    console.log(`[${new Date().toISOString()}] Submission token: ${token}`);

    // Step 2: Poll for result with timeout
    let result;
    const maxAttempts = 15; // 15 seconds max wait time
    
    for (let i = 0; i < maxAttempts; i++) {
      const statusRes = await axios.get(`${JUDGE0_API}/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'X-RapidAPI-Key': RAPIDAPI_KEY
        },
        params: { base64_encoded: 'false' },
        timeout: 5000
      });

      if (statusRes.data.status.id <= 2) {
        await new Promise((r) => setTimeout(r, 1000)); // Wait 1 second
      } else {
        result = statusRes.data;
        break;
      }
    }

    if (result) {
      console.log(`[${new Date().toISOString()}] Execution completed: ${result.status.description}`);
      
      return res.json({
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        compile_output: result.compile_output || '',
        status: result.status.description,
        execution_time: result.time,
        memory_used: result.memory
      });
    } else {
      console.log(`[${new Date().toISOString()}] Execution timed out`);
      return res.status(408).json({ error: 'Execution timed out' });
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Judge0 Error:`, error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    
    res.status(500).json({ error: 'Execution failed. Please try again.' });
  }
}

app.post('/run', async (req, res) => {
  // Add to queue if at capacity
  if (activeExecutions >= maxConcurrentExecutions) {
    if (executionQueue.length >= 10) { // Max 10 in queue
      return res.status(503).json({ 
        error: 'Server is busy. Please try again in a few moments.',
        queuePosition: executionQueue.length
      });
    }
    
    executionQueue.push({ req, res });
    console.log(`[${new Date().toISOString()}] Request queued. Queue length: ${executionQueue.length}`);
    return;
  }

  // Execute immediately if capacity available
  activeExecutions++;
  executeCode(req, res).finally(() => {
    activeExecutions--;
    processQueue(); // Process next in queue
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled error:`, error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Judge0 Production Server running on port ${PORT}`);
  console.log(`📊 Max concurrent executions: ${maxConcurrentExecutions}`);
  console.log(`⏱️  Rate limit: 10 requests per minute per IP`);
}); 