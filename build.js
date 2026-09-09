const fs = require('fs');
const path = require('path');
const moment= require('moment');

// Ensure the /webpack-build/ directory exists
const dir = path.join(__dirname, 'public');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}
const args = process.argv.slice(1);
try{
    const jenkinsArg = args.find(arg => arg.startsWith('--jenkinsVersion'));
    if (!jenkinsArg) {
        throw new Error('Error: --jenkinsVersion argument is missing');
    }
    const jenkinsversion = jenkinsArg.split('=')[1];

    const packageJsonPath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        throw new Error('Error: package.json file is missing')
    }
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
    const coreUiVersionRaw = packageJson.dependencies?.['@cox/core-ui8'] || 'Version not found';
    const coreUiVersion = coreUiVersionRaw.replace('^', '');

    const content = `Build-Date: ${moment().format('ddd MMM DD YYYY HH:mm:ss')}\nRelease-Tag: ${jenkinsversion}\nUI-Core-Tag: ${coreUiVersion}`;
    // Write the content to a file
    const filePath = path.join(dir, 'release.txt');
    fs.writeFileSync(filePath, content, 'utf8');
} catch (err){
    console.error(err);
}