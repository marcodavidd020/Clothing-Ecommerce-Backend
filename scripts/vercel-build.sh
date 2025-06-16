 #!/bin/bash

echo "🚀 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build the application
echo "🔨 Building application..."
npm run build

# Run database migrations
echo "🗄️  Running database migrations..."
if [ "$NODE_ENV" = "production" ]; then
  echo "⚠️  Running in production mode - migrations will be applied"
  npm run migration:run
else
  echo "🔧 Running in development mode - skipping migrations"
fi

# Run seeders only in development or staging
if [ "$NODE_ENV" != "production" ] || [ "$ENABLE_SEEDING" = "true" ]; then
  echo "🌱 Running database seeders..."
  npm run seed
else
  echo "⚠️  Skipping seeders in production (set ENABLE_SEEDING=true to force)"
fi

echo "✅ Vercel build completed successfully!"