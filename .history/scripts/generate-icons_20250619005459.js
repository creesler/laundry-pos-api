const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#1976d2';
  ctx.fillRect(0, 0, size, size);

  // Add text
  ctx.fillStyle = '#ffffff';
  ctx.font = `${size/4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LK', size/2, size/2);

  return canvas.toBuffer('image/png');
}

// Generate icons
[192, 512].forEach(size => {
  const buffer = generateIcon(size);
  fs.writeFileSync(`public/icons/icon-${size}x${size}.png`, buffer);
});

// Generate screenshot
const screenshotCanvas = createCanvas(1080, 2340);
const ctx = screenshotCanvas.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, 1080, 2340);
ctx.fillStyle = '#1976d2';
ctx.font = '48px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Laundry King POS', 1080/2, 2340/2);
fs.writeFileSync('public/screenshots/app-screenshot.png', screenshotCanvas.toBuffer('image/png')); 