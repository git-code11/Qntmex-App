
# Building Your Crypto Wallet as a Native App

This guide will walk you through converting your React web app into a native Android application using Expo.

## Prerequisites

Before starting, ensure you have:

- Node.js (v14 or newer)
- npm or yarn
- Expo account (sign up at https://expo.dev)
- Your React crypto wallet codebase

## Step-by-Step Process

### 1. Set Up Expo Environment

```bash
# Install required tools
npm install -g expo-cli eas-cli

# Run the setup script
node expo-setup.js

# Install core dependencies
npm install expo expo-status-bar @react-navigation/native @react-navigation/stack react-native-gesture-handler react-native-screens react-native-safe-area-context
npm install expo-linear-gradient @expo/vector-icons react-native-svg react-native-qrcode-svg
```

### 2. Run the Conversion Script

```bash
node expo-convert.js
```

This script creates:
- Basic Expo configuration files
- App.jsx with navigation setup
- Screen templates starting with SplashScreen

### 3. Create Assets

Place your app icons in the `assets` folder:
- icon.png (1024×1024)
- splash.png (1242×2436)
- adaptive-icon.png (1024×1024)
- favicon.png (48×48)

### 4. Login to Expo

```bash
expo login
```

Enter your Expo credentials when prompted.

### 5. Configure EAS Build

The eas.json file is automatically created with configurations for:
- Development builds
- Preview builds (APK)
- Production builds

### 6. Build Your APK

```bash
eas build -p android --profile preview
```

This will:
1. Upload your code to Expo's build servers
2. Compile your app into an Android APK
3. Provide a download link when complete

### 7. Install on Android Device

- Download the APK from the link provided
- Transfer to your Android device
- Install and test your app

## Troubleshooting

If you encounter build errors:

1. Check the Expo build logs
2. Verify all dependencies are compatible with React Native
3. Make sure your Firebase configuration works with React Native

## Next Steps

After successfully building your APK:

1. Test all app features thoroughly
2. Refine the UI for mobile devices
3. Consider publishing to Google Play Store using `eas build -p android --profile production`

For more information, visit the [Expo documentation](https://docs.expo.dev/).
