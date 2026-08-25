# 🎯 SunoBolo English — Play Store Setup Guide

## 📋 Prerequisites

### 1. Install Required Tools

#### Android Studio (Required)
```bash
# Download and install Android Studio from:
# https://developer.android.com/studio

# During installation, make sure to install:
# - Android SDK
# - Android SDK Platform-Tools
# - Android Emulator (for testing)
```

#### Java JDK 17 (Required)
```bash
# Android Studio includes JDK, but if you need standalone:
# Download from: https://adoptium.net/

# Or install via winget:
winget install EclipseAdoptium.Temurin.17.JDK
```

### 2. Set Up Android Studio

1. Open Android Studio
2. Go to **SDK Manager** (Tools → SDK Manager)
3. Install:
   - Android SDK Platform 34 (or latest)
   - Android SDK Build-Tools 34.0.0
   - Android SDK Command-line Tools
   - Android Emulator

### 3. Set Up Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay $25 one-time registration fee
3. Create a new app:
   - App name: SunoBolo English
   - Default language: English (India)
   - App or game: App
   - Free or paid: Free

---

## 🔐 Step 1: Generate Signing Key (Keystore)

### Create Keystore

```bash
# Open terminal in: sunobolo/sunobolo/android/

keytool -genkey -v \
  -keystore sunobolo-release.keystore \
  -alias sunobolo \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You'll be prompted for:
# - Keystore password: (create strong password, save it!)
# - Key alias: sunobolo
# - Key password: (same as keystore password)
# - First/Last name: SunoBolo English
# - Organizational unit: Development
# - Organization: Your Company Name
# - City: Your City
# - State: Your State
# - Country code: IN
```

### Update keystore.properties

Edit `android/keystore.properties`:

```properties
storeFile=sunobolo-release.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=sunobolo
keyPassword=YOUR_KEY_PASSWORD
```

### ⚠️ IMPORTANT: Backup Your Keystore!

```bash
# Copy the .keystore file to a SAFE location
# If you lose this file, you CANNOT update your app on Play Store!
# Store it in:
# - Google Drive (encrypted)
# - USB drive (physical backup)
# - Password manager
```

---

## 📱 Step 2: Build the App

### Option A: Build via Command Line

```bash
# Navigate to sunobolo/sunobolo directory
cd sunobolo/sunobolo

# Build and sync Android
npm run android:build:aab

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Option B: Build via Android Studio

```bash
# Open Android project
npm run android:open

# In Android Studio:
# 1. Go to Build → Generate Signed Bundle/APK
# 2. Select Android App Bundle
# 3. Choose your keystore file
# 4. Enter keystore password
# 5. Enter key password
# 6. Select release build type
# 7. Click Finish
```

---

## 🎨 Step 3: Prepare Play Store Assets

### Required Assets

| Asset | Size | Description |
|-------|------|-------------|
| **Feature Graphic** | 1024 x 500 px | Banner image for store listing |
| **App Icon** | 512 x 512 px | High-res app icon |
| **Screenshots** | Min 2, Max 8 | Phone screenshots (16:9 or 9:16) |
| **Short Description** | Max 80 chars | Brief app description |
| **Full Description** | Max 4000 chars | Detailed app description |

### Screenshot Guidelines

```
Take screenshots of these key screens:
1. Home screen (courses overview)
2. A lesson in progress
3. Audio playback feature
4. Progress tracking
5. Pricing page
6. Profile screen

Recommended sizes:
- Phone: 1080 x 1920 px (9:16 ratio)
- Tablet: 1200 x 1920 px (optional)
```

### Store Listing Content

#### Short Description (80 chars max)
```
Learn English speaking with 5000+ practical sentences. Listen, speak, repeat!
```

#### Full Description (4000 chars max)
```
🎯 SunoBolo English — Learn English the Smart Way

SunoBolo English helps you learn English speaking through practical, real-world sentences. No boring grammar rules — just listen, speak, and repeat!

✨ KEY FEATURES:

📚 5000+ Practical Sentences
- Organized by difficulty: Beginner, Intermediate, Advanced
- Real-world topics: Daily Life, Travel, Business, Interview
- Audio pronunciation by native speakers

🎤 Audio Learning
- Listen to correct pronunciation
- Practice speaking with audio guidance
- Offline audio support (download lessons)

📊 Progress Tracking
- Track your daily learning streak
- See completed lessons and sentences
- Monitor your improvement over time

🎯 Daily Journey
- Structured 30-day learning program
- Daily practice goals
- Score and feedback on each day

📖 Reading Section
- English articles and stories
- Vocabulary building
- Comprehension practice

🔔 Smart Notifications
- Daily practice reminders
- Streak reminders
- Motivational messages

💳 Premium Plans
- Monthly, 3-month, 6-month, and yearly plans
- Unlock all courses and features
- Secure payment via Razorpay

🌙 Offline Mode
- Download lessons for offline practice
- Continue learning without internet
- Sync progress when online

