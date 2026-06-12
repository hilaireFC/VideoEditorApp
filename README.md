# CapCut Clone - Video Editor App

Projet de recréation de l'application CapCut avec des fonctionnalités avancées en React Native.

## 📂 Structure du Projet

L'essentiel du code source se trouve dans le dossier `src/` :

*   **`src/screens/`** : Contient les différents écrans de l'application.
    *   `EditorScreen.tsx` : Interface de montage principale.
    *   `HomeScreen.tsx` : Gestion des projets.
    *   `LoginScreen.tsx` / `RegisterScreen.tsx` : Authentification.
    *   `ExportScreen.tsx` : Rendu et exportation.
*   **`src/navigation/`** : Configuration de la navigation (Stack, Drawer, Bottom Tabs).
*   **`src/store/`** : Gestion de l'état global (Zustand).
*   **`src/services/`** : Logique métier pour Firebase, Supabase et API système.
*   **`src/components/`** : Composants UI réutilisables (Timeline, outils d'édition, etc.).
*   **`src/theme/`** : Thèmes et styles globaux.

## ✨ Fonctionnalités Majeures

*   🎥 **Montage Vidéo Avancé** : Timeline interactive et prévisualisation en temps réel avec `react-native-video`.
*   📁 **Gestion de Médias** : Importation de vidéos/photos depuis la galerie et gestion du système de fichiers local (`react-native-fs`).
*   🔐 **Authentification & Cloud** : Connexion sécurisée (Firebase Auth) et synchronisation cloud des projets (Firestore/Storage).
*   🎨 **Interface Moderne** : UI inspirée de CapCut avec dégradés, icônes vectorielles et animations fluides.
*   🚀 **Navigation Intuitive** : Accès rapide aux outils via un menu latéral et des onglets.

## 🛠️ Technologies Clés

*   **React Native** : Développement natif cross-platform.
*   **Zustand** : Gestion d'état performante pour le montage.
*   **Reanimated & Gesture Handler** : Pour une timeline et des interactions fluides.
*   **Firebase & Supabase** : Solutions backend pour les données et le stockage.
*   **React Native Video** : Moteur de lecture vidéo performant.

## 🚀 Installation et Lancement

1.  **Installation des dépendances** :
    ```bash
    npm install
    ```
2.  **Lancer sur Android** :
    ```bash
    npm run android
    ```
3.  **Lancer sur iOS** :
    ```bash
    npm run ios
    ```
