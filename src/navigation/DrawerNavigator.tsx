// src/navigation/DrawerNavigator.tsx
// 📂 Menu latéral (Drawer) de l'application

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';

import { DrawerParamList } from './types';
import { BottomTabNavigator } from './BottomTabNavigator';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Colors, Spacing, Typography } from '../theme';
import { useAuthStore } from '../store/authStore';

const Drawer = createDrawerNavigator<DrawerParamList>();

// ─── Contenu personnalisé du Drawer ─────────────────────────
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { user, logout } = useAuthStore();
  const { navigation, state } = props;

  const currentRouteName =
    state.routes[state.index]?.name ?? '';

  const menuItems = [
    { name: 'TabsHome', label: 'Accueil', emoji: '🏠' },
    { name: 'Settings', label: 'Paramètres', emoji: '⚙️' },
    { name: 'About', label: 'À propos', emoji: 'ℹ️' },
  ];

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}>

      {/* ── En-tête du Drawer ── */}
      <View style={styles.drawerHeader}>
        {/* Logo */}
        <View style={styles.drawerLogo}>
          <Text style={styles.drawerLogoEmoji}>🎬</Text>
        </View>
        <Text style={styles.drawerAppName}>VideoEditor</Text>
        <Text style={styles.drawerTagline}>Montage vidéo pro</Text>
      </View>

      {/* ── Profil utilisateur ── */}
      <View style={styles.profileSection}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {user?.email?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileName}>Mon profil</Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {user?.email || 'Non connecté'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ── Menu items ── */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionLabel}>NAVIGATION</Text>
        {menuItems.map(item => {
          const isActive = currentRouteName === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => {
                if (item.name === 'About') {
                  // Placeholder : on ferme juste le drawer
                  navigation.closeDrawer();
                } else {
                  navigation.navigate(item.name as keyof DrawerParamList);
                }
              }}>
              <Text style={styles.menuItemEmoji}>{item.emoji}</Text>
              <Text
                style={[
                  styles.menuItemLabel,
                  isActive && styles.menuItemLabelActive,
                ]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.menuItemDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.spacer} />

      {/* ── Bas du Drawer : déconnexion ── */}
      <View style={styles.drawerFooter}>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.logoutItem} onPress={logout}>
          <Text style={styles.menuItemEmoji}>🚪</Text>
          <Text style={styles.logoutLabel}>Se déconnecter</Text>
        </TouchableOpacity>
        <Text style={styles.footerVersion}>VideoEditor v1.0.0 — ICT202</Text>
      </View>
    </DrawerContentScrollView>
  );
};

// ─── Drawer Navigator ────────────────────────────────────────
export const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',          // Animation glissante
        drawerStyle: {
          backgroundColor: Colors.bg.secondary,
          width: 280,
          borderRightWidth: 1,
          borderRightColor: Colors.border.default,
        },
        overlayColor: 'rgba(0,0,0,0.6)',
        sceneContainerStyle: {
          backgroundColor: Colors.bg.primary,
        },
      }}>

      {/* ── Écran principal (tabs) ── */}
      <Drawer.Screen
        name="TabsHome"
        component={BottomTabNavigator}
        options={{ title: 'Accueil' }}
      />

      {/* ── Paramètres ── */}
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Paramètres' }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: Colors.bg.secondary,
  },

  // ── En-tête ──
  drawerHeader: {
    alignItems: 'center',
    paddingTop: Spacing.mega,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  drawerLogo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1.5,
    borderColor: Colors.border.active,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerLogoEmoji: {
    fontSize: 36,
  },
  drawerAppName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '900',
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  drawerTagline: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // ── Profil ──
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  profileEmail: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.xs,
    marginTop: 1,
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: Colors.border.subtle,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },

  // ── Menu ──
  menuSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  menuSectionLabel: {
    color: Colors.accent.secondary,
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.xs,
  },
  menuItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  menuItemEmoji: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  menuItemLabel: {
    flex: 1,
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  menuItemLabelActive: {
    color: Colors.accent.secondary,
    fontWeight: '700',
  },
  menuItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent.primary,
  },

  // ── Footer ──
  spacer: {
    flex: 1,
  },
  drawerFooter: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: Spacing.lg,
  },
  logoutLabel: {
    color: '#EF4444',
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
  footerVersion: {
    color: Colors.text.disabled,
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
