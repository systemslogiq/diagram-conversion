## Image Conversion Tool v2 Implementation Plan

### Project Structure
Create a `v2/` subdirectory with its own package.json and dependencies to keep it separate from the current implementation.

### Key Improvements

1. **Pure Node.js Implementation**
   - Eliminate shell script dependencies
   - Use Sharp for all image processing (transparency + WebP conversion)
   - No need for ImageMagick system dependency

2. **Better Architecture**
   - CLI with proper argument parsing (Commander.js)
   - Configuration via both CLI args and .env file
   - Support for:
     - Recursive directory processing
     - Include/exclude patterns
     - Dry-run mode
     - Progress tracking

3. **Performance Enhancements**
   - Parallel processing with configurable concurrency
   - Stream processing for large files
   - Skip already converted files (cache/checksum)
   - Memory-efficient batch processing

4. **Enhanced Features**
   - Multiple output formats (not just WebP)
   - Configurable transparency detection/removal
   - Better handling of different diagram types
   - Detailed logging and error reporting
   - JSON output mode for automation

### Implementation Steps

1. Create v2 directory structure
2. Initialize new package.json with modern dependencies
3. Implement core conversion module with Sharp
4. Build CLI interface with Commander.js
5. Add parallel processing with p-limit
6. Implement progress tracking with cli-progress
7. Add comprehensive error handling and logging
8. Create test suite
9. Write documentation and migration guide

### Proposed File Structure
```
v2/
├── package.json
├── src/
│   ├── index.js          (CLI entry point)
│   ├── converter.js      (Core conversion logic)
│   ├── config.js         (Configuration handling)
│   ├── utils.js          (Helper functions)
│   └── logger.js         (Logging utilities)
├── test/
│   └── converter.test.js
├── .env.example
└── README.md
```

This approach maintains backward compatibility while providing a modern, efficient solution.