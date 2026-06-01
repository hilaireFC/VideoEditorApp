// src/screens/SplashScreen.tsx
// ✨ Écran de démarrage animé (Splash Screen)

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Valeurs animées
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Séquence d'animation
    Animated.sequence([
      // 1. Logo apparaît avec un effet "pop"
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // 2. Titre glisse vers le haut
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 3. Sous-titre apparaît
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // 4. Barre de chargement
      Animated.timing(barWidth, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Quand l'animation est terminée → passe à l'écran suivant
      setTimeout(onFinish, 200);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />

      {/* Logo animé */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}>
        <Text style={styles.logoEmoji}>🎬</Text>
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>HD</Text>
        </View>
      </Animated.View>

      {/* Titre */}
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleY }],
          },
        ]}>
        VideoEditor
      </Animated.Text>

      {/* Sous-titre */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Montage vidéo professionnel
      </Animated.Text>

      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: barWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.mega,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1.5,
    borderColor: Colors.border.active,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    // Ombre violette
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 48,
  },
  logoBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: Colors.accent.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  logoBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.text.primary,
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.tertiary,
    marginBottom: Spacing.mega * 2,
    letterSpacing: 0.5,
  },
  progressContainer: {
    width: '70%',
    height: 3,
    backgroundColor: Colors.bg.elevated,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent.primary,
    borderRadius: 2,
    // Effet brillant
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    color: Colors.text.disabled,
    fontSize: Typography.fontSize.xs,
    letterSpacing: 1,
  },
});
