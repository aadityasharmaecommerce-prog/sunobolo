@echo off
echo ========================================
echo  SunoBolo English - Play Store Builder
echo ========================================
echo.

:: Check if Java is available
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Java JDK not found!
    echo.
    echo Please install Android Studio from:
    echo https://developer.android.com/studio
    echo.
    echo Or install JDK 17 from:
    echo https://adoptium.net/
    echo.
    pause
    exit /b 1
)

echo ✅ Java found
echo.

:: Step 1: Build web assets
echo [1/4] Building web assets...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Web assets built
echo.

:: Step 2: Sync with Android
echo [2/4] Syncing with Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ❌ Capacitor sync failed!
    pause
    exit /b 1
)
echo ✅ Android synced
echo.

:: Step 3: Build AAB
echo [3/4] Building Android App Bundle (AAB)...
cd android
call gradlew.bat bundleRelease
if %errorlevel% neq 0 (
    echo ❌ AAB build failed!
    echo.
    echo Possible fixes:
    echo 1. Open Android Studio: npm run android:open
    echo 2. Go to Build → Clean Project
    echo 3. Go to Build → Rebuild Project
    echo.
    pause
    exit /b 1
)
cd ..
echo ✅ AAB built successfully
echo.

:: Step 4: Show output location
echo [4/4] Build complete!
echo.
echo ========================================
echo  📦 Your AAB file is ready:
echo.
echo  android\app\build\outputs\bundle\release\app-release.aab
echo.
echo  Upload this to Google Play Console:
echo  https://play.google.com/console
echo ========================================
echo.
pause
