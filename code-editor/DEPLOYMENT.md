# Code Editor Service Deployment Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Git
- Access to a container registry (GitHub Container Registry, Docker Hub, etc.)

### 1. Local Development Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd code-editor

# Install dependencies
npm install

# Copy environment file
cp env.production.example .env.production

# Edit environment variables
nano .env.production

# Start with Docker Compose
docker-compose up -d

# Check service health
curl http://localhost:3000/health
```

### 2. Production Deployment

#### Option A: Docker Compose (Recommended for small deployments)

```bash
# 1. Set up production environment
cp env.production.example .env.production
# Edit .env.production with your production values

# 2. Deploy using the deployment script
./scripts/deploy.sh

# 3. Or manually deploy
docker-compose -f docker-compose.prod.yml up -d
```

#### Option B: Kubernetes Deployment

```bash
# 1. Create namespace
kubectl create namespace code-editor

# 2. Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# 3. Check deployment status
kubectl get pods -n code-editor
kubectl get services -n code-editor
```

#### Option C: Cloud Platform Deployment

##### AWS ECS
```bash
# 1. Build and push image
docker build -t your-registry/code-editor .
docker push your-registry/code-editor

# 2. Deploy to ECS
aws ecs create-service \
  --cluster your-cluster \
  --service-name code-editor \
  --task-definition code-editor-task \
  --desired-count 2
```

##### Google Cloud Run
```bash
# 1. Build and push image
gcloud builds submit --tag gcr.io/your-project/code-editor

# 2. Deploy to Cloud Run
gcloud run deploy code-editor \
  --image gcr.io/your-project/code-editor \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## CI/CD Pipeline

### GitHub Actions (Already configured)

The repository includes a GitHub Actions workflow that:
1. Runs tests on pull requests
2. Builds and pushes Docker images on main branch
3. Deploys to production (configure deployment step)

### Manual CI/CD Steps

```bash
# 1. Build Docker image
docker build -t your-registry/code-editor:latest .

# 2. Push to registry
docker push your-registry/code-editor:latest

# 3. Deploy to production
ssh your-server "cd /path/to/production && docker-compose pull && docker-compose up -d"
```

## Environment Configuration

### Required Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
WS_PORT=8081

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-backend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# Execution Limits
MAX_CONCURRENT_EXECUTIONS=5
MAX_QUEUE_SIZE=10
CODE_SIZE_LIMIT=50000
EXECUTION_TIMEOUT=15000
CPU_TIME_LIMIT=5
MEMORY_LIMIT=512000

# Judge0 API (if using Judge0)
JUDGE0_API=https://judge0-ce.p.rapidapi.com
RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
RAPIDAPI_KEY=your-rapidapi-key
```

### Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Docker Socket**: Ensure proper permissions for Docker socket access
3. **Network Security**: Use firewalls to restrict access
4. **SSL/TLS**: Always use HTTPS in production

## Monitoring and Logging

### Health Checks

```bash
# Check service health
curl https://your-domain.com/health

# Expected response
{
  "status": "healthy",
  "message": "Judge0 server is running",
  "queueLength": 0,
  "activeExecutions": 0
}
```

### Logs

```bash
# View service logs
docker-compose -f docker-compose.prod.yml logs code-editor

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f code-editor

# View logs for specific time period
docker-compose -f docker-compose.prod.yml logs --since="2024-01-01T00:00:00" code-editor
```

### Metrics

The service exposes basic metrics via the health endpoint. For advanced monitoring:

1. **Prometheus**: Add metrics endpoint
2. **Grafana**: Create dashboards
3. **ELK Stack**: Centralized logging

## Scaling

### Horizontal Scaling

```bash
# Scale with Docker Compose
docker-compose -f docker-compose.prod.yml up -d --scale code-editor=3

# Scale with Kubernetes
kubectl scale deployment code-editor --replicas=5 -n code-editor
```

### Load Balancer Configuration

```nginx
# Nginx configuration for multiple instances
upstream code_editor {
    server code-editor-1:3000;
    server code-editor-2:3000;
    server code-editor-3:3000;
}

location /api/code-editor/ {
    proxy_pass http://code_editor/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Troubleshooting

### Common Issues

1. **Service won't start**
   ```bash
   # Check Docker daemon
   docker info
   
   # Check logs
   docker-compose -f docker-compose.prod.yml logs code-editor
   ```

2. **Code execution fails**
   ```bash
   # Check Docker socket permissions
   ls -la /var/run/docker.sock
   
   # Test Docker access
   docker ps
   ```

3. **CORS errors**
   ```bash
   # Check ALLOWED_ORIGINS configuration
   docker-compose -f docker-compose.prod.yml exec code-editor env | grep ALLOWED_ORIGINS
   ```

4. **High memory usage**
   ```bash
   # Check container resource usage
   docker stats
   
   # Adjust memory limits in docker-compose.prod.yml
   ```

### Performance Tuning

1. **Resource Limits**: Adjust CPU and memory limits based on usage
2. **Concurrent Executions**: Increase `MAX_CONCURRENT_EXECUTIONS` if needed
3. **Queue Size**: Increase `MAX_QUEUE_SIZE` for high traffic
4. **Timeout Settings**: Adjust `EXECUTION_TIMEOUT` based on code complexity

## Backup and Recovery

### Data Backup

The service is stateless, but consider backing up:
- Environment configuration
- Docker images
- Log files

### Disaster Recovery

1. **Image Backup**: Export Docker images
   ```bash
   docker save your-registry/code-editor:latest > code-editor-backup.tar
   ```

2. **Configuration Backup**: Backup environment files
   ```bash
   cp .env.production .env.production.backup
   ```

3. **Recovery Process**:
   ```bash
   # Restore image
   docker load < code-editor-backup.tar
   
   # Restore configuration
   cp .env.production.backup .env.production
   
   # Redeploy
   ./scripts/deploy.sh
   ```

## Support

For deployment issues:
1. Check the logs: `docker-compose logs code-editor`
2. Verify configuration: `docker-compose config`
3. Test connectivity: `curl http://localhost:3000/health`
4. Review this deployment guide
5. Check the integration guide: `INTEGRATION.md` 