 #!/bin/bash

set -e

echo "🚀 Starting Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs uploads ssl

# Copy environment variables if they don't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  Please update .env file with your configuration"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run migrations
echo "🗄️  Running database migrations..."
docker-compose exec api npm run migration:run

# Run seeders
echo "🌱 Running database seeders..."
docker-compose exec api npm run seed

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "🌐 Services available at:"
echo "   - API: http://localhost:3000"
echo "   - API Docs: http://localhost:3000/api/docs"
echo "   - Health Check: http://localhost:3000/health"
echo ""
echo "🛠️  Management tools (with --profile tools):"
echo "   - PgAdmin: http://localhost:8080"
echo "   - Redis Commander: http://localhost:8081"
echo ""
echo "📋 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart API: docker-compose restart api"
echo ""