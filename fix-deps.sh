#!/bin/bash

echo "🔧 HyperCart Lab - Dependency Fix Script"
echo "=========================================="
echo ""

echo "Step 1: Removing node_modules and lock files..."
rm -rf node_modules package-lock.json

echo "✅ Cleaned up old dependencies"
echo ""

echo "Step 2: Clearing npm cache..."
npm cache clean --force

echo "✅ Cache cleared"
echo ""

echo "Step 3: Reinstalling dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🚀 You can now run: npm run dev"
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    echo ""
    echo "Alternative: Try using pnpm"
    echo "  npm install -g pnpm"
    echo "  pnpm install"
fi
