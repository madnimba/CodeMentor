# Code Editor Service Integration Guide

## Overview
The Code Editor Service is a standalone microservice that provides code execution capabilities for the CodeMentor platform. It can be deployed independently and integrated with existing frontend and backend services.

## Service Architecture

### Components
- **HTTP API Server** (Port 3000): REST API for code execution
- **WebSocket Server** (Port 8081): Real-time code execution and output streaming
- **Docker Integration**: Secure code execution in isolated containers
- **Judge0 Integration**: Alternative code execution via Judge0 API

### API Endpoints

#### HTTP API (Port 3000)
```
POST /run
GET  /health
```

#### WebSocket (Port 8081)
```
ws://your-domain:8081
```

## Integration Steps

### 1. Frontend Integration

#### Update Frontend Configuration
Add the code-editor service URL to your frontend environment:

```javascript
// .env or environment configuration
VITE_CODE_EDITOR_URL=https://your-code-editor-domain.com
VITE_CODE_EDITOR_WS_URL=wss://your-code-editor-domain.com/ws
```

#### API Integration Example
```javascript
// Code execution via HTTP API
const executeCode = async (code, language) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_CODE_EDITOR_URL}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Code execution error:', error);
    throw error;
  }
};

// Real-time execution via WebSocket
const connectWebSocket = () => {
  const ws = new WebSocket(import.meta.env.VITE_CODE_EDITOR_WS_URL);
  
  ws.onopen = () => {
    console.log('Connected to code editor service');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case 'output':
        console.log('Code output:', data.data);
        break;
      case 'error':
        console.error('Execution error:', data.message);
        break;
    }
  };
  
  return ws;
};
```

### 2. Backend Integration

#### Update Backend Configuration
Add the code-editor service URL to your backend environment:

```properties
# application.properties or environment variables
CODE_EDITOR_URL=https://your-code-editor-domain.com
CODE_EDITOR_WS_URL=wss://your-code-editor-domain.com/ws
```

#### Backend Integration Example (Java/Spring)
```java
@Service
public class CodeExecutionService {
    
    @Value("${code.editor.url}")
    private String codeEditorUrl;
    
    @Autowired
    private RestTemplate restTemplate;
    
    public CodeExecutionResult executeCode(String code, String language) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("code", code);
        requestBody.put("language", language);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<CodeExecutionResult> response = restTemplate.postForEntity(
                codeEditorUrl + "/run",
                request,
                CodeExecutionResult.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new CodeExecutionException("Failed to execute code", e);
        }
    }
}
```

### 3. Environment Configuration

#### Production Environment Variables
```bash
# Code Editor Service Configuration
CODE_EDITOR_URL=https://your-code-editor-domain.com
CODE_EDITOR_WS_URL=wss://your-code-editor-domain.com/ws

# CORS Configuration (update with your domains)
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-backend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# Execution Limits
MAX_CONCURRENT_EXECUTIONS=5
MAX_QUEUE_SIZE=10
CODE_SIZE_LIMIT=50000
EXECUTION_TIMEOUT=15000
```

### 4. Load Balancer Configuration

If using a load balancer (AWS ALB, Nginx, etc.), configure it to route traffic:

```nginx
# Nginx configuration example
upstream code_editor {
    server your-code-editor-server:3000;
}

location /api/code-editor/ {
    proxy_pass http://code_editor/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Health Checks

### Service Health Endpoint
```bash
curl https://your-code-editor-domain.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Judge0 server is running",
  "queueLength": 0,
  "activeExecutions": 0
}
```

### Monitoring Integration
- **Prometheus**: Add metrics endpoint for monitoring
- **Grafana**: Create dashboards for code execution metrics
- **Logging**: Centralized logging with ELK stack or similar

## Security Considerations

### CORS Configuration
Ensure proper CORS configuration for your domains:
```javascript
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-backend-domain.com
```

### Rate Limiting
The service includes built-in rate limiting:
- 10 requests per minute per IP
- Configurable limits in environment variables

### Code Execution Security
- Code runs in isolated Docker containers
- Memory and CPU limits enforced
- Execution timeout protection
- Network isolation for security

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGINS` configuration
   - Ensure frontend domain is included

2. **Connection Timeouts**
   - Verify service is running and healthy
   - Check firewall and network configuration

3. **Code Execution Failures**
   - Check Docker daemon is running
   - Verify resource limits are appropriate
   - Review service logs for errors

### Logs and Debugging
```bash
# View service logs
docker-compose -f docker-compose.prod.yml logs code-editor

# Check service status
docker-compose -f docker-compose.prod.yml ps

# Test health endpoint
curl http://localhost:3000/health
```

## Performance Optimization

### Resource Limits
- **Memory**: 1GB limit, 512MB reservation
- **CPU**: 1 core limit, 0.5 core reservation
- **Concurrent Executions**: 5 maximum
- **Queue Size**: 10 maximum

### Scaling Considerations
- Horizontal scaling with load balancer
- Database for persistent storage (if needed)
- Redis for session management (if needed)
- CDN for static assets (if any)

## Support

For issues or questions:
1. Check the service logs
2. Verify configuration
3. Test with the provided test scripts
4. Review this integration guide 