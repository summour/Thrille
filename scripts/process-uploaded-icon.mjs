import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function processIcon() {
  const publicDir = path.resolve('public');
  const files = fs.readdirSync(publicDir);

  // Look for uploaded icon file
  const candidateNames = [
    'icon-trille0 copy.png',
    'icon-trille0.png',
    'icon-thrille.png',
    'icon-thrille.svg',
    'icon.png'
  ];

  let sourceFile = null;
  for (const name of candidateNames) {
    if (files.includes(name)) {
      // Check if it's a PNG and not one of our generated pwa-* files
      const fullPath = path.join(publicDir, name);
      const stat = fs.statSync(fullPath);
      if (stat.size > 0) {
        sourceFile = fullPath;
        break;
      }
    }
  }

  // Also check for any recently uploaded .png file in public that isn't pwa-* or apple-*
  if (!sourceFile) {
    for (const f of files) {
      if (f.endsWith('.png') && !f.startsWith('pwa-') && !f.startsWith('apple-touch-icon')) {
        sourceFile = path.join(publicDir, f);
        break;
      }
    }
  }

  if (!sourceFile) {
    console.error('No candidate icon found in public/');
    return;
  }

  console.log(`Processing source icon from exact file: ${sourceFile}`);

  const image = sharp(sourceFile);
  const metadata = await image.metadata();
  console.log(`Source format: ${metadata.format}, dimensions: ${metadata.width}x${metadata.height}`);

  // 1. Generate standard PWA icons from the exact file
  await sharp(sourceFile)
    .resize(192, 192, { fit: 'contain', background: { r: 219, g: 31, b: 24, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  await sharp(sourceFile)
    .resize(512, 512, { fit: 'contain', background: { r: 219, g: 31, b: 24, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 2. Generate maskable icon (padded so it doesn't get clipped by circular/squircle masks on Android)
  await sharp(sourceFile)
    .resize(410, 410, { fit: 'contain', background: { r: 219, g: 31, b: 24, alpha: 1 } })
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 219, g: 31, b: 24, alpha: 1 }
    })
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // 3. Apple touch icon (180x180)
  await sharp(sourceFile)
    .resize(180, 180, { fit: 'contain', background: { r: 219, g: 31, b: 24, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('Successfully generated all PWA icons from original file!');
}

processIcon().catch(console.error);
