# Image Converter v2

A modern, high-performance image conversion tool built with Node.js. Converts images to WebP and other formats with optional transparency processing.

## Features

- 🚀 **Fast parallel processing** - Convert multiple images simultaneously
- 🎨 **Multiple output formats** - WebP, PNG, JPEG, AVIF
- 🪄 **Smart transparency** - Automatically remove white backgrounds
- 📁 **Flexible file handling** - Process single directories or recursively
- 🎯 **Advanced filtering** - Filter by filename prefix
- 📊 **Progress tracking** - Real-time conversion progress
- 🔍 **Dry run mode** - Preview operations before executing
- 📋 **JSON output** - Machine-readable results for automation

## Installation

```bash
cd v2
npm install
```

## Usage

### Basic usage
```bash
node src/index.js -i ./input -o ./output
```

### With options
```bash
# Convert to PNG with high quality
node src/index.js -i ./photos -o ./converted -f png -q 95

# Recursive processing with prefix filter
node src/index.js -i ./images -o ./webp -r -p "photo_"

# Dry run to preview
node src/index.js -i ./images -o ./output --dry-run

# JSON output for scripting
node src/index.js -i ./images -o ./output --json
```

### Using environment variables
Create a `.env` file (see `.env.example`):
```bash
INPUT_PATH=./images
OUTPUT_PATH=./converted
FORMAT=webp
QUALITY=85
CONCURRENCY=8
```

Then simply run:
```bash
npm start
```

## Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| --input | -i | Input directory path | . |
| --output | -o | Output directory path | ./output |
| --prefix | -p | File prefix filter | (none) |
| --format | -f | Output format (webp/png/jpeg/avif) | webp |
| --quality | -q | Quality (1-100) | 80 |
| --effort | -e | Compression effort (0-6) | 6 |
| --recursive | -r | Process subdirectories | false |
| --concurrency | -c | Parallel conversions | 4 |
| --no-transparency | | Disable white bg removal | false |
| --fuzz | | Transparency threshold % | 20 |
| --dry-run | | Preview without converting | false |
| --json | | Output JSON results | false |
| --verbose | | Detailed logging | false |

## Transparency Processing

The converter intelligently handles transparency:
- Files with 11-character names (plant/line diagrams) are processed with transparency
- White backgrounds are removed using configurable fuzz threshold
- Original alpha channels are preserved

## Performance

v2 improvements over v1:
- **3-5x faster** through parallel processing
- **No ImageMagick dependency** - pure Node.js solution
- **Memory efficient** - streaming for large files
- **Better compression** - optimized format-specific settings

## Migration from v1

Key differences:
1. No shell scripts required
2. New CLI syntax (use flags instead of positional args)
3. More output formats supported
4. Better error handling and progress reporting

To migrate:
```bash
# v1
./convert.sh

# v2
node v2/src/index.js -i $INPUT_PATH -o $OUTPUT_PATH
```