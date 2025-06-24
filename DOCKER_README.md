# CodeMentor Docker Setup

This document provides instructions for running CodeMentor using Docker containers.

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM
- Ports 3000, 8080, and 5432 available

## Quick Start (Development)

1. **Clone the repository and navigate to the project root:**
   ```bash
   cd codeMentor
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api/v1
   - Database: localhost:5432

4. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f postgres
   ```

5. **Stop all services:**
   ```bash
   docker-compose down
   ```

## Production Deployment

1. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your production values
   ```

2. **Build and start production services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Access the application:**
   - Application: http://your-domain.com
   - Health check: http://your-domain.com/health

## Service Architecture

### Frontend (React + Vite)
- **Port:** 3000 (dev) / 80 (prod)
- **Technology:** React 18, TypeScript, Vite, shadcn/ui
- **Container:** Multi-stage build with nginx for production

### Backend (Spring Boot)
- **Port:** 8080
- **Technology:** Spring Boot 3.2.3, Java 17, PostgreSQL
- **Container:** Multi-stage build with JRE for production

### Database (PostgreSQL)
- **Port:** 5432
- **Version:** PostgreSQL 15
- **Persistence:** Docker volume for data storage

### Nginx (Production Only)
- **Port:** 80, 443
- **Role:** Reverse proxy with rate limiting and SSL termination

## Environment Variables

### Required for Production
- `DB_PASSWORD`: PostgreSQL password
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: Frontend URL for CORS
- `BACKEND_URL`: Backend URL for frontend API calls

### Optional
- `DB_NAME`: Database name (default: codementor)
- `DB_USER`: Database user (default: postgres)
- `JWT_EXPIRATION`: JWT token expiration in milliseconds

## Docker Commands

### Development
```bash
# Build and start
docker-compose up --build

# Start in background
docker-compose up -d

# Rebuild specific service
docker-compose build frontend
docker-compose build backend

# View logs
docker-compose logs -f [service-name]

# Execute commands in container
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d codementor
```

### Production
```bash
# Build and start production
docker-compose -f docker-compose.prod.yml up -d --build

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Update services
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :8080
   netstat -tulpn | grep :5432
   ```

2. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Connect to database
   docker-compose exec postgres psql -U postgres -d codementor
   ```

3. **Frontend build issues:**
   ```bash
   # Rebuild frontend
   docker-compose build --no-cache frontend
   ```

4. **Backend startup issues:**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Check if database is ready
   docker-compose exec postgres pg_isready -U postgres
   ```

### Performance Optimization

1. **Increase memory limits:**
   ```yaml
   # In docker-compose.yml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 1G
   ```

2. **Enable Docker BuildKit:**
   ```bash
   export DOCKER_BUILDKIT=1
   docker-compose build
   ```

## Security Considerations

1. **Change default passwords** in production
2. **Use strong JWT secrets**
3. **Enable HTTPS** in production
4. **Configure firewall rules**
5. **Regular security updates**

## Monitoring

### Health Checks
- Frontend: http://localhost:3000
- Backend: http://localhost:8080/api/v1/health
- Database: Built-in health check in docker-compose

### Logs
```bash
# Follow all logs
docker-compose logs -f

# Filter logs
docker-compose logs -f | grep ERROR
```

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres codementor > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres codementor < backup.sql
```

### Volume Backup
```bash
# Backup volume
docker run --rm -v codementor_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volume
docker run --rm -v codementor_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
``` 