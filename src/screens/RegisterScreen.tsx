// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { useAuthStore } from '../store/authStore';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error, setError } = useAuthStore();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères');
      return;
    }
    setError(null);
    await register(email.trim(), password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#1A1A2E', Colors.bg.primary, '#1A1A2E']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.emojiLogo}>✨</Text>
            </View>
            <Text style={styles.title}>Créer un Compte</Text>
            <Text style={styles.subtitle}>Libérez votre créativité avec CapCut Native</Text>
          </View>

          {/* Form Container */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse Email</Text>
              <TextInput
                style={styles.input}
                placeholder="votre.email@exemple.com"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError(null);
                }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="Min. 6 caractères"
                placeholderTextColor={Colors.text.tertiary}
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError(null);
                }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor={Colors.text.tertiary}
                secureTextEntry
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  setError(null);
                }}
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#EC4899', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerButton}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.text.primary} />
                ) : (
                  <Text style={styles.registerButtonText}>S'inscrire Maintenant</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer/Navigation section */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà membre ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  emojiLogo: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    backgroundColor: 'rgba(26, 26, 40, 0.8)',
    borderRadius: 24,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: Colors.text.primary,
    fontSize: Typography.fontSize.base,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerButton: {
    borderRadius: 14,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  registerButtonText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.base,
  },
  loginLink: {
    color: Colors.accent.secondary,
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
