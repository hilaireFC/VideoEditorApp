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
    // La navigation se fait automatiquement via AppNavigator si succès
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header section */}
        <View style={styles.header}>
          <Text style={styles.emojiLogo}>📝</Text>
          <Text style={styles.title}>Créer un Compte</Text>
          <Text style={styles.subtitle}>Rejoignez CapCut Native et éditez sans limites</Text>
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

          {error && <Text style={styles.errorText}>⚠️ {error}</Text>}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.text.primary} />
            ) : (
              <Text style={styles.registerButtonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer/Navigation section */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Vous avez déjà un compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Se connecter</Text>
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
    marginBottom: Spacing.xl,
  },
  emojiLogo: {
    fontSize: 54,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '900',
    color: Colors.text.primary,
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
  registerButton: {
    backgroundColor: Colors.accent.pink,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
    shadowColor: Colors.accent.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  registerButtonText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
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
  },
});
