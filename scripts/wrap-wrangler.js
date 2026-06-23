const fs = require('fs');
const path = require('path');

const wranglerBinPath = path.join(__dirname, '../node_modules/.bin/wrangler');

if (fs.existsSync(wranglerBinPath)) {
  let content = fs.readFileSync(wranglerBinPath, 'utf8');

  // Check if we already patched it
  if (!content.includes('Wrangler wrapper: Running bun run build before deploy...')) {
    const patch = `
if (module === require.main) {
	if (process.argv.includes("deploy")) {
		const { execSync } = require("child_process");
		try {
			console.log("Wrangler wrapper: Running bun run build before deploy...");
			// Check if bun is available, otherwise fallback to npm
			let buildCmd = "bun run build";
			try {
				execSync("bun --version", { stdio: "ignore" });
			} catch (err) {
				buildCmd = "npm run build";
			}
			execSync(buildCmd, { stdio: "inherit" });
		} catch (e) {
			console.error("Wrangler wrapper: Build failed", e);
			process.exit(1);
		}
	}
`;
    // Replace the standard 'if (module === require.main) {' entrypoint
    content = content.replace('if (module === require.main) {', patch);
    fs.writeFileSync(wranglerBinPath, content, 'utf8');
    console.log('Successfully patched node_modules/.bin/wrangler to run build before deploy.');
  } else {
    console.log('node_modules/.bin/wrangler is already patched.');
  }
} else {
  console.warn('Wrangler executable not found in node_modules/.bin/wrangler');
}
