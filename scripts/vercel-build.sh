#!/bin/bash

echo "🚀 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the main application first
echo "🔨 Building NestJS application..."
npm run build

# Install production dependencies in API folder
echo "📁 Setting up API directory..."
cd api && npm init -y

# Create a minimal package.json for the API
cat > package.json << EOL
{
  "name": "ecommerce-api-serverless",
  "version": "1.0.0",
  "main": "index.ts",
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

cd ..

echo "✅ Vercel build completed successfully!"

# Show structure for debugging
echo "📁 Project structure:"
ls -la
echo "📁 API directory:"
ls -la api/