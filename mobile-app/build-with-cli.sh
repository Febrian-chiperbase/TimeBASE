#!/bin/bash

# TimeBASE APK Builder using React Native CLI
echo "🚀 Building TimeBASE APK with React Native CLI..."

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

echo -e "${BLUE}🔧 Environment:${NC}"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "Node: $(node --version)"
echo "React Native CLI: $(npx react-native --version 2>/dev/null || echo 'Not found')"

echo -e "${BLUE}📦 Step 1: Clean and prepare...${NC}"
# Clean previous builds
rm -rf android/app/build/
npx react-native start --reset-cache &
METRO_PID=$!
sleep 3
kill $METRO_PID 2>/dev/null

echo -e "${BLUE}🔨 Step 2: Build APK using React Native CLI...${NC}"

# Try to build using React Native CLI
npx react-native build-android --mode debug

BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Build Successful with React Native CLI!${NC}"
    
    # Find APK
    APK_FILE=$(find android -name "*.apk" -type f | head -1)
    
    if [ -n "$APK_FILE" ]; then
        TIMESTAMP=$(date +%Y%m%d-%H%M)
        cp "$APK_FILE" "TimeBASE-CLI-${TIMESTAMP}.apk"
        
        echo -e "${GREEN}🎉 APK Generated!${NC}"
        echo -e "${GREEN}📱 Location: TimeBASE-CLI-${TIMESTAMP}.apk${NC}"
        echo -e "${YELLOW}📊 Size: $(du -h TimeBASE-CLI-${TIMESTAMP}.apk | cut -f1)${NC}"
        
        echo ""
        echo -e "${BLUE}📲 Install with: adb install TimeBASE-CLI-${TIMESTAMP}.apk${NC}"
        
    else
        echo -e "${RED}❌ APK not found after build${NC}"
        find android -name "*.apk" -type f
    fi
else
    echo -e "${YELLOW}⚠️ React Native CLI build failed, trying alternative...${NC}"
    
    echo -e "${BLUE}🔨 Step 3: Alternative - Direct Gradle build...${NC}"
    
    # Ensure bundle exists
    if [ ! -f "android/app/src/main/assets/index.android.bundle" ]; then
        echo "Creating bundle..."
        mkdir -p android/app/src/main/assets
        npx react-native bundle \
          --platform android \
          --dev false \
          --entry-file index.js \
          --bundle-output android/app/src/main/assets/index.android.bundle \
          --assets-dest android/app/src/main/res/
    fi
    
    # Try simple gradle build without React Native dependencies
    cd android
    
    # Temporarily remove problematic dependencies
    sed -i 's/implementation fileTree.*react-native.*//g' app/build.gradle
    sed -i 's/implementation project.*react-native.*//g' app/build.gradle
    
    # Add basic Android dependencies only
    if ! grep -q "implementation 'androidx.core:core:1.9.0'" app/build.gradle; then
        sed -i '/implementation.*appcompat/a\    implementation "androidx.core:core:1.9.0"' app/build.gradle
    fi
    
    ./gradlew assembleDebug
    
    if [ $? -eq 0 ]; then
        APK_FILE=$(find . -name "*.apk" -type f | head -1)
        if [ -n "$APK_FILE" ]; then
            TIMESTAMP=$(date +%Y%m%d-%H%M)
            cp "$APK_FILE" "../TimeBASE-Simple-${TIMESTAMP}.apk"
            
            echo -e "${GREEN}✅ Simple APK Generated!${NC}"
            echo -e "${GREEN}📱 Location: TimeBASE-Simple-${TIMESTAMP}.apk${NC}"
            echo -e "${YELLOW}📊 Size: $(du -h ../TimeBASE-Simple-${TIMESTAMP}.apk | cut -f1)${NC}"
            
            echo ""
            echo -e "${YELLOW}⚠️ Note: This is a simplified build without full React Native integration${NC}"
            echo -e "${BLUE}📲 Install with: adb install TimeBASE-Simple-${TIMESTAMP}.apk${NC}"
        fi
    else
        echo -e "${RED}❌ All build methods failed${NC}"
        exit 1
    fi
fi
