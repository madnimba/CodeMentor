# Code Editor Integration Guide

## Overview
The Code Editor service has been successfully integrated into the main CodeMentor deployment. It runs as a separate container but is managed together with frontend and backend services.

## Service Architecture

### Integrated Services
- **Frontend**: React application (Port 80 via Nginx)
- **Backend**: Spring Boot API (Port 8080)
- **Code Editor**: Node.js service (Port 3000 HTTP, 8081 WebSocket)
- **Database**: PostgreSQL (Port 5432)
- **Nginx**: Reverse proxy (Port 80, 443)

### Code Editor Endpoints
- **HTTP API**: `https://your-domain.com/code-editor/`
- **WebSocket**: `wss://your-domain.com/code-editor-ws/`
- **Health Check**: `https://your-domain.com/code-editor/health`

## Deployment

### Single Command Deployment
```bash
# Deploy all services including code-editor
docker-compose -f docker-compose.prod.yml up -d
```

### Individual Service Management
```bash
# View all services
docker-compose -f docker-compose.prod.yml ps

# View code-editor logs
docker-compose -f docker-compose.prod.yml logs code-editor

# Restart only code-editor
docker-compose -f docker-compose.prod.yml restart code-editor

# Scale code-editor (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale code-editor=2
```

## Frontend Integration

### Environment Variables
Add to your frontend environment:
```javascript
// .env or environment configuration
VITE_CODE_EDITOR_URL=https://your-domain.com/code-editor
VITE_CODE_EDITOR_WS_URL=wss://your-domain.com/code-editor-ws
```

### API Integration Example
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

## Backend Integration

### Environment Variables
Add to your backend environment:
```properties
# application.properties or environment variables
CODE_EDITOR_URL=https://your-domain.com/code-editor
CODE_EDITOR_WS_URL=wss://your-domain.com/code-editor-ws
```

### Backend Integration Example (Java/Spring)
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

## Environment Configuration

### Required Environment Variables
```bash
# Copy from env.example and update
cp env.example .env

# Required variables (already in env.example)
DB_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://your-domain.com/api/v1

# Optional: Judge0 API for code execution
JUDGE0_API=https://judge0-ce.p.rapidapi.com
RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
RAPIDAPI_KEY=your-rapidapi-key
```

## CI/CD Integration

### Automated Deployment
The code-editor is now included in the main CI/CD pipeline:

1. **On push to main branch:**
   - Tests run for backend, frontend, and code-editor
   - Docker images are built and pushed to Docker Hub
   - All services are deployed to Azure VM

2. **Deployment includes:**
   - `codementor-backend-prod`
   - `codementor-frontend-prod`
   - `codementor-code-editor-prod`
   - `codementor-postgres-prod`
   - `codementor-nginx`

### Manual Deployment
```bash
# Build and deploy locally
docker-compose -f docker-compose.prod.yml up -d --build

# Pull latest images and deploy
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Health Checks

### Service Health Endpoints
```bash
# Frontend health
curl https://your-domain.com/health

# Backend health
curl https://your-domain.com/api/v1/health

# Code editor health
curl https://your-domain.com/code-editor/health
```

### Expected Code Editor Response
```json
{
  "status": "healthy",
  "message": "Judge0 server is running",
  "queueLength": 0,
  "activeExecutions": 0
}
```

## Monitoring and Logs

### View All Service Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f code-editor
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Service Status
```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Check specific service
docker-compose -f docker-compose.prod.yml ps code-editor
```

## Troubleshooting

### Common Issues

1. **Code Editor Not Starting**
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs code-editor
   
   # Check Docker socket permissions
   ls -la /var/run/docker.sock
   ```

2. **CORS Errors**
   - Ensure `FRONTEND_URL` is set correctly in `.env`
   - Check that frontend domain is included in `ALLOWED_ORIGINS`

3. **Code Execution Failures**
   ```bash
   # Check if Docker daemon is accessible
   docker-compose -f docker-compose.prod.yml exec code-editor docker ps
   
   # Check resource limits
   docker stats
   ```

4. **Network Connectivity**
   ```bash
   # Test internal communication
   docker-compose -f docker-compose.prod.yml exec backend curl http://code-editor:3000/health
   ```

### Performance Tuning

1. **Resource Limits**: Adjust in `docker-compose.prod.yml`
2. **Concurrent Executions**: Modify environment variables
3. **Queue Size**: Increase for high traffic
4. **Timeout Settings**: Adjust based on code complexity

## Security Considerations

1. **Docker Socket Access**: Code-editor needs access to Docker daemon
2. **Network Isolation**: Services communicate via internal Docker network
3. **Rate Limiting**: Built-in rate limiting on code-editor
4. **CORS Configuration**: Properly configured for your domains

## Support

For issues:
1. Check service logs
2. Verify environment configuration
3. Test health endpoints
4. Review this integration guide
5. Check the main `DOCKER_README.md` 