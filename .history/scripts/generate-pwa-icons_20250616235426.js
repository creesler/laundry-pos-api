const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Base SVG icon - a simple washing machine icon
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#1976d2"/>
  <circle cx="256" cy="256" r="160" fill="white" stroke="white" stroke-width="20"/>
  <circle cx="256" cy="256" r="120" stroke="white" stroke-width="20" fill="none"/>
  <circle cx="256" cy="256" r="80" fill="#1976d2"/>
</svg>
`;

// Save the SVG to a temporary file
const tempSvgPath = path.join(ICONS_DIR, 'temp.svg');
fs.writeFileSync(tempSvgPath, svgIcon);

// Generate different sizes
const sizes = [192, 512];

Promise.all(
  sizes.map(size => 
    sharp(tempSvgPath)
      .resize(size, size)
      .png()
      .toFile(path.join(ICONS_DIR, `icon-${size}x${size}.png`))
  )
)
.then(() => {
  // Clean up temporary SVG file
  fs.unlinkSync(tempSvgPath);
  console.log('PWA icons generated successfully!');
})
.catch(err => {
  console.error('Error generating icons:', err);
}); 