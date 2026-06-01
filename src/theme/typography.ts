// src/theme/typography.ts
// 📝 Design System — Typography configurations

export const Typography = {
  fontFamily: {
    regular: 'System',
    bold: 'System-Bold',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    jumbo: 32,
  },
  fontWeight: {
    thin: '300',
    regular: '400',
    medium: '500',
    bold: '700',
    heavy: '900',
  },
  lineHeight: {
    xs: 14,
    sm: 18,
    base: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 38,
  }
} as const;
