#!/bin/bash

# Code Editor Service Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="code-editor"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

echo -e "${GREEN}🚀 Starting Code Editor Service Deployment${NC}"

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  $ENV_FILE not found. Creating from template...${NC}"
    cp env.production.example "$ENV_FILE"
    echo -e "${YELLOW}⚠️  Please update $ENV_FILE with your production values${NC}"
    exit 1
fi

# Load environment variables
source "$ENV_FILE"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Pull latest image
echo -e "${GREEN}📥 Pulling latest image...${NC}"
docker-compose -f "$COMPOSE_FILE" pull

# Stop existing service
echo -e "${GREEN}🛑 Stopping existing service...${NC}"
docker-compose -f "$COMPOSE_FILE" down

# Start service
echo -e "${GREEN}▶️  Starting service...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for service to be healthy
echo -e "${GREEN}⏳ Waiting for service to be healthy...${NC}"
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Service is healthy!${NC}"
        break
    fi
    
    echo -n "."
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    echo -e "${RED}❌ Service failed to become healthy within $timeout seconds${NC}"
    docker-compose -f "$COMPOSE_FILE" logs
    exit 1
fi

# Show service status
echo -e "${GREEN}📊 Service Status:${NC}"
docker-compose -f "$COMPOSE_FILE" ps

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Service available at:${NC}"
echo -e "   HTTP API: http://localhost:3000"
echo -e "   WebSocket: ws://localhost:8081"
echo -e "   Health Check: http://localhost:3000/health" 