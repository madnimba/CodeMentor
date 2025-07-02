const express = require('express');
const WebSocket = require('ws');
const Docker = require('dockerode');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const tar = require('tar-stream');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const wsPort = process.env.WS_PORT || 8081;

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

app.use(cors());
app.use(express.json());

const activeContainers = new Map();

const wss = new WebSocket.Server({
  port: wsPort,
  perMessageDeflate: false
});

// WebSocket server
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  ws.send(JSON.stringify({ type: 'connection', message: 'Connected to code execution service' }));

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      switch (data.type) {
        case 'execute':
          await handleCodeExecution(ws, data);
          break;
        case 'stop':
          await stopContainer(data.containerId);
          break;
        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
  ws.on('error', (error) => console.error('WebSocket error:', error));
});

// Handle code execution
async function handleCodeExecution(ws, data) {
  const containerId = uuidv4();
  const { code, language } = data;

  try {
    const image = getImageForLanguage(language);
    console.log(`Pulling image: ${image}`);
    await pullImageIfNotExists(image);

    const container = await docker.createContainer({
      Image: image,
      Cmd: ['/bin/bash'],
      Tty: true,
      name: `code-exec-${containerId}`,
      HostConfig: {
        Memory: 512 * 1024 * 1024,
        CpuPeriod: 100000,
        CpuQuota: 50000,
        NetworkMode: 'none',
        AutoRemove: true
      },
      WorkingDir: '/app'
    });

    await container.start();
    activeContainers.set(containerId, container);

    const pack = tar.pack();
    const fileName = `code.${getFileExtension(language)}`;
    pack.entry({ name: fileName }, code);
    pack.finalize();
    await container.putArchive(pack, { path: '/app' });

    const executeCmd = getExecuteCommand(language);
    const exec = await container.exec({
      Cmd: ['/bin/bash', '-c', executeCmd],
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start();

    const timeout = setTimeout(async () => {
      ws.send(JSON.stringify({ type: 'error', message: 'Execution timed out.' }));
      await stopContainer(containerId);
    }, 10000);

    stream.on('data', (chunk) => {
      ws.send(JSON.stringify({ type: 'output', data: chunk.toString() }));
    });

    stream.on('end', () => clearTimeout(timeout));
    stream.on('error', (err) => {
      ws.send(JSON.stringify({ type: 'error', message: err.toString() }));
    });

    setTimeout(async () => {
      await stopContainer(containerId);
    }, 30000);
  } catch (error) {
    console.error('Execution error:', error);
    ws.send(JSON.stringify({ type: 'error', message: error.message }));
  }
}

// Pull image if not present
async function pullImageIfNotExists(image) {
  const images = await docker.listImages();
  const exists = images.some(img => img.RepoTags && img.RepoTags.includes(image));
  if (!exists) {
    return new Promise((resolve, reject) => {
      docker.pull(image, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err) => (err ? reject(err) : resolve()));
      });
    });
  }
}

// Stop and clean container
async function stopContainer(containerId) {
  const container = activeContainers.get(containerId);
  if (container) {
    try {
      await container.stop();
      await container.remove();
      activeContainers.delete(containerId);
      console.log('Container stopped and removed:', containerId);
    } catch (error) {
      console.error('Error stopping container:', error);
    }
  }
}

// Language settings
function getImageForLanguage(language) {
  return {
    javascript: 'node:18',
    python: 'python:3.9',
    java: 'openjdk:17',
    cpp: 'gcc:latest'
  }[language] || 'node:18';
}

function getExecuteCommand(language) {
  return {
    javascript: 'node /app/code.js',
    python: 'python /app/code.py',
    java: 'cd /app && javac code.java && java code',
    cpp: 'cd /app && g++ code.cpp -o code && ./code'
  }[language] || 'node /app/code.js';
}

function getFileExtension(language) {
  return {
    javascript: 'js',
    python: 'py',
    java: 'java',
    cpp: 'cpp'
  }[language] || 'js';
}

// Start HTTP server
app.listen(port, () => {
  console.log(`HTTP server running on port ${port}`);
});

// Log WebSocket server status
wss.on('listening', () => {
  console.log(`WebSocket server running on port ${wsPort}`);
});

wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});
