const fs = require('fs');
const path = require('path');
const webp = require('webp-converter');

// webp.grant_permission(); // Needed for mac/linux sometimes, safe to call on windows usually.

const inputDir = path.join(__dirname, 'Assets', 'about us');
const outputDir = path.join(__dirname, 'Assets', 'webp');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function convertAll() {
  try {
    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.png'));
    console.log(`Found ${files.length} PNG files. Starting conversion...`);

    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const outputFilename = file.replace('.png', '.webp');
      const outputPath = path.join(outputDir, outputFilename);

      // Convert with quality 75 as requested
      await webp.cwebp(inputPath, outputPath, "-q 75", "-quiet");
      console.log(`Converted: ${outputFilename}`);
    }

    console.log('Successfully converted all images to WebP!');
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

convertAll();
