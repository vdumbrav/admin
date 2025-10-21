#!/bin/bash
set -e

echo "🔄 Pulling latest changes from git..."
git pull origin card-dev

echo "🛑 Stopping existing container..."
docker-compose down || true

echo "🏗️  Building new image..."
docker-compose build --no-cache

echo "🚀 Starting container..."
docker-compose up -d

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment complete!"
echo "📊 Container status:"
docker-compose ps
