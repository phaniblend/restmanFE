const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG content for our RestMan icon
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="256" fill="url(#gradient1)"/>
  
  <!-- Chef Hat -->
  <path d="M256 120c-44.2 0-80 35.8-80 80 0 8.8 1.4 17.3 4 25.2-22.4 8.8-38.4 30.4-38.4 55.8v80c0 17.7 14.3 32 32 32h164.8c17.7 0 32-14.3 32-32v-80c0-25.4-16-47-38.4-55.8 2.6-7.9 4-16.4 4-25.2 0-44.2-35.8-80-80-80z" fill="white"/>
  
  <!-- Chef Hat Band -->
  <rect x="156" y="340" width="200" height="24" rx="12" fill="#f97316"/>
  
  <!-- Restaurant Elements -->
  <circle cx="200" cy="280" r="8" fill="#f97316"/>
  <circle cx="256" cy="280" r="8" fill="#f97316"/>
  <circle cx="312" cy="280" r="8" fill="#f97316"/>
  
  <!-- Sparkle Effects -->
  <path d="M180 160l4 12h12l-10 7 4 12-10-7-10 7 4-12-10-7h12l4-12z" fill="white" opacity="0.8"/>
  <path d="M340 180l3 9h9l-7 5 3 9-8-5-8 5 3-9-7-5h9l3-9z" fill="white" opacity="0.6"/>
  <path d="M160 320l2 6h6l-5 3 2 6-5-3-5 3 2-6-5-3h6l2-6z" fill="white" opacity="0.7"/>
  
  <!-- Gradient Definitions -->
  <defs>
    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ea580c;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>
`;

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  console.log('🎨 Generating PWA icons...');
  
  for (const size of iconSizes) {
    try {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      
      await sharp(Buffer.from(svgIcon))
        .resize(size, size)
        .png({
          quality: 90,
          compressionLevel: 9
        })
        .toFile(outputPath);
        
      console.log(`✅ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error generating ${size}x${size} icon:`, error);
    }
  }
  
  // Generate favicon.ico
  try {
    await sharp(Buffer.from(svgIcon))
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));
      
    console.log('✅ Generated favicon.png');
  } catch (error) {
    console.error('❌ Error generating favicon:', error);
  }
  
  console.log('🚀 All icons generated successfully!');
}

generateIcons().catch(console.error); 