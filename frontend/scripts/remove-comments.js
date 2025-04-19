import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXTENSIONS = [".js", ".jsx"];
const SRC_DIR = path.join(__dirname, "..", "src");

function removeComments(fileContent) {
  // Remove multi-line comments (/* ... */)
  fileContent = fileContent.replace(/\/\*[\s\S]*?\*\//g, "");

  // Remove single-line comments (// ...) - careful with URLs
  fileContent = fileContent.replace(/(?<!:)\/\/.*$/gm, "");

  // Clean up empty lines
  fileContent = fileContent.replace(/^\s*\n/gm, "");

  // Clean up multiple empty lines
  fileContent = fileContent.replace(/\n{3,}/g, "\n\n");

  return fileContent;
}

function processFile(filePath) {
  console.log(`Processing ${filePath}`);

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const cleanedContent = removeComments(content);

    fs.writeFileSync(filePath, cleanedContent, "utf8");
    console.log(`✅ Cleaned ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

async function processDirectory() {
  try {
    const files = await glob(`${SRC_DIR}/**/*{${EXTENSIONS.join(",")}}`);

    console.log(`Found ${files.length} files to process`);

    files.forEach(processFile);

    console.log("All done! Comments have been removed.");
  } catch (err) {
    console.error("Error finding files:", err);
  }
}

processDirectory();
