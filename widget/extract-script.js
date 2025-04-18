#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name correctly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the built index.html file
const htmlPath = path.join(__dirname, 'dist', 'index.html');
// Path for the output JavaScript file
const jsOutputPath = path.join(__dirname, 'dist', 'chat-widget.js');

try {
  // Read the HTML file
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  // Extract script content using regex
  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  
  if (!scriptMatch || !scriptMatch[1]) {
    console.error('Could not find script content in the HTML file.');
    process.exit(1);
  }
  
  const scriptContent = scriptMatch[1];
  
  // Add initialization code to the script
  const finalScript = `
// Chat Widget Script
${scriptContent}

// Initialize the widget when the DOM is fully loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  window.initChatWidget();
} else {
  document.addEventListener('DOMContentLoaded', window.initChatWidget);
}
`;
  
  // Write the extracted script to a new file
  fs.writeFileSync(jsOutputPath, finalScript);
  
  console.log(`Successfully extracted script to ${jsOutputPath}`);
} catch (error) {
  console.error('Error extracting script:', error);
  process.exit(1);
} 