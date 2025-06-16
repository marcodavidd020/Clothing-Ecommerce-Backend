#!/bin/bash

echo "🚀 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

# Copy package.json to dist for proper dependency resolution
cp package.json dist/

# Create a simple package.json in dist with only runtime dependencies
echo "📝 Creating production package.json..."
cat > dist/package.json << EOL
{
  "name": "ecommerce-api-vercel",
  "version": "1.0.0",
  "main": "main.js",
  "type": "commonjs",
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/swagger": "^11.2.0",
    "@nestjs/typeorm": "^11.0.0",
    "@nestjs/config": "^4.0.2",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.5",
    "typeorm": "^0.3.22",
    "pg": "^8.15.6",
    "bcrypt": "^5.1.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.2",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "joi": "^17.13.3"
  }
}
EOL

echo "✅ Vercel build completed successfully!"

# Show dist contents for debugging
echo "📁 Contents of dist directory:"
ls -la dist/