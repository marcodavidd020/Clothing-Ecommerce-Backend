#!/bin/bash

echo "🚀 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the NestJS application
echo "🔨 Building NestJS application..."
npm run build

echo "✅ Vercel build completed successfully!"

# Show build results
echo "📁 Build output:"
ls -la dist/