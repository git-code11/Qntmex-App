
// Expo setup script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create app.json for Expo configuration
const appJson = {
  "expo": {
    "name": "Crypto Wallet",
    "slug": "crypto-wallet",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1A202C"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1A202C"
      },
      "package": "com.cryptowallet.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
};

// Create directory structure
const directories = [
  'assets',
  'src/components/native',
  'src/screens'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Create app.json file
fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));
console.log('Created app.json configuration');

// Create basic placeholder images for Expo
const assetPlaceholders = [
  { name: 'icon.png', size: 1024 },
  { name: 'splash.png', size: 1242 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'favicon.png', size: 48 }
];

// Placeholder file for assets that will need to be created later
assetPlaceholders.forEach(({ name, size }) => {
  const filePath = path.join('assets', name);
  if (!fs.existsSync(filePath)) {
    console.log(`Note: You'll need to provide an image for ${filePath} (${size}x${size}px)`);
  }
});

console.log('\nExpo setup complete! Next steps:');
console.log('1. Install Expo CLI: npm install -g expo-cli');
console.log('2. Install Expo packages: npm install expo expo-status-bar @react-navigation/native @react-navigation/stack');
console.log('3. Run the conversion script: node expo-convert.js');
console.log('4. Login to Expo: expo login');
console.log('5. Build your APK: eas build -p android --profile preview');
