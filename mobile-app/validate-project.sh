#!/bin/bash

echo "🔍 TimeBASE Project Validation"
echo "=============================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 (MISSING)"
        ((ERRORS++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
    else
        echo -e "${RED}✗${NC} $1/ (MISSING)"
        ((ERRORS++))
    fi
}

warn_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${YELLOW}⚠${NC} $1 (OPTIONAL)"
        ((WARNINGS++))
    fi
}

echo "📁 Checking Project Structure..."
check_file "package.json"
check_file "App.tsx"
check_file "index.js"
check_file "app.json"
check_file "metro.config.js"
check_file "babel.config.js"

echo ""
echo "📱 Checking Android Files..."
check_dir "android"
check_file "android/build.gradle"
check_file "android/settings.gradle"
check_file "android/gradle.properties"
check_file "android/app/build.gradle"
check_file "android/app/src/main/AndroidManifest.xml"
check_file "android/app/src/main/java/com/timebase/MainActivity.java"
check_file "android/app/src/main/java/com/timebase/MainApplication.java"
check_file "android/app/debug.keystore"

echo ""
echo "🎨 Checking Source Files..."
check_dir "src"
check_dir "src/screens"
check_dir "src/context"
check_dir "src/services"
check_dir "src/navigation"
check_dir "src/theme"

echo ""
echo "📄 Checking Core Screens..."
check_file "src/screens/SplashScreen.tsx"
check_file "src/screens/LoginScreen.tsx"
check_file "src/screens/DashboardScreen.tsx"
check_file "src/screens/TasksScreen.tsx"
check_file "src/screens/CreateTaskScreen.tsx"
check_file "src/screens/TimerScreen.tsx"
check_file "src/screens/AnalyticsScreen.tsx"
check_file "src/screens/ProfileScreen.tsx"

echo ""
echo "🔧 Checking Context & Services..."
check_file "src/context/AuthContext.tsx"
check_file "src/context/TaskContext.tsx"
check_file "src/context/ThemeContext.tsx"
check_file "src/services/apiService.ts"
check_file "src/navigation/AppNavigator.tsx"
check_file "src/theme/theme.ts"

echo ""
echo "🚀 Checking Build Files..."
check_file "build-apk.sh"
warn_file "validate-project.sh"

echo ""
echo "📦 Checking Dependencies..."
if [ -f "package.json" ]; then
    if grep -q "react-native" package.json; then
        echo -e "${GREEN}✓${NC} React Native dependency found"
    else
        echo -e "${RED}✗${NC} React Native dependency missing"
        ((ERRORS++))
    fi
    
    if grep -q "@react-navigation/native" package.json; then
        echo -e "${GREEN}✓${NC} React Navigation dependency found"
    else
        echo -e "${RED}✗${NC} React Navigation dependency missing"
        ((ERRORS++))
    fi
    
    if grep -q "react-native-paper" package.json; then
        echo -e "${GREEN}✓${NC} React Native Paper dependency found"
    else
        echo -e "${RED}✗${NC} React Native Paper dependency missing"
        ((ERRORS++))
    fi
fi

echo ""
echo "🔍 Checking Environment..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    ((ERRORS++))
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    ((ERRORS++))
fi

if [ -n "$ANDROID_HOME" ]; then
    echo -e "${GREEN}✓${NC} ANDROID_HOME: $ANDROID_HOME"
else
    echo -e "${RED}✗${NC} ANDROID_HOME not set"
    ((ERRORS++))
fi

if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n1)
    echo -e "${GREEN}✓${NC} Java: $JAVA_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Java not found (may be needed for Android build)"
    ((WARNINGS++))
fi

echo ""
echo "📊 Validation Summary:"
echo "======================"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical checks passed!${NC}"
    echo -e "${GREEN}✅ Project is ready to build APK${NC}"
else
    echo -e "${RED}❌ Found $ERRORS critical errors${NC}"
    echo -e "${RED}🔧 Please fix the errors above before building${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $WARNINGS warnings${NC}"
    echo -e "${YELLOW}💡 These are optional but recommended to fix${NC}"
fi

echo ""
echo "🚀 Next Steps:"
if [ $ERRORS -eq 0 ]; then
    echo "1. Run: npm install"
    echo "2. Start backend: cd ../backend && npm start"
    echo "3. Build APK: ./build-apk.sh"
    echo "4. Install APK on device"
else
    echo "1. Fix the critical errors listed above"
    echo "2. Re-run this validation script"
    echo "3. Once all errors are fixed, build the APK"
fi

echo ""
echo "📱 For APK build, you need:"
echo "   • Android Studio installed"
echo "   • ANDROID_HOME environment variable set"
echo "   • Java 11+ installed"
echo "   • Android device or emulator for testing"

exit $ERRORS
