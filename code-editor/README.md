# Code Execution Service

A Docker-based code execution service for live coding environments. This service provides isolated containers for running user-submitted code in various programming languages.

## Features

- Real-time code execution using WebSocket
- Support for multiple programming languages:
  - JavaScript (Node.js)
  - Python
  - Java
  - C++
- Isolated execution environment using Docker containers
- Resource limits (CPU, Memory) for security
- Automatic container cleanup
- Real-time output streaming

## Prerequisites

- Node.js (v14 or higher)
- Docker
- Docker daemon running with API access

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   WS_PORT=8081
   DOCKER_HOST=unix:///var/run/docker.sock
   MAX_CONTAINERS=10
   CONTAINER_TIMEOUT=30000
   MEMORY_LIMIT=512
   CPU_LIMIT=50
   ```

3. Start the service:
   ```bash
   npm start
   ```

## Usage

### WebSocket Connection

Connect to the WebSocket server at `ws://localhost:8081`

### Message Format

1. Execute Code:
   ```json
   {
     "type": "execute",
     "language": "javascript",
     "code": "console.log('Hello, World!');"
   }
   ```

2. Stop Execution:
   ```json
   {
     "type": "stop",
     "containerId": "container-uuid"
   }
   ```

### Response Format

1. Output:
   ```json
   {
     "type": "output",
     "data": "Hello, World!\n"
   }
   ```

2. Error:
   ```json
   {
     "type": "error",
     "message": "Error message"
   }
   ```

## Security Considerations

- Each code execution runs in an isolated Docker container
- Resource limits are enforced:
  - Memory: 512MB per container
  - CPU: 50% of available CPU
- Containers are automatically cleaned up after 30 seconds
- Maximum of 10 concurrent containers allowed

## Development

For development with auto-reload:
```bash
npm run dev
```

## License

MIT 