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
    const success = await login(email.trim(), password);
    // La navigation se fait automatiquement via AppNavigator si succès
    if (!success) {
      // L'erreur est déjà dans le store
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header/Logo section */}
        <View style={styles.header}>
          <Text style={styles.emojiLogo}>🎬</Text>
          <Text style={styles.title}>CapCut Native</Text>
          <Text style={styles.subtitle}>Créez des vidéos incroyables sur mobile</Text>
        </View>

        {/* Form Container */}
        <View style={styles.form}>
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

          {error && <Text style={styles.errorText}>⚠️ {error}</Text>}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.text.primary} />
            ) : (
              <Text style={styles.loginButtonText}>Se Connecter</Text>
            )}
          </TouchableOpacity>

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
          <Text style={styles.footerText}>Vous n'avez pas de compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
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
  emojiLogo: {
    fontSize: 64,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '900',
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  form: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: 20,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.bg.tertiary,
    borderColor: Colors.border.default,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: Colors.text.primary,
    fontSize: Typography.fontSize.base,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.md,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
  },
  googleButton: {
    backgroundColor: Colors.bg.tertiary,
    borderColor: Colors.border.default,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
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
  },
});
