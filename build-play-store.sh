#!/bin/bash

echo "========================================"
echo " SunoBolo English - Play Store Builder"
echo "========================================"
echo

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo "❌ Java JDK not found!"
    echo
    echo "Please install Android Studio from:"
    echo "https://developer.android.com/studio"
    echo
    echo "Or install JDK 17 from:"
    echo "https://adoptium.net/"
    echo
    exit 1
fi

echo "✅ Java found"
echo

# Step 1: Build web assets
echo "[1/4] Building web assets..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Web assets built"
echo

# Step 2: Sync with Android
echo "[2/4] Syncing with Android..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed!"
    exit 1
fi
echo "✅ Android synced"
echo

# Step 3: Build AAB
echo "[3/4] Building Android App Bundle (AAB)..."
cd android
./gradlew bundleRelease
if [ $? -ne 0 ]; then
    echo "❌ AAB build failed!"
    echo
    echo "Possible fixes:"
    echo "1. Open Android Studio: npm run android:open"
    echo "2. Go to Build → Clean Project"
    echo "3. Go to Build → Rebuild Project"
    echo
    exit 1
fi
cd ..
echo "✅ AAB built successfully"
echo

# Step 4: Show output location
echo "[4/4] Build complete!"
echo
echo "========================================"
echo " 📦 Your AAB file is ready:"
echo
echo " android/app/build/outputs/bundle/release/app-release.aab"
echo
echo " Upload this to Google Play Console:"
echo " https://play.google.com/console"
echo "========================================"
