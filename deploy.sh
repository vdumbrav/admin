#!/bin/bash
set -e

echo "🔄 Waitlist Admin Deployment Script"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kill any stuck build processes
echo -e "${BLUE}🛑 Stopping any stuck build processes...${NC}"
pkill -9 -f "docker-compose.*build" 2>/dev/null || true
pkill -9 -f "docker build" 2>/dev/null || true

# Pull latest changes
echo -e "${BLUE}📥 Pulling latest changes from git...${NC}"
git pull origin card-dev

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose down

# Build and start new containers
echo -e "${BLUE}🏗️  Building and starting new containers...${NC}"
docker-compose up -d --build

# Wait a moment for containers to start
sleep 3

# Show container status
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}📊 Container status:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}🎉 Deployment finished successfully!${NC}"
echo -e "${BLUE}💡 To view logs: docker-compose logs -f admin${NC}"
