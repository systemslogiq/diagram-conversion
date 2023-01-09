const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { spawn } = require("child_process");

require("dotenv").config();

const cmd = spawn(path.resolve(__dirname, "make_transparent.sh"), [
  "-i",
  process.env.INPUT_PATH,
  "-o",
  process.env.OUTPUT_PATH,
  "--startswith",
  process.env.PREFIX,
]);

cmd.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

cmd.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

cmd.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
  convertToWebP(process.env.OUTPUT_PATH);
});

function convertToWebP(filePath) {
  fs.readdir(filePath, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    files.every((file, i) => {
      const inputFile = path.join(filePath, file);
      const fileTypes = [".jpg", ".jpeg", ".png", ".gif"];

      if (!fileTypes.includes(path.parse(file).ext)) {
        return true;
      }

      const outputFile = path.join(
        process.env.OUTPUT_PATH,
        path.parse(file).name + ".webp"
      );

      sharp(inputFile)
        .webp({ quality: 60, effort: 6 })
        .toFile(outputFile)
        .then(() => {
          console.log(`Successfully converted ${file} to ${outputFile}`);
        })
        .catch((error) => {
          console.error(`Error converting ${file}: ${error}`);
        });
      return true;
    });
  });
}
