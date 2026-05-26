/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F5F5F5',
    backgroundSelected: '#EFEFEF',
    textSecondary: '#4B4B4B',
    primary: '#FFCC00',
    muted: '#DEDEDE',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#1A1A1A',
    backgroundSelected: '#2A2A2A',
    textSecondary: '#C7C7C7',
    primary: '#FFCC00',
    muted: '#2A2A2A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'FiraSans_500Medium',
    serif: 'ui-serif',
    rounded: 'Inter_500Medium',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'FiraSans_500Medium',
    serif: 'serif',
    rounded: 'Inter_500Medium',
    mono: 'monospace',
  },
  web: {
    sans: 'Fira Sans, Inter, ui-sans-serif, system-ui, sans-serif',
    serif: 'var(--font-serif)',
    rounded: 'Inter, ui-sans-serif, system-ui, sans-serif',
    mono: 'var(--font-mono)',
  },
});

export const FontFamilies = {
  primaryRegular: 'FiraSans_400Regular',
  primaryMedium: 'FiraSans_500Medium',
  primarySemiBold: 'FiraSans_600SemiBold',
  secondaryRegular: 'Inter_400Regular',
  secondaryMedium: 'Inter_500Medium',
  secondarySemiBold: 'Inter_600SemiBold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
