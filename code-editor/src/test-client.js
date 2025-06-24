const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8081');

ws.on('open', () => {
  console.log('Connected to server');

  // Test JavaScript code execution
  const testCode = {
    type: 'execute',
    language: 'javascript',
    code: `
      console.log('Hello from JavaScript!');
      const sum = (a, b) => a + b;
      console.log('Sum of 5 and 3:', sum(5, 3));
    `
  };

  ws.send(JSON.stringify(testCode));
});

ws.on('message', (data) => {
  let response;
  try {
    response = JSON.parse(data);
  } catch (err) {
    console.error('Failed to parse message:', data);
    return;
  }

  switch (response.type) {
    case 'output':
      console.log('Output:', response.data);
      break;
    case 'error':
      console.error('Error:', response.message);
      break;
    case 'connection':
      console.log('Server message:', response.message);
      break;
    default:
      console.log('Unknown message type:', response);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('Disconnected from server');
});