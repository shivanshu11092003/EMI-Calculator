const fs = require('fs');
const path = require('path');

const wranglerBinPath = path.join(__dirname, '../node_modules/.bin/wrangler');

if (fs.existsSync(wranglerBinPath)) {
  let content = fs.readFileSync(wranglerBinPath, 'utf8');

  // Check if we already patched it with the new build:cf command
  if (!content.includes('Wrangler wrapper: Running bun run build:cf before deploy...')) {
    // Revert the old patch if it exists to avoid duplicate/conflicting patches
    const regex = /if \(module === require\.main\) \{\s*if \(process\.argv\.includes\("deploy"\)\) \{[\s\S]*?\n\t\}\s*/;
    content = content.replace(regex, 'if (module === require.main) {\n');

    const patch = `if (module === require.main) {
	if (process.argv.includes("deploy")) {
		const { execSync } = require("child_process");
		try {
			console.log("Wrangler wrapper: Running bun run build:cf before deploy...");
			// Check if bun is available, otherwise fallback to npm
			let buildCmd = "bun run build:cf";
			try {
				execSync("bun --version", { stdio: "ignore" });
			} catch (err) {
				buildCmd = "npm run build:cf";
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
    console.log('Successfully patched node_modules/.bin/wrangler to run build:cf before deploy.');
  } else {
    console.log('node_modules/.bin/wrangler is already patched with build:cf.');
  }
} else {
  console.warn('Wrangler executable not found in node_modules/.bin/wrangler');
}
