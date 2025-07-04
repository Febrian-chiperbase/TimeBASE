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
