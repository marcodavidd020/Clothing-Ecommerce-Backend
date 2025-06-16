 #!/bin/bash

set -e

echo "🚀 Starting Production Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file is required for production deployment"
    echo "Please create .env file with production configuration"
    exit 1
fi

# Validate required environment variables
echo "🔍 Validating environment variables..."
required_vars=(
    "DB_HOST"
    "DB_PASSWORD"
    "JWT_SECRET"
    "REDIS_HOST"
    "REDIS_PASSWORD"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs ssl nginx/conf.d monitoring/prometheus monitoring/grafana/{dashboards,datasources}

# Build production image
echo "🔨 Building production image..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start production services
echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check health
echo "🏥 Checking service health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ API is healthy"
else
    echo "⚠️  API health check failed"
    docker-compose -f docker-compose.prod.yml logs api
fi

echo ""
echo "✅ Production deployment completed!"
echo ""
echo "🌐 Services available at:"
echo "   - API: http://your-domain.com"
echo "   - API Docs: http://your-domain.com/api/docs"
echo "   - Health Check: http://your-domain.com/health"
echo ""
echo "📊 Monitoring (with --profile monitoring):"
echo "   - Prometheus: http://localhost:9090"
echo "   - Grafana: http://localhost:3001"
echo ""
echo "📋 Useful commands:"
echo "   - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "   - Scale API: docker-compose -f docker-compose.prod.yml up -d --scale api=3"
echo ""