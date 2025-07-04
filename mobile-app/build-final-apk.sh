#!/bin/bash

# TimeBASE Final APK Builder
echo "🏗️ Building TimeBASE APK (Final Version)..."

# Set environment to use writable SDK
export ANDROID_HOME=~/Android/Sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/build-tools

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Environment Setup:${NC}"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "ADB: $(which adb)"
echo "Java: $(java -version 2>&1 | head -1)"

echo -e "${BLUE}📦 Step 1: Preparing React Native bundle...${NC}"

# Create assets directory
mkdir -p android/app/src/main/assets

# Bundle React Native JavaScript
echo -e "${BLUE}📱 Creating React Native bundle...${NC}"
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create React Native bundle${NC}"
    exit 1
fi

echo -e "${BLUE}🔨 Step 2: Building APK with Gradle...${NC}"
cd android

# Clean and build
./gradlew clean
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    # Find the APK file
    APK_FILE=$(find app/build/outputs/apk -name "*.apk" -type f | head -1)
    
    if [ -n "$APK_FILE" ]; then
        # Copy APK to root with better name
        cp "$APK_FILE" "../TimeBASE-v1.0.0-$(date +%Y%m%d-%H%M).apk"
        
        echo -e "${GREEN}✅ APK Build Successful!${NC}"
        echo -e "${GREEN}📱 APK Location: TimeBASE-v1.0.0-$(date +%Y%m%d-%H%M).apk${NC}"
        echo -e "${YELLOW}📊 APK Size: $(du -h ../TimeBASE-v1.0.0-$(date +%Y%m%d-%H%M).apk | cut -f1)${NC}"
        
        echo ""
        echo -e "${BLUE}📲 Installation Instructions:${NC}"
        echo "1. Transfer APK to your Android device"
        echo "2. Enable 'Unknown Sources' in Settings > Security"
        echo "3. Install the APK file"
        echo ""
        echo -e "${BLUE}🔧 For direct installation (if device connected):${NC}"
        echo "adb install TimeBASE-v1.0.0-$(date +%Y%m%d-%H%M).apk"
        
        echo ""
        echo -e "${GREEN}🎉 TimeBASE APK is ready for testing!${NC}"
        
    else
        echo -e "${RED}❌ APK file not found${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
