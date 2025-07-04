#!/bin/bash

# TimeBASE Final APK Builder - Last Step
echo "🚀 Building TimeBASE APK - Final Step..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Set environment
export ANDROID_HOME=~/Android/Sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/build-tools

echo -e "${BLUE}🔧 Environment Check:${NC}"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "Java: $(java -version 2>&1 | head -1)"
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"

echo -e "${BLUE}📦 Step 1: Ensure React Native bundle exists...${NC}"
if [ ! -f "android/app/src/main/assets/index.android.bundle" ]; then
    echo "Creating React Native bundle..."
    mkdir -p android/app/src/main/assets
    npx react-native bundle \
      --platform android \
      --dev false \
      --entry-file index.js \
      --bundle-output android/app/src/main/assets/index.android.bundle \
      --assets-dest android/app/src/main/res/
else
    echo "✅ React Native bundle already exists"
fi

echo -e "${BLUE}🔨 Step 2: Building APK with Gradle...${NC}"
cd android

# Clean first
echo "Cleaning previous builds..."
./gradlew clean

# Build debug APK (easier than release)
echo "Building debug APK..."
./gradlew assembleDebug --stacktrace --info

BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Build Successful!${NC}"
    
    # Find APK
    APK_FILE=$(find . -name "*.apk" -type f | head -1)
    
    if [ -n "$APK_FILE" ]; then
        # Copy to root with timestamp
        TIMESTAMP=$(date +%Y%m%d-%H%M)
        cp "$APK_FILE" "../TimeBASE-Debug-${TIMESTAMP}.apk"
        
        echo -e "${GREEN}🎉 APK Generated Successfully!${NC}"
        echo -e "${GREEN}📱 Location: TimeBASE-Debug-${TIMESTAMP}.apk${NC}"
        echo -e "${YELLOW}📊 Size: $(du -h ../TimeBASE-Debug-${TIMESTAMP}.apk | cut -f1)${NC}"
        
        # Show file info
        ls -la "../TimeBASE-Debug-${TIMESTAMP}.apk"
        
        echo ""
        echo -e "${BLUE}📲 Installation Instructions:${NC}"
        echo "1. Transfer APK to your Android device"
        echo "2. Enable 'Unknown Sources' in Settings > Security > Install unknown apps"
        echo "3. Tap the APK file to install"
        echo ""
        echo -e "${BLUE}🔧 Direct Installation (if device connected):${NC}"
        echo "adb install TimeBASE-Debug-${TIMESTAMP}.apk"
        echo ""
        echo -e "${BLUE}📱 Check connected devices:${NC}"
        adb devices
        
        echo ""
        echo -e "${GREEN}🎯 SUCCESS! TimeBASE APK is ready for testing!${NC}"
        
    else
        echo -e "${RED}❌ APK file not found after build${NC}"
        echo "Searching for APK files..."
        find . -name "*.apk" -type f
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed with status: $BUILD_STATUS${NC}"
    echo ""
    echo -e "${YELLOW}🔍 Troubleshooting suggestions:${NC}"
    echo "1. Check if all dependencies are installed"
    echo "2. Verify Android SDK is properly configured"
    echo "3. Try: ./gradlew clean && ./gradlew assembleDebug"
    echo "4. Check logs above for specific error messages"
    exit 1
fi
