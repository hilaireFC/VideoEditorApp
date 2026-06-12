// src/screens/SplashScreen.tsx
// ✨ Écran de démarrage animé (Splash Screen) - Design Mis à jour

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing } from '../theme';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(barWidth, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(() => {
      setTimeout(onFinish, 300);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#1A1A2E', Colors.bg.primary, '#0A0A0F']}
        style={styles.gradient}
      >
        {/* Animated Background Circles for Depth */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />

        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}>
          <Text style={styles.logoEmoji}>🎬</Text>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{x:0, y:0}}
            end={{x:1, y:1}}
            style={styles.logoBadge}
          >
            <Text style={styles.logoBadgeText}>PRO</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
          <Text style={styles.title}>CapCut Native</Text>
          <Text style={styles.subtitle}>L'art du montage simplifié</Text>
        </Animated.View>

        <View style={styles.loaderContainer}>
          <View style={styles.track}>
            <Animated.View
              style={[
                styles.fill,
                {
                  width: barWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{x:0, y:0}}
                end={{x:1, y:0}}
                style={{flex: 1}}
              />
            </Animated.View>
          </View>
        </View>

        <Text style={styles.footer}>Powered by React Native</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circle: { position: 'absolute', borderRadius: 1000, backgroundColor: 'rgba(139, 92, 246, 0.03)' },
  circle1: { width: width * 1.5, height: width * 1.5, top: -width * 0.8, left: -width * 0.5 },
  circle2: { width: width, height: width, bottom: -width * 0.4, right: -width * 0.3 },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  logoEmoji: { fontSize: 60 },
  logoBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#0A0A0F',
  },
  logoBadgeText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 2,
  },
  loaderContainer: { width: '60%', marginTop: 80 },
  track: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  footer: { position: 'absolute', bottom: 50, color: 'rgba(255,255,255,0.2)', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
});
