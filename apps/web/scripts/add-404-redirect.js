// This script adds client-side redirect logic to 404.html for GitHub Pages
// It handles the case where users visit /problemset without trailing slash

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_PATH = "/lc-rating";
const KNOWN_ROUTES = ["/contest", "/problemset", "/search", "/studyplan"];

const redirectScript = `
<script>
(function() {
  var basePath = "${BASE_PATH}";
  var knownRoutes = ${JSON.stringify(KNOWN_ROUTES)};
  var path = window.location.pathname;
  
  // Remove base path
  var normalizedPath = path.startsWith(basePath) 
    ? path.slice(basePath.length) 
    : path;
  
  // Remove trailing slash for matching
  var pathWithoutTrailingSlash = normalizedPath.replace(/\\/$/, "");
  
  // Check if this is a known route without trailing slash
  if (knownRoutes.includes(pathWithoutTrailingSlash)) {
    var redirectUrl = basePath + pathWithoutTrailingSlash + "/" + window.location.search + window.location.hash;
    window.location.href = redirectUrl;
  }
})();
</script>
`;

function addRedirectTo404(buildDir) {
  const filePath = path.join(buildDir, "404.html");

  if (!fs.existsSync(filePath)) {
    console.error("404.html not found at:", filePath);
    process.exit(1);
  }

  let content = fs.readFileSync(filePath, "utf-8");

  // Add the redirect script right after the opening <head> tag
  content = content.replace("<head>", "<head>" + redirectScript);

  fs.writeFileSync(filePath, content);
  console.log("✅ Added client-side redirect to 404.html");
}

// The script is at apps/web/scripts/, so we need to go up 3 levels to reach the repo root
// From apps/web/scripts/ -> apps/web/ -> apps/ -> repo root
const buildDir = path.resolve(__dirname, "../../../build/apps/web");
addRedirectTo404(buildDir);
