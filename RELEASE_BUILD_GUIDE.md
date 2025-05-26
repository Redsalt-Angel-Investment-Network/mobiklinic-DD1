# Building a Release APK for MobiKlinic

This document explains how to build a production release APK for MobiKlinic that doesn't require Metro bundler to run.

## Understanding Debug vs Release Builds

React Native has two main build types:

1. **Debug builds**: Used during development, these connect to the Metro bundler for hot reloading and debugging. They require Metro to be running.

2. **Release builds**: Production-ready builds that bundle all JavaScript code into the APK. These don't need Metro to run.

When you use `npm run android` or `yarn android`, it creates a debug build by default.

## Building a Release APK

### Option 1: Using the provided script

We've created a PowerShell script to simplify the release build process:

```powershell
.\build-android-release.ps1
```

This script:
- Creates the assets directory if it doesn't exist
- Bundles the JavaScript code into the APK
- Builds the release APK
- Places the final APK at `.\android\app\build\outputs\apk\release\app-release.apk`

### Option 2: Manual process

If you prefer to do it manually, follow these steps:

1. First, bundle the JavaScript:

```powershell
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

2. Then build the APK:

```powershell
cd android
./gradlew assembleRelease
cd ..
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

## Installing the Release APK on a device

To install the release APK on a connected device:

```powershell
cd android
./gradlew installRelease
cd ..
```

Or using ADB:

```powershell
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Troubleshooting

If your release APK still attempts to connect to Metro, check:

1. Make sure you're using the correct release APK, not the debug version
2. Verify that JavaScript is properly bundled into the APK
3. Check that your app code isn't forcing development mode

## Creating an App Bundle for Play Store

If you want to create an Android App Bundle (AAB) for the Play Store:

```powershell
cd android
./gradlew bundleRelease
cd ..
```

The AAB will be at `android/app/build/outputs/bundle/release/app-release.aab`.
