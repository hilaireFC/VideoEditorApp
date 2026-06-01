// src/screens/SettingsScreen.tsx
// ⚙️ Écran Paramètres (placeholder pour l'équipe)

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import { useAuthStore } from '../store/authStore';

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [notifEnabled, setNotifEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);
  const [autoSave, setAutoSave] = React.useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />

      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paramètres</Text>
      </View>

      {/* Profil */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Mon Compte</Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {user?.email || 'Non connecté'}
          </Text>
        </View>
      </View>

      {/* Section Options */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PRÉFÉRENCES</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>🌙  Mode sombre</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ true: Colors.accent.primary }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>🔔  Notifications</Text>
          <Switch
            value={notifEnabled}
            onValueChange={setNotifEnabled}
            trackColor={{ true: Colors.accent.primary }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>💾  Sauvegarde auto</Text>
          <Switch
            value={autoSave}
            onValueChange={setAutoSave}
            trackColor={{ true: Colors.accent.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Section À propos */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>À PROPOS</Text>

        <View style={styles.infoRow}>
          <Text style={styles.settingLabel}>📱  Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.settingLabel}>👥  Équipe</Text>
          <Text style={styles.infoValue}>Groupe ICT202</Text>
        </View>
      </View>

      {/* Bouton Déconnexion */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>🚪  Se déconnecter</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.bg.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: '#fff',
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
  profileEmail: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  section: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.bg.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.default,
    overflow: 'hidden',
  },
  sectionLabel: {
    color: Colors.accent.secondary,
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  settingLabel: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.base,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  infoValue: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.subtle,
    marginHorizontal: Spacing.lg,
  },
  logoutButton: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
});
