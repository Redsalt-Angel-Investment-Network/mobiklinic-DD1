# Building a Release APK that doesn't require Metro

When building a React Native app for release/production, the JavaScript bundle should be packaged into the APK so it doesn't need Metro bundler to run on devices. Follow these steps:

## Step 1: Clean your project

```powershell
cd android
./gradlew clean
```

## Step 2: Create a Release Bundle

```powershell
# Option 1: Build an APK
./gradlew assembleRelease

# Option 2: Build an Android App Bundle (preferred for Play Store)
./gradlew bundleRelease
```

## Step 3: Find your Release APK

The generated APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

The generated AAB (Android App Bundle) will be located at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Step 4: Install and Test on a Device

To test the release APK directly on a device:
```powershell
adb install -r app/build/outputs/apk/release/app-release.apk
```

## Important Notes

- The release build bundles all JavaScript code into the APK, so it won't need Metro when running.
- The app might behave differently in release mode because of performance optimizations.
- Always test your release builds on actual devices before distributing them.
- If your app still tries to connect to Metro, make sure you're actually installing the release version, not the debug version.

## Troubleshooting

If your release APK still tries to connect to Metro:

1. Make sure you're actually using the release APK, not a debug build
2. Check that the app's entry point isn't forcing development mode
3. Verify that your app doesn't have any hardcoded development server URLs
4. Check if there are any environment variables setting dev mode to true
