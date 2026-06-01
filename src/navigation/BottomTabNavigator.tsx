// src/navigation/BottomTabNavigator.tsx
// 🗂️ Barre de navigation en bas de l'écran

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ExportScreen } from '../screens/ExportScreen';
import { Colors, Spacing, Typography } from '../theme';

const Tab = createBottomTabNavigator<TabParamList>();

// ─── Icônes personnalisées ───────────────────────────────────
const TabIcon = ({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) => (
  <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
    <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.55 }]}>{emoji}</Text>
    <Text
      style={[
        styles.tabLabel,
        { color: focused ? Colors.accent.secondary : Colors.text.disabled },
      ]}>
      {label}
    </Text>
    {focused && <View style={styles.tabDot} />}
  </View>
);

// ─── Placeholder pour l'écran Projets (sera implémenté par l'équipe) ─────────
const ProjectsPlaceholder = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderEmoji}>📁</Text>
    <Text style={styles.placeholderTitle}>Mes Projets</Text>
    <Text style={styles.placeholderSub}>
      Cet écran sera implémenté par l'équipe
    </Text>
  </View>
);

// ─── Bottom Tab Navigator ────────────────────────────────────
export const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg.secondary,
          borderTopWidth: 1,
          borderTopColor: Colors.border.default,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarShowLabel: false,    // On gère nous-mêmes le label
        tabBarActiveTintColor: Colors.accent.primary,
        tabBarInactiveTintColor: Colors.text.disabled,
      }}>

      {/* ── Onglet Accueil ───────────────── */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Accueil" focused={focused} />
          ),
        }}
      />

      {/* ── Onglet Projets ───────────────── */}
      <Tab.Screen
        name="Projects"
        component={ProjectsPlaceholder}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📁" label="Projets" focused={focused} />
          ),
        }}
      />

      {/* ── Onglet Éditeur (bouton central) ─ */}
      <Tab.Screen
        name="Editor"
        component={ProjectsPlaceholder}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.editorTabButton}>
              <Text style={styles.editorTabEmoji}>✂️</Text>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      {/* ── Onglet Export ────────────────── */}
      <Tab.Screen
        name="Export"
        component={ExportScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⬆️" label="Export" focused={focused} />
          ),
        }}
      />

      {/* ── Onglet Paramètres ────────────── */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" label="Réglages" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  // ── Tab item ──
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.sm,
    width: 64,
  },
  tabItemFocused: {
    // léger fond violet quand actif
  },
  tabEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent.primary,
    marginTop: 3,
  },

  // ── Bouton éditeur central ──
  editorTabButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    // Ombre violette
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  editorTabEmoji: {
    fontSize: 22,
  },

  // ── Placeholder ──
  placeholder: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 52,
    marginBottom: Spacing.md,
  },
  placeholderTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  placeholderSub: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.mega,
  },
});
