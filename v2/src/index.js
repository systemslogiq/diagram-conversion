#!/usr/bin/env node

import { Command } from 'commander';
import { config } from 'dotenv';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import pLimit from 'p-limit';
import path from 'path';
import { ImageConverter } from './converter.js';
import { logger } from './logger.js';

// Load environment variables
config();

const program = new Command();

program
  .name('convert-images')
  .description('Convert images to WebP or other formats with optional transparency processing')
  .version('2.0.0')
  .option('-i, --input <path>', 'Input directory path', process.env.INPUT_PATH || '.')
  .option('-o, --output <path>', 'Output directory path', process.env.OUTPUT_PATH || './output')
  .option('-p, --prefix <prefix>', 'File prefix filter', process.env.PREFIX || '')
  .option('-f, --format <format>', 'Output format (webp, png, jpeg, avif)', process.env.FORMAT || 'webp')
  .option('-q, --quality <number>', 'Quality (1-100)', parseInt(process.env.QUALITY) || 80)
  .option('-e, --effort <number>', 'Compression effort (0-6)', parseInt(process.env.EFFORT) || 6)
  .option('-r, --recursive', 'Process subdirectories recursively', process.env.RECURSIVE === 'true')
  .option('-c, --concurrency <number>', 'Number of parallel conversions', parseInt(process.env.CONCURRENCY) || 4)
  .option('--no-transparency', 'Disable white background removal')
  .option('--fuzz <number>', 'Transparency fuzz percentage', parseInt(process.env.TRANSPARENCY_FUZZ) || 20)
  .option('--dry-run', 'Show what would be converted without doing it', process.env.DRY_RUN === 'true')
  .option('--json', 'Output results as JSON')
  .option('--verbose', 'Enable verbose logging')
  .parse();

const options = program.opts();

async function main() {
  try {
    if (!options.json) {
      console.log(chalk.blue.bold('🖼️  Image Converter v2.0'));
      console.log(chalk.gray('━'.repeat(50)));
      console.log(chalk.gray(`Input:  ${options.input}`));
      console.log(chalk.gray(`Output: ${options.output}`));
      console.log(chalk.gray(`Format: ${options.format.toUpperCase()} (Quality: ${options.quality})`));
      if (options.prefix) {
        console.log(chalk.gray(`Filter: ${options.prefix}*`));
      }
      console.log(chalk.gray('━'.repeat(50)));
    }

    const converter = new ImageConverter({
      quality: options.quality,
      effort: options.effort,
      format: options.format,
      removeWhiteBg: options.transparency,
      transparencyFuzz: options.fuzz
    });

    // Find all images
    const files = await converter.findImages(options.input, {
      recursive: options.recursive,
      pattern: options.prefix
    });

    if (files.length === 0) {
      if (options.json) {
        console.log(JSON.stringify({ error: 'No images found', count: 0 }));
      } else {
        console.log(chalk.yellow('⚠️  No images found matching criteria'));
      }
      return;
    }

    if (!options.json) {
      console.log(chalk.green(`Found ${files.length} images to process\n`));
    }

    if (options.dryRun && !options.json) {
      console.log(chalk.yellow('🔍 DRY RUN MODE - No files will be converted\n'));
      files.forEach(file => {
        console.log(chalk.gray(`  Would convert: ${path.relative(options.input, file)}`));
      });
      return;
    }

    // Progress bar
    let progressBar;
    if (!options.json && !options.verbose) {
      progressBar = new cliProgress.SingleBar({
        format: 'Converting |' + chalk.cyan('{bar}') + '| {percentage}% | {current}/{total} | {filename}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });
      progressBar.start(files.length, 0, { filename: 'Starting...' });
    }

    // Process files with concurrency limit
    const limit = pLimit(options.concurrency);
    const results = [];
    const errors = [];

    const tasks = files.map((file, index) => 
      limit(async () => {
        try {
          const result = await converter.convertImage(file, options.output);
          results.push(result);
          
          if (progressBar) {
            progressBar.update(index + 1, { 
              filename: path.basename(file) 
            });
          } else if (options.verbose && !options.json) {
            const reduction = ((1 - result.size.after / result.size.before) * 100).toFixed(1);
            console.log(chalk.green(`✓ ${path.basename(file)} → ${path.basename(result.output)} (${reduction}% smaller)`));
          }
        } catch (error) {
          errors.push({ file, error: error.message });
          if (options.verbose && !options.json) {
            console.log(chalk.red(`✗ ${path.basename(file)}: ${error.message}`));
          }
        }
      })
    );

    await Promise.all(tasks);

    if (progressBar) {
      progressBar.stop();
    }

    // Summary
    if (options.json) {
      console.log(JSON.stringify({
        success: results.length,
        errors: errors.length,
        results: results.map(r => ({
          input: r.input,
          output: r.output,
          sizeBefore: r.size.before,
          sizeAfter: r.size.after,
          reduction: ((1 - r.size.after / r.size.before) * 100).toFixed(1)
        })),
        errors
      }, null, 2));
    } else {
      console.log(chalk.gray('\n━'.repeat(50)));
      console.log(chalk.green.bold(`✅ Conversion complete!`));
      console.log(chalk.gray(`   Successful: ${results.length}`));
      if (errors.length > 0) {
        console.log(chalk.red(`   Failed: ${errors.length}`));
      }
      
      if (results.length > 0) {
        const totalBefore = results.reduce((sum, r) => sum + r.size.before, 0);
        const totalAfter = results.reduce((sum, r) => sum + r.size.after, 0);
        const totalReduction = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
        console.log(chalk.gray(`   Total size reduction: ${totalReduction}%`));
      }
    }

  } catch (error) {
    if (options.json) {
      console.log(JSON.stringify({ error: error.message }));
    } else {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
    }
    process.exit(1);
  }
}

main();