const fs = require('fs');
const path = require('path');

// Source and destination paths
const swSource = path.join(process.cwd(), 'src', 'app', 'sw.js');
const swDest = path.join(process.cwd(), '.next', 'static', 'sw.js');

// Create the destination directory if it doesn't exist
fs.mkdirSync(path.dirname(swDest), { recursive: true });

// Copy the service worker file
fs.copyFileSync(swSource, swDest);

console.log('Service worker copied successfully!'); 