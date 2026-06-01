// src/navigation/AppNavigator.tsx
// 🧭 Navigateur principal de l'application
// Architecture :
//   SplashScreen → (Auth Stack OU DrawerNavigator → BottomTabNavigator)

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { supabase } from '../services/supabase';
import { Colors } from '../theme';
import { useAuthStore } from '../store/authStore';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { DrawerNavigator } from './DrawerNavigator';
import { RootStackParamList, AuthStackParamList } from './types';

// ─── Stack d'authentification ────────────────────────────────
const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: Colors.bg.primary },
    }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// ─── Stack racine ────────────────────────────────────────────
const RootStack = createStackNavigator<RootStackParamList>();

// ─── Navigateur principal ────────────────────────────────────
export const AppNavigator: React.FC = () => {
  const { user, setSession, isInitializing, setInitializing } = useAuthStore();
  const [splashDone, setSplashDone] = useState(false);

  // Récupération de la session Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Splash Screen ──────────────────────────────────────────
  if (!splashDone) {
    return (
      <SplashScreen
        onFinish={() => setSplashDone(true)}
      />
    );
  }

  // ── Chargement de la session ───────────────────────────────
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent.primary} />
      </View>
    );
  }

  // ── Navigation principale ──────────────────────────────────
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.bg.primary },
        }}>
        {user ? (
          // ✅ Connecté → Drawer + Bottom Tabs
          <RootStack.Screen name="Main" component={DrawerNavigator} />
        ) : (
          // 🔒 Non connecté → Login / Register
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
