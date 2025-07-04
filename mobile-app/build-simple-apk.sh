#!/bin/bash

# TimeBASE Simple APK Builder
echo "🏗️ Building TimeBASE APK with React Native CLI..."

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

echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
npm install --legacy-peer-deps

echo -e "${BLUE}🧹 Step 2: Cleaning cache...${NC}"
npx react-native start --reset-cache &
METRO_PID=$!
sleep 5
kill $METRO_PID 2>/dev/null

echo -e "${BLUE}🔨 Step 3: Building APK...${NC}"
npx react-native build-android --mode=release

if [ $? -eq 0 ]; then
    # Find the APK file
    APK_FILE=$(find android/app/build/outputs/apk -name "*.apk" -type f | head -1)
    
    if [ -n "$APK_FILE" ]; then
        # Copy APK to root with better name
        cp "$APK_FILE" "TimeBASE-v1.0.0-$(date +%Y%m%d).apk"
        
        echo -e "${GREEN}✅ APK Build Successful!${NC}"
        echo -e "${GREEN}📱 APK Location: TimeBASE-v1.0.0-$(date +%Y%m%d).apk${NC}"
        echo -e "${YELLOW}📊 APK Size: $(du -h TimeBASE-v1.0.0-$(date +%Y%m%d).apk | cut -f1)${NC}"
        
        echo ""
        echo -e "${BLUE}📲 Installation Instructions:${NC}"
        echo "1. Transfer APK to your Android device"
        echo "2. Enable 'Unknown Sources' in Settings > Security"
        echo "3. Install the APK file"
        echo ""
        echo -e "${BLUE}🔧 For direct installation (if device connected):${NC}"
        echo "adb install TimeBASE-v1.0.0-$(date +%Y%m%d).apk"
        
    else
        echo -e "${RED}❌ APK file not found${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
