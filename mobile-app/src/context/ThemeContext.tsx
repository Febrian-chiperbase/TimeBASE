import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isSystemTheme: boolean;
  setSystemTheme: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (isSystemTheme) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, isSystemTheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      const savedSystemTheme = await AsyncStorage.getItem('isSystemTheme');
      
      if (savedSystemTheme !== null) {
        const useSystemTheme = JSON.parse(savedSystemTheme);
        setIsSystemTheme(useSystemTheme);
        
        if (!useSystemTheme && savedTheme !== null) {
          setIsDarkMode(JSON.parse(savedTheme));
        } else {
          setIsDarkMode(systemColorScheme === 'dark');
        }
      } else {
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      setIsDarkMode(systemColorScheme === 'dark');
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      setIsSystemTheme(false);
      
      await AsyncStorage.setItem('themePreference', JSON.stringify(newTheme));
      await AsyncStorage.setItem('isSystemTheme', JSON.stringify(false));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setSystemTheme = async (value: boolean) => {
    try {
      setIsSystemTheme(value);
      await AsyncStorage.setItem('isSystemTheme', JSON.stringify(value));
      
      if (value) {
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error saving system theme preference:', error);
    }
  };

  const value: ThemeContextType = {
    isDarkMode,
    toggleTheme,
    isSystemTheme,
    setSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
