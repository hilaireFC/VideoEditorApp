// src/navigation/types.ts
// 🗺️ Définition de toutes les routes de l'application

// ─── Stack principal (Auth + App) ───────────────────────────
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;      // Stack d'authentification
  Main: undefined;      // Navigation principale (Drawer + Tabs)
};

// ─── Auth Stack (Login / Register) ──────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// ─── Drawer (menu latéral) ──────────────────────────────────
export type DrawerParamList = {
  TabsHome: undefined;      // Onglets principaux
  Settings: undefined;      // Paramètres
  About: undefined;         // À propos
};

// ─── Bottom Tabs ─────────────────────────────────────────────
export type TabParamList = {
  Home: undefined;
  Projects: undefined;
  Editor: undefined;
  Export: undefined;
};
