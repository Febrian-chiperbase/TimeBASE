#!/bin/bash

# TimeBASE Android Environment Setup
echo "🔧 Setting up Android Environment for TimeBASE..."

# Set Android SDK path
export ANDROID_HOME=/usr/lib/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/build-tools

# Add to bashrc for permanent setup
if ! grep -q "ANDROID_HOME" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Android SDK Environment" >> ~/.bashrc
    echo "export ANDROID_HOME=/usr/lib/android-sdk" >> ~/.bashrc
    echo "export ANDROID_SDK_ROOT=\$ANDROID_HOME" >> ~/.bashrc
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.bashrc
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> ~/.bashrc
    echo "export PATH=\$PATH:\$ANDROID_HOME/build-tools" >> ~/.bashrc
    echo "✅ Android environment added to ~/.bashrc"
else
    echo "✅ Android environment already configured in ~/.bashrc"
fi

# Verify setup
echo ""
echo "🔍 Verifying Android Setup:"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "ADB Version: $(adb version | head -1)"
echo "Java Version: $(java -version 2>&1 | head -1)"

# Check for connected devices
echo ""
echo "📱 Checking for Android devices:"
adb devices

echo ""
echo "✅ Android environment setup complete!"
echo "💡 Run 'source ~/.bashrc' or restart terminal to apply changes permanently"
