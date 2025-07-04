#!/bin/bash

# TimeBASE Optimization for Testing
echo "🚀 Optimizing TimeBASE for Testing & APK Generation..."

# Set environment
export ANDROID_HOME=/usr/lib/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/build-tools

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Step 1: Installing/Updating Dependencies...${NC}"
npm install --legacy-peer-deps

echo -e "${BLUE}🧹 Step 2: Cleaning Previous Builds...${NC}"
rm -rf node_modules/.cache
npx react-native start --reset-cache &
METRO_PID=$!
sleep 3
kill $METRO_PID 2>/dev/null

echo -e "${BLUE}🔧 Step 3: Optimizing Android Build Configuration...${NC}"

# Update gradle.properties for better performance
cat > android/gradle.properties << 'EOF'
# Project-wide Gradle settings.
android.useAndroidX=true
android.enableJetifier=true

# Optimization settings
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.daemon=true
org.gradle.caching=true

# React Native specific
FLIPPER_VERSION=0.125.0
reactNativeArchitectures=armeabi-v7a,arm64-v8a

# Disable unnecessary features for faster builds
android.enableR8.fullMode=false
android.enableBuildCache=true
EOF

echo -e "${BLUE}🎯 Step 4: Creating Optimized APK Build Script...${NC}"

# Create optimized build script
cat > build-optimized-apk.sh << 'EOF'
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
EOF

chmod +x build-optimized-apk.sh

echo -e "${BLUE}🎨 Step 5: Optimizing App Performance...${NC}"

# Create performance-optimized App.tsx
cat > App.tsx << 'EOF'
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  LogBox,
  AppState,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Context Providers
import { AuthProvider } from './src/context/AuthContext';
import { TaskProvider } from './src/context/TaskContext';
import { ThemeProvider } from './src/context/ThemeContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Theme
import { lightTheme, darkTheme } from './src/theme/theme';

// Ignore warnings for cleaner testing
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
  'Remote debugger',
  'Require cycle',
]);

const App = (): JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    // Performance optimization: Handle app state changes
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background') {
        // App is going to background - cleanup if needed
      } else if (nextAppState === 'active') {
        // App is becoming active - refresh if needed
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <TaskProvider>
              <SafeAreaView style={styles.container}>
                <StatusBar
                  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                  backgroundColor={theme.colors.primary}
                />
                <NavigationContainer theme={theme}>
                  <AppNavigator />
                </NavigationContainer>
              </SafeAreaView>
            </TaskProvider>
          </AuthProvider>
        </PaperProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
EOF

echo -e "${BLUE}📱 Step 6: Creating Testing Utilities...${NC}"

# Create testing script
cat > test-app.sh << 'EOF'
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
EOF

chmod +x test-app.sh

echo -e "${GREEN}✅ Optimization Complete!${NC}"
echo ""
echo -e "${BLUE}🎯 Next Steps for Testing:${NC}"
echo "1. Run: ./build-optimized-apk.sh (to build APK)"
echo "2. Run: ./test-app.sh (for testing utilities)"
echo "3. Connect Android device and run: npm run android"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "• Enable Developer Options on your Android device"
echo "• Enable USB Debugging"
echo "• Allow installation from Unknown Sources"
