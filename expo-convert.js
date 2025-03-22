
// Conversion script for React to React Native
const fs = require('fs');
const path = require('path');

console.log('Starting React to React Native conversion...');

// Create App.jsx file for Expo
const appJsx = `import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import WalletScreen from './src/screens/WalletScreen';
import CryptoDetailScreen from './src/screens/CryptoDetailScreen';
import SendScreen from './src/screens/SendScreen';
import ReceiveScreen from './src/screens/ReceiveScreen';
import SwapScreen from './src/screens/SwapScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import auth context
import { AuthProvider } from './src/AuthContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator 
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#1A202C' }
            }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="CryptoDetail" component={CryptoDetailScreen} />
            <Stack.Screen name="Send" component={SendScreen} />
            <Stack.Screen name="Receive" component={ReceiveScreen} />
            <Stack.Screen name="Swap" component={SwapScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}`;

fs.writeFileSync('App.jsx', appJsx);
console.log('Created App.jsx for Expo');

// Create SplashScreen.js for Expo
const splashScreen = `import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../AuthContext';

export default function SplashScreen({ navigation }) {
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      navigation.replace('Wallet');
    }
  }, [user, navigation]);

  return (
    <LinearGradient
      colors={['#1A202C', '#2D3748']}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Crypto Wallet</Text>
        <Text style={styles.subtitle}>Your secure crypto companion</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.outlineButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.outlineButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 40,
    width: '100%',
  },
  button: {
    backgroundColor: '#4299E1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4299E1',
  },
  outlineButtonText: {
    color: '#4299E1',
    fontSize: 18,
    fontWeight: 'bold',
  },
});`;

// Ensure the directory exists
const screenDir = 'src/screens';
if (!fs.existsSync(screenDir)) {
  fs.mkdirSync(screenDir, { recursive: true });
}

fs.writeFileSync(path.join(screenDir, 'SplashScreen.js'), splashScreen);
console.log('Created SplashScreen.js for Expo');

// Create package.json modifications for Expo
const expoPackageJson = {
  "name": "crypto-wallet-mobile",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "eject": "expo eject"
  },
  "dependencies": {
    "@react-navigation/native": "^6.0.10",
    "@react-navigation/stack": "^6.2.1",
    "ethers": "^5.8.0",
    "expo": "~48.0.15",
    "expo-linear-gradient": "~11.3.0",
    "expo-status-bar": "~1.4.4",
    "firebase": "^9.22.0",
    "react": "18.2.0",
    "react-native": "0.71.8",
    "react-native-gesture-handler": "~2.9.0",
    "react-native-safe-area-context": "4.5.0",
    "react-native-screens": "~3.20.0",
    "react-native-svg": "13.4.0",
    "@expo/vector-icons": "^13.0.0",
    "react-native-qrcode-svg": "^6.2.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  },
  "private": true
};

console.log('Created Expo package.json configuration (save this to expo-package.json)');
fs.writeFileSync('expo-package.json', JSON.stringify(expoPackageJson, null, 2));

// Create babel.config.js for Expo
const babelConfig = `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};`;

fs.writeFileSync('babel.config.js', babelConfig);
console.log('Created babel.config.js for Expo');

// Create eas.json for Expo Application Services
const easConfig = `{
  "cli": {
    "version": ">= 3.13.3"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}`;

fs.writeFileSync('eas.json', easConfig);
console.log('Created eas.json for Expo Application Services');

console.log('\nConversion preparation complete!');
console.log(`
Next steps:
1. Backup your current project
2. Install Expo and dependencies: 
   npm install -g expo-cli eas-cli
   npm install
3. Login to Expo: 
   expo login
4. Run the build command: 
   eas build -p android --profile preview
5. Download the APK from the link provided by Expo
`);
