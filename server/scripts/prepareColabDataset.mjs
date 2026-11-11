/**
 * CivicLens Colab Dataset Exporter
 * 
 * Quickly resizes and packages the 4,937 high-res (6 GB) images into a compact,
 * fast-to-upload (~75 MB) ZIP file optimized for Google Colab GPU training.
 * 
 * Usage:
 *   node server/scripts/prepareColabDataset.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const datasetDir = path.resolve(__dirname, '../dataset');
const outExportDir = path.resolve(__dirname, '../dataset_colab');

const CLASSES = ['pothole', 'non_pothole', 'garbage', 'non_garbage'];
const VALID_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

async function exportForColab() {
  console.log('====================================================');
  console.log('   CivicLens Colab Dataset Optimization Tool');
  console.log('====================================================');
  console.log(`Input Directory:  ${datasetDir}`);
  console.log(`Output Directory: ${outExportDir}\n`);

  if (!fs.existsSync(outExportDir)) {
    fs.mkdirSync(outExportDir, { recursive: true });
  }

  let totalProcessed = 0;

  for (const cls of CLASSES) {
    const srcFolder = path.join(datasetDir, cls);
    const destFolder = path.join(outExportDir, cls);

    if (!fs.existsSync(srcFolder)) continue;
    if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });

    const files = fs.readdirSync(srcFolder).filter(f => VALID_EXTS.includes(path.extname(f).toLowerCase()));
    console.log(`Processing [${cls}]: ${files.length} images...`);

    // Process in batches of 20 for maximum throughput with sharp
    const BATCH_SIZE = 20;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (file) => {
        const srcPath = path.join(srcFolder, file);
        const destPath = path.join(destFolder, path.parse(file).name + '.jpg');
        
        try {
          await sharp(srcPath)
            .resize(256, 256, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toFile(destPath);
          totalProcessed++;
        } catch (err) {
          // ignore any corrupt raw files
        }
      }));

      if ((i + BATCH_SIZE) % 200 === 0 || i + BATCH_SIZE >= files.length) {
        process.stdout.write(`  Processed ${Math.min(i + BATCH_SIZE, files.length)}/${files.length} images...\r`);
      }
    }
    console.log(`  ✓ Completed [${cls}]                     `);
  }

  console.log(`\n====================================================`);
  console.log(` Successfully optimized ${totalProcessed} images to 256x256!`);
  console.log(` Target folder: ${outExportDir}`);
  console.log(` You can now zip this folder into 'dataset_colab.zip' for instant upload.`);
  console.log('====================================================\n');
}

exportForColab().catch(console.error);
