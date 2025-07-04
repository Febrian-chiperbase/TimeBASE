#!/bin/bash

# TimeBASE Testing Script
echo "🧪 TimeBASE Testing Utilities"

# Set environment
export ANDROID_HOME=/usr/lib/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/build-tools

echo "📱 Available Android Devices:"
adb devices

echo ""
echo "🚀 Testing Options:"
echo "1. Run on connected device: npm run android"
echo "2. Build APK: ./build-optimized-apk.sh"
echo "3. Install APK on device: adb install TimeBASE-v1.0.0-*.apk"
echo "4. Start Metro bundler: npm start"

echo ""
echo "🔧 Debug Commands:"
echo "• View device logs: adb logcat | grep ReactNativeJS"
echo "• Clear app data: adb shell pm clear com.timebase"
echo "• Uninstall app: adb uninstall com.timebase"

echo ""
echo "📊 Project Status:"
./validate-project.sh
