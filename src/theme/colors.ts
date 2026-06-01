// src/theme/colors.ts
// 🎨 Design System — Color Palette (CapCut-inspired Dark Theme)

export const Colors = {
  // ── Backgrounds ──
  bg: {
    primary: '#0A0A0F',      // Darkest background
    secondary: '#12121A',    // Cards, panels
    tertiary: '#1A1A28',     // Elevated surfaces
    elevated: '#222236',     // Modals, dropdowns
  },

  // ── Accents ──
  accent: {
    primary: '#8B5CF6',      // Main violet
    secondary: '#A78BFA',    // Lighter violet
    tertiary: '#C4B5FD',     // Very light violet
    pink: '#EC4899',         // Accent pink
    pinkLight: '#F472B6',    // Light pink
    gradient: ['#8B5CF6', '#EC4899'],  // Primary gradient
  },

  // ── Text ──
  text: {
    primary: '#F1F5F9',      // Main text
    secondary: '#CBD5E1',    // Secondary text
    tertiary: '#94A3B8',     // Muted text
    disabled: '#475569',     // Disabled text
    inverse: '#0A0A0F',      // Dark text on light bg
  },

  // ── Semantic ──
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',

  // ── Borders ──
  border: {
    default: 'rgba(139, 92, 246, 0.15)',
    active: 'rgba(139, 92, 246, 0.4)',
    subtle: 'rgba(255, 255, 255, 0.06)',
  },

  // ── Timeline ──
  timeline: {
    videoTrack: '#8B5CF6',
    audioTrack: '#06B6D4',
    textTrack: '#F59E0B',
    playhead: '#EC4899',
    ruler: '#475569',
    selection: 'rgba(139, 92, 246, 0.3)',
  },

  // ── Overlays ──
  overlay: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(0, 0, 0, 0.5)',
    heavy: 'rgba(0, 0, 0, 0.8)',
  },

  // ── Transparent variants ──
  transparent: {
    white10: 'rgba(255, 255, 255, 0.1)',
    white20: 'rgba(255, 255, 255, 0.2)',
    black50: 'rgba(0, 0, 0, 0.5)',
  },
} as const;

export type ColorKeys = keyof typeof Colors;
