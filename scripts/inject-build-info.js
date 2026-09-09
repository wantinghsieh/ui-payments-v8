/**
 * Build Info Injection Script
 *
 * Injects build information into the built HTML file and optionally creates root v8-release.txt
 * This script should be run after the React build completes.
 */

const fs = require("fs");
const path = require("path");
const pkg = require("../package.json");

function getJenkinsVersion() {
  const match = process.argv.find((arg) => /jenkinsVersion=/.test(arg));
  if (match) {
    const [, version] = match.split("=");
    return version;
  }
  return "unknown";
}

function extractUI8Version() {
  const ui8Version = pkg.dependencies["@cox/core-ui8"];
  if (!ui8Version) {
    return "N/A";
  }
  return ui8Version.replace(/^[\^~>=<]+/, "").trim();
}

function getBuildDate() {
  const now = new Date();
  return now.toString().split(" GMT")[0];
}

function getAppName() {
  try {
    // Try to read from build.properties first
    const buildPropsPath = path.resolve(__dirname, "..", "build.properties");
    if (fs.existsSync(buildPropsPath)) {
      const content = fs.readFileSync(buildPropsPath, "utf8");
      const match = content.match(/appname=([^\r\n]+)/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch (error) {
    console.log(
      "⚠️ Could not read appname from build.properties, using package name"
    );
  }

  // Fallback to package name
  return pkg.name;
}

function createBuildInfo(jenkinsVersion) {
  return {
    appName: getAppName(),
    appVersion: pkg.version,
    buildDate: getBuildDate(),
    jenkinsVersion: jenkinsVersion,
    releaseTag: jenkinsVersion,
    ui8BaseTag: extractUI8Version(),
    uicore: pkg.dependencies["@cox/core-ui8"] || "N/A",
    name: pkg.name,
    timestamp: new Date().toISOString(),
  };
}

function injectBuildInfoIntoHTML(buildInfo) {
  const buildHtmlPath = path.resolve(__dirname, "..", "build", "index.html");

  if (!fs.existsSync(buildHtmlPath)) {
    throw new Error(
      "build/index.html not found. Make sure to run the React build first."
    );
  }

  const html = fs.readFileSync(buildHtmlPath, "utf8");

  const injected = html.replace(
    "</head>",
    `  <script>window.__BUILD_INFO__=${JSON.stringify(buildInfo, null, 2)};</script>\n</head>`
  );

  fs.writeFileSync(buildHtmlPath, injected, "utf8");
  console.log("✅ Injected build info into build/index.html");
}

function createRootReleaseFile(buildInfo) {
  const rootFilePath = path.resolve(__dirname, "..", "v8-release.txt");

  const content = `Build-Date: ${buildInfo.buildDate}
Release-Tag: ${buildInfo.releaseTag}
UI8-Base-Tag: ${buildInfo.ui8BaseTag}`;

  fs.writeFileSync(rootFilePath, content, "utf8");
  console.log("✅ Created v8-release.txt in project root");
}

// Add these two new functions
function copyToStaticDirectory(buildInfo) {
  try {
    const staticDir = path.resolve(__dirname, "..", "build", "static");

    // Create static directory if it doesn't exist
    if (!fs.existsSync(staticDir)) {
      fs.mkdirSync(staticDir, { recursive: true });
    }

    const staticFilePath = path.resolve(staticDir, "release.txt");

    const content = `Build-Date: ${buildInfo.buildDate}
Release-Tag: ${buildInfo.releaseTag}
UI8-Base-Tag: ${buildInfo.ui8BaseTag}`;

    fs.writeFileSync(staticFilePath, content, "utf8");
    console.log("✅ Copied release.txt to build/static directory");
  } catch (error) {
    console.log(`⚠️ Could not copy to build/static: ${error.message}`);
  }
}

function copyToStorybookDirectory(buildInfo) {
  try {
    const storybookDir = path.resolve(__dirname, "..", "storybook-static");

    // Only proceed if storybook-static directory exists
    if (fs.existsSync(storybookDir)) {
      const storybookFilePath = path.resolve(storybookDir, "release.txt");

      const content = `Build-Date: ${buildInfo.buildDate}
Release-Tag: ${buildInfo.releaseTag}
UI8-Base-Tag: ${buildInfo.ui8BaseTag}`;

      fs.writeFileSync(storybookFilePath, content, "utf8");
      console.log("✅ Copied release.txt to storybook-static directory");
    } else {
      console.log(
        "ℹ️ Skipping storybook-static copy: directory does not exist"
      );
    }
  } catch (error) {
    console.log(`⚠️ Could not copy to storybook-static: ${error.message}`);
  }
}

function main() {
  try {
    const jenkinsVersion = getJenkinsVersion();
    const isJenkinsBuild = jenkinsVersion !== "unknown";

    // console.log(`🔧 Processing build info...`);
    // console.log(`   Jenkins Version: ${jenkinsVersion}`);
    // console.log(`   Is Jenkins Build: ${isJenkinsBuild}`);

    const buildInfo = createBuildInfo(jenkinsVersion);
    // console.log(`   App Name: ${buildInfo.appName}`);
    // console.log(`   Build Date: ${buildInfo.buildDate}`);
    // console.log(`   UI8 Version: ${buildInfo.ui8BaseTag}`);

    injectBuildInfoIntoHTML(buildInfo);

    copyToStaticDirectory(buildInfo);
    copyToStorybookDirectory(buildInfo);

    if (isJenkinsBuild) {
      createRootReleaseFile(buildInfo);
      console.log(
        "🎯 Jenkins build detected - created root v8-release.txt file"
      );
    } else {
      console.log("🏠 Development build - skipping root file creation");
    }

    console.log("✅ Build info injection completed successfully");
  } catch (error) {
    console.error("❌ Build info injection failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getJenkinsVersion,
  extractUI8Version,
  getBuildDate,
  getAppName,
  createBuildInfo,
  injectBuildInfoIntoHTML,
  createRootReleaseFile,
  copyToStaticDirectory,
  copyToStorybookDirectory,
  main,
};
