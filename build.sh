#!/bin/bash
set -e

echo "Creating directories..."
mkdir -p temp/src temp/icons chrome

echo "Cleaning directories..."
rm -rf temp/* chrome/*

echo "Copying files..."
cp manifest.json temp/
cp src/*.js src/*.css src/*.html temp/src/
cp icons/*.png temp/icons/

echo "Creating freedium-browser-extension.zip..."
cd temp
zip -r ../chrome/freedium-browser-extension.zip .
cd ..

echo "Cleaning temp..."
rm -rf temp

echo "Done!"
