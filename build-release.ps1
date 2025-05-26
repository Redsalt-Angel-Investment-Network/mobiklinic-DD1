# Build release APK for MobiKlinic
# This script builds a release APK that doesn't require Metro bundler

# Clean the project first to ensure we have a fresh build
Write-Host "Cleaning the Android project..." -ForegroundColor Green
cd android
.\gradlew clean
cd ..

# Create the bundle directory if it doesn't exist
$bundleDir = ".\android\app\src\main\assets"
if (!(Test-Path $bundleDir)) {
    Write-Host "Creating bundle directory..." -ForegroundColor Green
    New-Item -ItemType Directory -Path $bundleDir -Force
}

# Bundle the JavaScript code
Write-Host "Bundling JavaScript code..." -ForegroundColor Green
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Build the release APK
Write-Host "Building release APK..." -ForegroundColor Green
cd android
.\gradlew assembleRelease
cd ..

# Check if build was successful
$apkPath = ".\android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apkPath) {
    Write-Host "Release APK built successfully!" -ForegroundColor Green
    Write-Host "APK Location: $apkPath" -ForegroundColor Cyan
    
    $installPrompt = Read-Host "Would you like to install the APK on a connected device? (Y/N)"
    if ($installPrompt -eq "Y" -or $installPrompt -eq "y") {
        Write-Host "Installing APK on connected device..." -ForegroundColor Green
        adb install -r $apkPath
    }
} else {
    Write-Host "Failed to build release APK. Check the logs above for errors." -ForegroundColor Red
}
