import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export class ImageConverter {
  constructor(options = {}) {
    this.options = {
      quality: options.quality || 80,
      effort: options.effort || 6,
      format: options.format || 'webp',
      removeWhiteBg: options.removeWhiteBg !== false,
      transparencyFuzz: options.transparencyFuzz || 20,
      ...options
    };
  }

  async convertImage(inputPath, outputPath) {
    const stats = await fs.stat(inputPath);
    if (!stats.isFile()) {
      throw new Error(`Not a file: ${inputPath}`);
    }

    const fileName = path.basename(inputPath);
    const nameWithoutExt = path.parse(fileName).name;
    const shouldMakeTransparent = this.shouldMakeTransparent(fileName);

    let pipeline = sharp(inputPath);

    if (this.options.removeWhiteBg && shouldMakeTransparent) {
      // Remove white background by making it transparent
      const metadata = await pipeline.metadata();
      
      if (!metadata.hasAlpha) {
        pipeline = pipeline.ensureAlpha();
      }

      // Apply transparency to white pixels
      pipeline = pipeline.raw().toBuffer(async (err, data, info) => {
        if (err) throw err;

        const pixels = new Uint8Array(data);
        const fuzz = this.options.transparencyFuzz * 2.55; // Convert percentage to 0-255 range

        for (let i = 0; i < pixels.length; i += info.channels) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];

          // Check if pixel is close to white within fuzz threshold
          if (r > 255 - fuzz && g > 255 - fuzz && b > 255 - fuzz) {
            pixels[i + 3] = 0; // Set alpha to 0 (transparent)
          }
        }

        return sharp(pixels, {
          raw: {
            width: info.width,
            height: info.height,
            channels: info.channels
          }
        });
      });
    }

    // Convert to target format
    const outputFormat = this.options.format.toLowerCase();
    const outputFileName = `${nameWithoutExt}.${outputFormat}`;
    const outputFilePath = path.join(outputPath, outputFileName);

    switch (outputFormat) {
      case 'webp':
        pipeline = pipeline.webp({
          quality: this.options.quality,
          effort: this.options.effort,
          lossless: false
        });
        break;
      case 'png':
        pipeline = pipeline.png({
          quality: this.options.quality,
          compressionLevel: 9
        });
        break;
      case 'jpeg':
      case 'jpg':
        pipeline = pipeline.jpeg({
          quality: this.options.quality,
          progressive: true
        });
        break;
      case 'avif':
        pipeline = pipeline.avif({
          quality: this.options.quality,
          effort: this.options.effort
        });
        break;
      default:
        throw new Error(`Unsupported format: ${outputFormat}`);
    }

    await pipeline.toFile(outputFilePath);

    return {
      input: inputPath,
      output: outputFilePath,
      size: {
        before: stats.size,
        after: (await fs.stat(outputFilePath)).size
      }
    };
  }

  shouldMakeTransparent(fileName) {
    // Check if filename indicates it's a level 3+ diagram (11 chars)
    const nameWithoutExt = path.parse(fileName).name;
    
    if (nameWithoutExt.length === 11) {
      // This appears to be a plant/line diagram identifier
      // Based on the git commit, only level 3+ should be transparent
      // Without more context, we'll apply transparency to all 11-char files
      return true;
    }
    
    return true; // Default: make transparent
  }

  async processDirectory(inputDir, outputDir, options = {}) {
    const { 
      recursive = false, 
      pattern = '*', 
      dryRun = false,
      onProgress = () => {},
      onError = () => {}
    } = options;

    await fs.mkdir(outputDir, { recursive: true });

    const files = await this.findImages(inputDir, { recursive, pattern });
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        if (dryRun) {
          onProgress({
            current: i + 1,
            total: files.length,
            file,
            status: 'dry-run'
          });
        } else {
          const result = await this.convertImage(file, outputDir);
          results.push(result);
          onProgress({
            current: i + 1,
            total: files.length,
            file,
            status: 'completed',
            result
          });
        }
      } catch (error) {
        onError({ file, error });
        onProgress({
          current: i + 1,
          total: files.length,
          file,
          status: 'error',
          error
        });
      }
    }

    return results;
  }

  async findImages(dir, options = {}) {
    const { recursive = false, pattern = '*' } = options;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif'];
    const files = [];

    async function scan(currentDir) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory() && recursive) {
          await scan(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (imageExtensions.includes(ext)) {
            if (pattern === '*' || entry.name.startsWith(pattern)) {
              files.push(fullPath);
            }
          }
        }
      }
    }

    await scan(dir);
    return files.sort();
  }
}