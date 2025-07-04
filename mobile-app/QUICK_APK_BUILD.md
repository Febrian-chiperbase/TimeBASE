# 🚀 Quick APK Build Guide - TimeBASE

## ⚡ **Fastest Way to Get APK**

### **Method 1: Fix Dependency & Build (5 minutes)**

```bash
cd /home/febrian/project/basecorp/project/timeBASE/mobile-app

# 1. Fix React Native dependency
sed -i 's/com.facebook.react:react-native:+/com.facebook.react:react-android:0.72.6/' android/app/build.gradle

# 2. Set environment
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 3. Build APK
cd android && ./gradlew assembleDebug

# 4. Find your APK
find . -name "*.apk" -type f
```

### **Method 2: Use React Native CLI (Alternative)**

```bash
cd /home/febrian/project/basecorp/project/timeBASE/mobile-app

# Set environment
export ANDROID_HOME=~/Android/Sdk

# Build with React Native CLI
npx react-native run-android --variant=debug
```

### **Method 3: Manual Bundle + Build**

```bash
cd /home/febrian/project/basecorp/project/timeBASE/mobile-app

# 1. Create bundle (already done)
# npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle

# 2. Build APK directly
cd android
export ANDROID_HOME=~/Android/Sdk
./gradlew assembleDebug --stacktrace
```

## 📱 **Install APK**

```bash
# Find APK location
find android -name "*.apk" -type f

# Install to connected device
adb install path/to/your.apk

# Or copy to device and install manually
cp path/to/your.apk ~/TimeBASE-Debug.apk
```

## 🔧 **If Build Fails**

### **Common Fix 1: Clean & Retry**
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### **Common Fix 2: Reset Metro Cache**
```bash
npx react-native start --reset-cache
```

### **Common Fix 3: Check Dependencies**
```bash
cd ..
npm install --legacy-peer-deps
```

## ✅ **Success Indicators**

You'll know it worked when you see:
```
BUILD SUCCESSFUL in Xs
```

And find APK at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 🎯 **Quick Test**

```bash
# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n com.timebase/.MainActivity

# View logs
adb logcat | grep ReactNativeJS
```

---

**💡 The React Native bundle is already created and working. The main issue is just the React Native dependency resolution in Gradle. The fix above should resolve it quickly.**
