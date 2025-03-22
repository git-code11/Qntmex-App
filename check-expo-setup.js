
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Checking Expo setup...');

// Check if required directories exist
const requiredDirs = ['assets', 'src/screens', 'src/components/native'];
const missingDirs = [];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    missingDirs.push(dir);
  }
});

if (missingDirs.length > 0) {
  console.log('Creating missing directories:', missingDirs.join(', '));
  missingDirs.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
  });
}

// Check configuration files
const requiredFiles = ['app.json', 'app.config.js'];
const missingFiles = [];

requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('Warning: Missing Expo configuration files:', missingFiles.join(', '));
  console.log('Run node expo-setup.js to create them');
} else {
  console.log('Expo configuration files are present');
}

// Check Expo installation
try {
  const expoVersion = execSync('npx expo --version', { encoding: 'utf8' }).trim();
  console.log('Expo CLI version:', expoVersion);
} catch (error) {
  console.log('Expo CLI not found. Installing required packages...');
  console.log('Run: npm install expo expo-status-bar @react-navigation/native @react-navigation/stack');
}

console.log('\nTo build your APK, follow these steps:');
console.log('1. Login to Expo: npx expo login');
console.log('2. Install EAS CLI: npm install -g eas-cli');
console.log('3. Run: eas build -p android --profile preview');
console.log('\nMake sure your app is running correctly in the web browser before attempting to build the APK.');
