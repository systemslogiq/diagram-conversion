#!/usr/bin/env node

import sharp from 'sharp';
import { ImageConverter } from './src/converter.js';

// Create a simple white background test image
async function createTestImage() {
  const width = 200;
  const height = 200;
  
  // Create a white background with a black circle in the middle
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      <circle cx="${width/2}" cy="${height/2}" r="50" fill="black"/>
      <text x="${width/2}" y="${height/2}" text-anchor="middle" dy=".3em" fill="white" font-size="20">TEST</text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile('./v2/test-input/test-white-bg.png');
    
  console.log('Created test image: ./v2/test-input/test-white-bg.png');
}

// Test the converter
async function testConverter() {
  const converter = new ImageConverter({
    removeWhiteBg: true,
    transparencyFuzz: 20,
    format: 'png'  // PNG to easily see transparency
  });
  
  try {
    await createTestImage();
    
    console.log('Converting with transparency...');
    const result = await converter.convertImage(
      './v2/test-input/test-white-bg.png',
      './v2/test-output'
    );
    
    console.log('Conversion complete!');
    console.log(`Output: ${result.output}`);
    console.log(`Size reduction: ${((1 - result.size.after / result.size.before) * 100).toFixed(1)}%`);
    
    // Check if output has alpha channel
    const metadata = await sharp(result.output).metadata();
    console.log(`Output has alpha channel: ${metadata.hasAlpha}`);
    console.log(`Output channels: ${metadata.channels}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConverter();