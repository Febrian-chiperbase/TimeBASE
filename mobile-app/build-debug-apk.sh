#!/bin/bash

# TimeBASE Debug APK Builder (Simpler)
echo "🏗️ Building TimeBASE Debug APK..."

# Set environment
export ANDROID_HOME=/usr/lib/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/build-tools

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo -e "${BLUE}🔨 Step 2: Building Debug APK with Gradle...${NC}"
cd android

# Clean and build debug version (simpler)
./gradlew clean
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    # Find the APK file
    APK_FILE=$(find app/build/outputs/apk -name "*.apk" -type f | head -1)
    
    if [ -n "$APK_FILE" ]; then
        # Copy APK to root with better name
        cp "$APK_FILE" "../TimeBASE-Debug-v1.0.0-$(date +%Y%m%d).apk"
        
        echo -e "${GREEN}✅ Debug APK Build Successful!${NC}"
        echo -e "${GREEN}📱 APK Location: TimeBASE-Debug-v1.0.0-$(date +%Y%m%d).apk${NC}"
        echo -e "${YELLOW}📊 APK Size: $(du -h ../TimeBASE-Debug-v1.0.0-$(date +%Y%m%d).apk | cut -f1)${NC}"
        
        echo ""
        echo -e "${BLUE}📲 Installation Instructions:${NC}"
        echo "1. Transfer APK to your Android device"
        echo "2. Enable 'Unknown Sources' in Settings > Security"
        echo "3. Install the APK file"
        echo ""
        echo -e "${BLUE}🔧 For direct installation (if device connected):${NC}"
        echo "adb install TimeBASE-Debug-v1.0.0-$(date +%Y%m%d).apk"
        
        echo ""
        echo -e "${YELLOW}⚠️ Note: This is a DEBUG build. For production, use release build.${NC}"
        
    else
        echo -e "${RED}❌ APK file not found${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
