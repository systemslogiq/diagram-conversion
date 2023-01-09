## Description

This node application is designed to convert image files in a specified directory to the WebP format. The `make_transparent.sh` script is used to make the images transparent before they are converted to WebP.

## Installation

To use this application, you will need to have [Node.js](https://nodejs.org/) and [imagemagick](https://imagemagick.org/) installed on your system.

### Installing Node.js

To install Node.js, follow the instructions on the [official website](https://nodejs.org/en/download/) or use a package manager like [nvm](https://github.com/nvm-sh/nvm) or [n](https://github.com/tj/n).

### Installing imagemagick

To install imagemagick on a Mac using [homebrew](https://brew.sh/), run the following command:

```bash
brew install imagemagick
```

Next, install application dependencies by running the following command:

```bash
npm install
```

After installation, run the following command to verify installation:

```bash
node -v
imagemagick -v
```

Make the `make_transparent.sh` script executable by running the following command:

```bash
chmod +x make_transparent.sh
```

## Usage

To use the application, you will need to set the following environment variables in a `.env` file located in the root directory of the project:

- `INPUT_PATH`: The path to the directory containing the image files to be converted.
- `OUTPUT_PATH`: The path to the directory where the converted images should be saved.
- `PREFIX`: An optional prefix to filter the image files by (defaults to `*`).

To start the application, run the following command:

```bash
npm start
```

This will run the make_transparent.sh script to make the images in the INPUT_PATH directory transparent, and then convert the transparent images to the WebP format and save them to the OUTPUT_PATH directory.

### Example

For example, if you have a directory of images at /path/to/input and you want to save the converted images to /path/to/output, you could set the environment variables in your .env file as follows:

```bash
INPUT_PATH="/path/to/input"
OUTPUT_PATH="/path/to/output"
PREFIX="999" # the organization code
```

This will only process image files in the /path/to/input directory that have a file name that starts with 999.

Then, you can run the application with the following command:

```bash
npm start
```

This will run the make_transparent.sh script to make the images transparent and then convert them to the WebP format, saving the resulting images to the /path/to/output directory.
