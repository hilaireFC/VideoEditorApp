// src/screens/SettingsScreen.tsx
// ⚙️ Écran Paramètres - Design Modernisé

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { useAuthStore } from '../store/authStore';

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [notifEnabled, setNotifEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);
  const [autoSave, setAutoSave] = React.useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#1a1a2e', Colors.bg.primary]} style={styles.gradient}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Paramètres</Text>
            </View>

            {/* Profile Section */}
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.15)', 'rgba(18, 18, 26, 0.8)']}
              style={styles.profileCard}
            >
              <LinearGradient
                colors={Colors.accent.gradient as any}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user?.email?.[0]?.toUpperCase() || '?'}
                </Text>
              </LinearGradient>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Mon Profil</Text>
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {user?.email || 'Non connecté'}
                </Text>
              </View>
              <TouchableOpacity style={styles.editBtn}>
                <Text style={{fontSize: 18}}>✏️</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Preferences Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>PRÉFÉRENCES</Text>

              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Text style={{fontSize: 20}}>🌙</Text>
                </View>
                <Text style={styles.rowLabel}>Mode Sombre</Text>
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#333', true: Colors.accent.primary }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Text style={{fontSize: 20}}>🔔</Text>
                </View>
                <Text style={styles.rowLabel}>Notifications</Text>
                <Switch
                  value={notifEnabled}
                  onValueChange={setNotifEnabled}
                  trackColor={{ false: '#333', true: Colors.accent.primary }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Text style={{fontSize: 20}}>💾</Text>
                </View>
                <Text style={styles.rowLabel}>Sauvegarde auto</Text>
                <Switch
                  value={autoSave}
                  onValueChange={setAutoSave}
                  trackColor={{ false: '#333', true: Colors.accent.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>À PROPOS</Text>

              <TouchableOpacity style={styles.row}>
                <View style={styles.rowIcon}>
                  <Text style={{fontSize: 20}}>📱</Text>
                </View>
                <Text style={styles.rowLabel}>Version</Text>
                <Text style={styles.rowValue}>1.0.0 (PRO)</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.row}>
                <View style={styles.rowIcon}>
                  <Text style={{fontSize: 20}}>🛡️</Text>
                </View>
                <Text style={styles.rowLabel}>Confidentialité</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.05)']}
                style={styles.logoutGradient}
              >
                <Text style={styles.logoutText}>Déconnexion</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.credits}>CapCut Native by Group ICT202</Text>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  profileInfo: { flex: 1 },
  profileName: { color: '#fff', fontSize: 18, fontWeight: '800' },
  profileEmail: { color: Colors.text.tertiary, fontSize: 13, marginTop: 2 },
  editBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  sectionLabel: {
    color: Colors.accent.secondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rowLabel: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
  rowValue: { color: Colors.text.tertiary, fontSize: 14, fontWeight: '500' },
  chevron: { color: Colors.text.tertiary, fontSize: 24, fontWeight: '300' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.03)', marginLeft: 64 },
  logoutBtn: { marginHorizontal: Spacing.xl, marginTop: Spacing.md, borderRadius: 16, overflow: 'hidden' },
  logoutGradient: { paddingVertical: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  credits: { textAlign: 'center', marginTop: 40, marginBottom: 40, color: 'rgba(255,255,255,0.1)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
});
