#!/bin/bash

# Kipi Customer App - Code Generation Script
# This script runs build_runner to generate code for Freezed models and Riverpod providers

echo "🔨 Starting code generation..."
echo ""

# Navigate to mobile_app directory
cd "$(dirname "$0")"

# Add Flutter to PATH if not already present
export PATH="$PATH:/home/aurum/dev-chetan/kipi-core-app/flutter_sdk/flutter/bin"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
flutter clean
flutter pub get

echo ""
echo "⚙️  Running build_runner..."
echo ""

# Run build_runner
flutter pub run build_runner build --delete-conflicting-outputs

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Code generation completed successfully!"
    echo ""
    echo "Generated files:"
    echo "  - *.freezed.dart (Freezed models)"
    echo "  - *.g.dart (JSON serialization & Riverpod providers)"
    echo ""
else
    echo ""
    echo "❌ Code generation failed!"
    echo "Please check the errors above and fix them."
    echo ""
    exit 1
fi
