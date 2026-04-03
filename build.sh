#!/bin/bash
set -e

echo "Building React app..."
npm install
npm run build

echo "Build complete!"
