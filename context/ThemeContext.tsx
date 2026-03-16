import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeColors = {
  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  // Borders
  border: string;
  borderLight: string;
  // Accent
  accent: string;
  accentLight: string;
  // Status
  success: string;
  warning: string;
  error: string;
  info: string;
  // Tab bar
  tabBar: string;
  tabBarBorder: string;
  // Input
  inputBg: string;
  placeholder: string;
};

const lightColors: ThemeColors = {
  background: '#f5f8ff',
  surface: '#ffffff',
  surfaceElevated: '#f8f9fa',
  card: '#ffffff',
  text: '#1c1c1e',
  textSecondary: '#7a7c96',
  textTertiary: '#a4a4a4',
  border: '#e9ecef',
  borderLight: '#f0f1f6',
  accent: '#67c99a',
  accentLight: 'rgba(103, 201, 154, 0.15)',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  tabBar: 'rgba(255,255,255,0.95)',
  tabBarBorder: 'rgba(0,0,0,0.08)',
  inputBg: '#f0f1f6',
  placeholder: '#8e8e93',
};

const darkColors: ThemeColors = {
  background: '#000000',
  surface: '#1c1c1e',
  surfaceElevated: '#2c2c2e',
  card: '#1c1c1e',
  text: '#ffffff',
  textSecondary: '#8e8e93',
  textTertiary: '#636366',
  border: '#38383a',
  borderLight: '#2c2c2e',
  accent: '#67c99a',
  accentLight: 'rgba(103, 201, 154, 0.2)',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF453A',
  info: '#0A84FF',
  tabBar: 'rgba(26,27,33,0.95)',
  tabBarBorder: 'rgba(255,255,255,0.08)',
  inputBg: '#1c1c1e',
  placeholder: '#8e8e93',
};

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
};

const THEME_KEY = 'app.theme.mode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(saved => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    }).catch(() => {});
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_KEY, m).catch(() => {});
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(() => ({ mode, isDark, colors, setMode }), [mode, isDark, colors, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
