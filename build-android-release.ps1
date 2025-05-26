# Bundling script for MobiKlinic React Native App

# Create the assets directory if it doesn't exist
if (-Not (Test-Path -Path ".\android\app\src\main\assets")) {
    Write-Host "Creating assets directory..." -ForegroundColor Green
    New-Item -ItemType Directory -Path ".\android\app\src\main\assets" -Force
}

# Generate the JS bundle for Android
Write-Host "Bundling JavaScript..." -ForegroundColor Green
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Build the release APK
Write-Host "Building release APK..." -ForegroundColor Green
cd android
./gradlew assembleRelease
cd ..

# Display build success message
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build completed successfully!" -ForegroundColor Green
    $apkPath = ".\android\app\build\outputs\apk\release\app-release.apk"
    Write-Host "APK is available at: $apkPath" -ForegroundColor Yellow
} else {
    Write-Host "Build failed." -ForegroundColor Red
}
