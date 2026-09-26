import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const TARGET_DIRS = ['src/assets', 'src/assets/images'];
const SIZE_THRESHOLD = 500 * 1024; // 500kB

async function compressDirectory(dirPath) {
  const files = await fs.readdir(dirPath, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) continue;
    
    const filePath = path.join(dirPath, file.name);
    const stats = await fs.stat(filePath);
    
    if (stats.size > SIZE_THRESHOLD) {
      const ext = path.extname(file.name).toLowerCase();
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
        console.log(`Compressing: ${filePath} (${(stats.size/1024).toFixed(2)} KB)`);
        const buffer = await fs.readFile(filePath);
        
        let sharpInstance = sharp(buffer);
        
        if (ext === '.png') {
          sharpInstance = sharpInstance.png({ quality: 75, compressionLevel: 9 });
        } else {
          sharpInstance = sharpInstance.jpeg({ quality: 75, progressive: true });
        }
        
        const outputBuffer = await sharpInstance.toBuffer();
        await fs.writeFile(filePath, outputBuffer);
        
        const newStats = await fs.stat(filePath);
        console.log(`  -> New size: ${(newStats.size/1024).toFixed(2)} KB`);
      }
    }
  }
}

async function main() {
  for (const dir of TARGET_DIRS) {
    await compressDirectory(dir);
  }
}

main().catch(console.error);
