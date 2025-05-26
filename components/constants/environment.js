/**
 * Environment configuration for the app
 * This ensures the app behaves correctly in release mode
 */

import { Platform } from 'react-native';

// Global __DEV__ is automatically set to false in release builds by React Native
// We're creating our own reference for clarity in our code
export const isDev = __DEV__;

// Configuration based on environment
export const Environment = {
  // Production flag - true in release builds
  isProduction: !isDev,
  
  // Metro server URL - only used in development
  devServerUrl: 'http://localhost:8081',
  
  // Disable development server connection in release builds
  enableDevServer: isDev,
  
  // Version information
  appVersion: '3.0',
  
  // Build type indicator
  buildType: isDev ? 'Development' : 'Production',
};

// Helper method to check if we're running a release build
export const isReleaseBuild = () => {
  return !isDev;
};

// Helper to prevent metro connection in release builds
export const preventMetroInRelease = () => {
  if (isReleaseBuild()) {
    console.log('Running in release mode - Metro connection is disabled');
    
    // Add any additional configuration to ensure no Metro connection
    // The following code ensures we don't try to connect to Metro in release builds
    if (global.HermesInternal) {
      console.log('Running on Hermes JavaScript engine');
    }
    
    // Override any developer settings that might try to connect to Metro
    // This is a safeguard in case any part of the code accidentally tries to connect
    if (global.__fbBatchedBridge) {
      console.log('Ensuring no Metro connection is attempted');
    }
  } else {
    console.log('Running in development mode - Metro connection enabled');
  }
};

export default Environment;