🔐 Safe & Secure
- Phone + password login
- Secure payment processing
- Privacy-focused design

📝 What Makes SunoBolo Different?
- Learn in YOUR language (Hindi explanations)
- Practical sentences you'll actually use
- No grammar boring — just speak!
- Track your real progress
- Mobile-first design

Download SunoBolo English now and start your English speaking journey!

🌐 Website: https://sunobolo.in
📧 Support: support@sunobolo.in
```

---

## 🚀 Step 4: Upload to Play Store

### 4.1 Create App Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Go to **Store listing** → **Main store listing**

4. Fill in:
   - **App name**: SunoBolo English
   - **Short description**: (paste from above)
   - **Full description**: (paste from above)

5. Upload assets:
   - Feature graphic
   - App icon (512x512)
   - Screenshots (at least 2)

### 4.2 Set Up App Content

1. **Content rating**: Complete IARC questionnaire
2. **Target audience**: Select age groups
3. **News app**: No (unless applicable)
4. **Store presence**: Fill required fields

### 4.3 Privacy Policy

1. Go to **Store listing** → **Privacy policy**
2. Enter URL: `https://sunobolo.in/privacy-policy`
3. Ensure privacy policy page is accessible

### 4.4 App Category

- **Category**: Education
- **Tags**: English, Learning, Education, Language

### 4.5 Contact Details

- **Email**: support@sunobolo.in
- **Phone**: (optional)
- **Website**: https://sunobolo.in

---

## 📦 Step 5: Upload AAB File

### 5.1 Create Release

1. Go to **Production** → **Create new release**
2. Click **Create**

### 5.2 Upload AAB

1. Click **Upload** under App integrity
2. Select: `android/app/build/outputs/bundle/release/app-release.aab`
3. Wait for processing

### 5.3 Add Release Notes

```
Version 1.0.0 - Initial Release

✨ Features:
- 5000+ practical English sentences
- Audio pronunciation by native speakers
- Progress tracking and streaks
- 30-day structured learning journey
- Reading section with articles
- Offline mode support
- Secure login with phone + password
- Premium plans with Razorpay payments
- Push notifications for daily practice

🔧 Improvements:
- Optimized for Android devices
- Smooth animations and transitions
- Battery-efficient audio playback
```

### 5.4 Review and Publish

1. Review all sections
2. Fix any errors/warnings
3. Click **Review release**
4. Click **Start rollout to production**

---

## ⏱️ Review Timeline

- **Initial review**: 1-7 days (usually 2-3 days)
- **Update review**: 1-3 days (usually same day)

### Common Rejection Reasons & Fixes

| Issue | Fix |
|-------|-----|
| Privacy policy missing | Add URL in Store listing |
| Permissions not explained | Add permission description in Data safety |
| Misleading content | Ensure screenshots match actual app |
| Broken functionality | Test thoroughly before submission |
| Policy violation | Review Google Play policies |

---

## 🔄 Step 6: Post-Launch

### 1. Monitor Performance

- Check **Android Vitals** for crashes/ANR
- Monitor **Reviews** and respond to feedback
- Track **Install** and **Uninstall** rates

### 2. Update Process

```bash
# 1. Update version in capacitor.config.ts
# 2. Build new AAB
npm run android:build:aab

# 3. Upload to Play Console
# 4. Add release notes
# 5. Submit for review
```

### 3. Version Numbering

```
Version 1.0.0 (versionCode: 1)
  ↓
Version 1.0.1 (versionCode: 2) - Bug fix
  ↓
Version 1.1.0 (versionCode: 3) - New feature
  ↓
Version 2.0.0 (versionCode: 4) - Major update
```

**Rule**: versionCode must ALWAYS increase!

---

## 🛠️ Troubleshooting

### Build Fails

```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android:build:aab
```

### Keystore Issues

```bash
# Verify keystore
keytool -list -v -keystore sunobolo-release.keystore

# If password wrong, regenerate (⚠️ will break updates if app already published)
```

### App Not Installing

- Check if minSdkVersion matches device
- Ensure APK is signed with release keystore
- Verify app ID matches Play Console

---

## 📞 Support

- **Google Play Console Help**: https://support.google.com/googleplay/android-developer
- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Developer**: https://developer.android.com

---

## ✅ Pre-Launch Checklist

- [ ] Android Studio installed
- [ ] Keystore generated and backed up
- [ ] keystore.properties updated with passwords
- [ ] AAB built successfully
- [ ] Screenshots taken (at least 2)
- [ ] Feature graphic created (1024x500)
- [ ] App icon ready (512x512)
- [ ] Privacy policy URL working
- [ ] Play Console account created ($25 paid)
- [ ] App listing filled completely
- [ ] Content rating completed
- [ ] Data safety section filled
- [ ] AAB uploaded and processed
- [ ] Release notes added
- [ ] Review started

**🎉 Ready to launch!**
