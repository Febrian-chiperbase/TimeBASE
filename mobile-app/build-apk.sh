#!/bin/bash

echo "🚀 TimeBASE Mobile APK Builder"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the mobile-app directory."
    exit 1
fi

# Check Node.js version
print_status "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js version: $(node -v) ✓"

# Check if backend is running
print_status "Checking if backend server is running..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Backend server is running ✓"
else
    print_warning "Backend server is not running."
    print_warning "Please start it first: cd ../backend && npm start"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check Android SDK
print_status "Checking Android SDK..."
if [ -z "$ANDROID_HOME" ]; then
    print_error "ANDROID_HOME is not set."
    print_error "Please install Android Studio and set ANDROID_HOME environment variable."
    print_error "Add this to your ~/.bashrc or ~/.zshrc:"
    print_error "export ANDROID_HOME=\$HOME/Android/Sdk"
    print_error "export PATH=\$PATH:\$ANDROID_HOME/emulator"
    print_error "export PATH=\$PATH:\$ANDROID_HOME/tools"
    print_error "export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    exit 1
fi

if [ ! -d "$ANDROID_HOME" ]; then
    print_error "Android SDK directory not found: $ANDROID_HOME"
    exit 1
fi

print_success "Android SDK found: $ANDROID_HOME ✓"

# Check Java version
print_status "Checking Java version..."
if ! command -v java &> /dev/null; then
    print_error "Java is not installed. Please install JDK 11 or higher."
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 11 ]; then
    print_warning "Java 11+ is recommended. Current version: $(java -version 2>&1 | head -n1)"
fi
print_success "Java version check passed ✓"

# Clean previous builds
print_status "Cleaning previous builds..."
if [ -d "android" ]; then
    cd android
    if [ -f "gradlew" ]; then
        ./gradlew clean
    else
        print_warning "Gradle wrapper not found, skipping clean"
    fi
    cd ..
else
    print_error "Android directory not found. This doesn't appear to be a React Native project."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    print_error "Try running: npm cache clean --force && npm install"
    exit 1
fi

print_success "Dependencies installed ✓"

# Create gradlew if it doesn't exist
if [ ! -f "android/gradlew" ]; then
    print_status "Creating Gradle wrapper..."
    cd android
    gradle wrapper
    chmod +x gradlew
    cd ..
fi

# Build APK
print_status "Building release APK..."
print_status "This may take several minutes..."

cd android
./gradlew assembleRelease

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    print_success "APK built successfully! 🎉"
    
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        print_success "APK Location: android/$APK_PATH"
        print_success "APK Size: $APK_SIZE"
        
        # Copy APK to root directory for easy access
        cp "$APK_PATH" "../TimeBASE-v1.0.0.apk"
        print_success "APK copied to: TimeBASE-v1.0.0.apk"
        
        echo ""
        echo "🎯 Next Steps:"
        echo "1. Install APK on device: adb install TimeBASE-v1.0.0.apk"
        echo "2. Or transfer APK to device and install manually"
        echo "3. Make sure backend server is running for full functionality"
        
        # Check if device is connected
        if command -v adb &> /dev/null; then
            DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l)
            if [ "$DEVICES" -gt 0 ]; then
                echo ""
                read -p "Install on connected Android device? (y/n): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    print_status "Installing APK on device..."
                    adb install "$APK_PATH"
                    
                    if [ $? -eq 0 ]; then
                        print_success "APK installed successfully! 📱"
                        print_success "You can now open TimeBASE app on your device"
                    else
                        print_error "Failed to install APK. Please install manually."
                    fi
                fi
            else
                print_warning "No Android devices connected via ADB"
                print_warning "Connect your device and enable USB debugging to install directly"
            fi
        else
            print_warning "ADB not found in PATH. Install Android SDK platform-tools for direct installation."
        fi
        
    else
        print_error "APK file not found at expected location: $APK_PATH"
        print_error "Check the build output above for errors"
        exit 1
    fi
else
    print_error "Build failed! ❌"
    print_error "Common solutions:"
    print_error "1. Clean and rebuild: ./gradlew clean && ./gradlew assembleRelease"
    print_error "2. Check Android SDK is properly installed"
    print_error "3. Ensure ANDROID_HOME is set correctly"
    print_error "4. Try: cd android && ./gradlew --stacktrace assembleRelease"
    exit 1
fi

cd ..

echo ""
print_success "Build process completed! 🚀"
echo ""
echo "📱 APK Details:"
echo "   Name: TimeBASE-v1.0.0.apk"
echo "   Package: com.timebase"
echo "   Version: 1.0.0"
echo "   Min Android: 5.0 (API 21)"
echo "   Target Android: 13 (API 33)"
echo ""
echo "🔗 Features included:"
echo "   ✅ Task Management"
echo "   ✅ AI Time Suggestions"
echo "   ✅ Task Recommendations"
echo "   ✅ Focus Timer"
echo "   ✅ Analytics Dashboard"
echo "   ✅ User Authentication"
echo "   ✅ Dark/Light Theme"
echo ""
echo "📋 Installation Instructions:"
echo "   1. Transfer TimeBASE-v1.0.0.apk to your Android device"
echo "   2. Enable 'Install from Unknown Sources' in Settings"
echo "   3. Tap the APK file to install"
echo "   4. Open TimeBASE app and enjoy!"
echo ""
echo "Happy productivity! 🎉"
