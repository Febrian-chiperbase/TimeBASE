#!/bin/bash

# TimeBASE Optimized APK Builder
echo "🏗️ Building Optimized TimeBASE APK..."

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

# Clean and prepare
echo -e "${BLUE}🧹 Cleaning project...${NC}"
cd android
./gradlew clean
cd ..

# Build APK
echo -e "${BLUE}🔨 Building Release APK...${NC}"
cd android
./gradlew assembleRelease --stacktrace

if [ $? -eq 0 ]; then
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    if [ -f "$APK_PATH" ]; then
        # Copy APK to root directory with better name
        cp "$APK_PATH" "../TimeBASE-v1.0.0-$(date +%Y%m%d).apk"
        
        echo -e "${GREEN}✅ APK Build Successful!${NC}"
        echo -e "${GREEN}📱 APK Location: TimeBASE-v1.0.0-$(date +%Y%m%d).apk${NC}"
        echo -e "${YELLOW}📊 APK Size: $(du -h ../TimeBASE-v1.0.0-$(date +%Y%m%d).apk | cut -f1)${NC}"
        
        # Show installation instructions
        echo ""
        echo -e "${BLUE}📲 Installation Instructions:${NC}"
        echo "1. Transfer APK to your Android device"
        echo "2. Enable 'Unknown Sources' in Settings > Security"
        echo "3. Install the APK file"
        echo ""
        echo -e "${BLUE}🔧 For direct installation (if device connected):${NC}"
        echo "adb install TimeBASE-v1.0.0-$(date +%Y%m%d).apk"
        
    else
        echo -e "${RED}❌ APK file not found at expected location${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed. Check the error messages above.${NC}"
    exit 1
fi
