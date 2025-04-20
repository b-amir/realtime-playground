import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import glob from 'glob';
import { promisify } from "util";

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

function processDirectory() {
  try {
    const pattern = `${SRC_DIR}/**/*{${EXTENSIONS.join(",")}}`;
    console.log(`Using glob pattern: ${pattern}`);
    
    const files = glob.sync(pattern);
    
    console.log(`Glob result type: ${typeof files}`);
    console.log(`Glob result:`, files);

    if (!Array.isArray(files)) {
      console.error("Glob.sync did not return an array! Cannot process files.");
      return;
    }

    console.log(`Found ${files.length} files to process`);
    files.forEach(processFile);
    console.log("All done! Comments have been removed.");
  } catch (err) {
    console.error("Error during glob sync processing:", err);
  }
}

processDirectory();
