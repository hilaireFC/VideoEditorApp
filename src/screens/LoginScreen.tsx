// src/screens/LoginScreen.tsx
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

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, setError } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError(null);
    await login(email.trim(), password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={[Colors.bg.primary, '#1A1A2E', Colors.bg.primary]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header/Logo section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.emojiLogo}>🎬</Text>
            </View>
            <Text style={styles.title}>CapCut Native</Text>
            <Text style={styles.subtitle}>Le montage pro à portée de main</Text>
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
                placeholder="••••••••••••"
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

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={Colors.accent.gradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.text.primary} />
                ) : (
                  <Text style={styles.loginButtonText}>Se Connecter</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => setError("Connexion Google disponible prochainement.")}
              activeOpacity={0.8}
            >
              <Text style={styles.googleButtonText}>🌐 Continuer avec Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer/Navigation section */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Créer un compte</Text>
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
    marginBottom: Spacing.mega,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  emojiLogo: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderRadius: 24,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
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
  loginButton: {
    borderRadius: 14,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: Colors.text.tertiary,
    paddingHorizontal: Spacing.md,
    fontSize: 12,
    fontWeight: '700',
  },
  googleButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  googleButtonText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
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
  registerLink: {
    color: Colors.accent.secondary,
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
