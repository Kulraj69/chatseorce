#!/bin/bash

# Build the widget
echo "Building widget..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Build failed. Exiting."
  exit 1
fi

# Extract JavaScript from the HTML file
echo "Extracting JavaScript from built HTML..."
node extract-script.js

# Check if extraction was successful
if [ $? -ne 0 ]; then
  echo "JavaScript extraction failed. Exiting."
  exit 1
fi

# Create a deploy directory if it doesn't exist
mkdir -p deploy

# Copy the compiled JavaScript file
echo "Preparing files for deployment..."
cp dist/chat-widget.js deploy/

echo "Widget is ready for deployment in the 'deploy' directory."
echo "File: deploy/chat-widget.js"
echo ""
echo "To embed in a website, add the following code:"
echo ""
echo '<div id="chat-widget-root"></div>'
echo '<script src="https://cdn.yourdomain.com/chat-widget.js" defer></script>'
echo ""
echo "Remember to upload the file to your CDN or hosting provider." 