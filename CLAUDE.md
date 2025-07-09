# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Node.js utility for converting images to WebP format with optional transparency processing. It uses a hybrid approach combining shell scripts (ImageMagick) with Node.js (Sharp library).

## Development Commands

```bash
# Install dependencies
npm install

# Run the conversion process
npm start
# or
npm run convert

# Alternative: Run shell script directly (faster but larger files)
./convert.sh
```

## Architecture

The application has two conversion methods:

1. **Node.js application (index.js)**:
   - Spawns `make_transparent.sh` to process images with ImageMagick
   - Uses Sharp library to convert to WebP (quality: 60, effort: 6)
   - Makes white backgrounds transparent for most images
   - Diagrams with 11-character filenames (level 3+) get transparency treatment

2. **Shell script (convert.sh)**:
   - Direct ImageMagick conversion to WebP
   - Faster processing but produces larger files
   - Uses 80% quality setting

## Configuration

Create a `.env` file with:
```
INPUT_PATH=path/to/source/images
OUTPUT_PATH=path/to/converted/images
PREFIX=optional_filename_prefix_filter
```

## Key Implementation Details

- **Transparency processing**: Uses ImageMagick with 20% fuzz factor (`convert "$1" -fuzz 20% -transparent white "$2"`)
- **Node version**: Requires Node.js 16 (see .nvmrc)
- **File filtering**: Can process specific files by setting PREFIX in .env
- **Special handling**: Files with 11-character names (plant/line diagrams) are processed differently based on diagram level

## Dependencies

- Node.js dependencies: `sharp`, `dotenv`
- System dependency: ImageMagick (must be installed separately)