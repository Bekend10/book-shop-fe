#!/bin/bash

# Vercel Build Script
echo "Starting build for Vercel deployment..."

# Install dependencies
npm ci

# Build the project
npm run build

# Verify build output
if [ -d "dist" ]; then
    echo "Build successful! Output directory created."
    ls -la dist/
else
    echo "Build failed! No dist directory found."
    exit 1
fi

echo "Build completed successfully!"
