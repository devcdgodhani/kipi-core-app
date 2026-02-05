import { useTheme } from '../context/ThemeContext';

export const colors = {
  primary: {
    main: '#000000',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#666666',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#FFFFFF',
    paper: '#F5F5F5',
  },
  text: {
    primary: '#000000',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#FFFFFF',
  },
  border: {
    light: '#E5E5E5',
    medium: '#CCCCCC',
    dark: '#999999',
  },
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  surface: '#F5F5F5',
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    black: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 32,
    '5xl': 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#000000',
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#000000',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#000000',
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: '#000000',
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: '#666666',
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export const useAppTheme = () => {
  const { theme: dynamicTheme } = useTheme();
  
  return {
    ...theme,
    colors: {
      ...theme.colors,
      primary: {
        ...theme.colors.primary,
        main: dynamicTheme.colors.primary,
      },
      secondary: {
        ...theme.colors.secondary,
        main: dynamicTheme.colors.secondary,
      },
      background: {
        ...theme.colors.background,
        default: dynamicTheme.colors.background,
        paper: dynamicTheme.colors.surface || (dynamicTheme.colors.background === '#FFFFFF' ? '#F5F5F5' : dynamicTheme.colors.background),
      },
      surface: dynamicTheme.colors.surface || (dynamicTheme.colors.background === '#FFFFFF' ? '#F5F5F5' : dynamicTheme.colors.background),
      text: {
        ...theme.colors.text,
        primary: dynamicTheme.colors.textPrimary || theme.colors.text.primary,
        secondary: dynamicTheme.colors.textSecondary || theme.colors.text.secondary,
      },
      border: {
        ...theme.colors.border,
        light: dynamicTheme.colors.border || theme.colors.border.light,
      }
    }
  };
};

export type Theme = ReturnType<typeof useAppTheme>;
