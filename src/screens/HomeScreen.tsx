// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Typography } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useEditorStore } from '../store/editorStore';

const PROJECTS_KEY = 'local_projects_v1';

interface ProjectData {
  id: string;
  name: string;
  aspectRatio: string;
  videoClips: string;
  audioClips: string;
  textOverlays: string;
  lastModified: number;
}

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuthStore();

  const resetProject = useEditorStore((state) => state.resetProject);
  const addVideoClip = useEditorStore((state) => state.addVideoClip);
  const loadProject = useEditorStore((state) => state.loadProject);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(PROJECTS_KEY);
      setProjects(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setProjects([]);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleNewProject = async () => {
    // Launch gallery to pick a video file
    const result = await launchImageLibrary({
      mediaType: 'video',
      quality: 1,
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.uri) {
      Alert.alert('Erreur', 'Impossible de récupérer la vidéo sélectionnée.');
      return;
    }

    const newProjectId = Math.random().toString(36).substring(7);
    const projectName = `Projet_${new Date().toLocaleDateString().replace(/\//g, '-')}`;

    // Reset store to initial state for new project
    resetProject(newProjectId, projectName);

    // Add selected video as first clip
    addVideoClip({
      id: Math.random().toString(36).substring(7),
      name: asset.fileName || 'Video Clip',
      uri: asset.uri,
      type: 'video',
      duration: asset.duration || 10,
      thumbnail: '',
    });

    // Save project locally
    const newProject: ProjectData = {
      id: newProjectId,
      name: projectName,
      aspectRatio: '16:9',
      videoClips: JSON.stringify([]),
      audioClips: JSON.stringify([]),
      textOverlays: JSON.stringify([]),
      lastModified: Date.now(),
    };
    const raw = await AsyncStorage.getItem(PROJECTS_KEY);
    const existing: ProjectData[] = raw ? JSON.parse(raw) : [];
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify([newProject, ...existing]));

    navigation.navigate('Editor');
  };

  const handleOpenProject = (proj: ProjectData) => {
    try {
      loadProject({
        id: proj.id,
        name: proj.name,
        aspectRatio: proj.aspectRatio,
        videoClips: JSON.parse(proj.videoClips),
        audioClips: JSON.parse(proj.audioClips),
        textOverlays: JSON.parse(proj.textOverlays),
      });
      navigation.navigate('Editor');
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible de charger le projet.');
    }
  };

  const handleDeleteProject = (id: string, name: string) => {
    Alert.alert('Supprimer le projet', `Voulez-vous vraiment supprimer "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            const raw = await AsyncStorage.getItem(PROJECTS_KEY);
            const existing: ProjectData[] = raw ? JSON.parse(raw) : [];
            await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(existing.filter(p => p.id !== id)));
            setProjects(prev => prev.filter(p => p.id !== id));
          } catch (e) {
            Alert.alert('Erreur', 'Impossible de supprimer le projet.');
          }
        },
      },
    ]);
  };

  const renderProjectItem = ({ item }: { item: ProjectData }) => {
    const dateStr = new Date(item.lastModified).toLocaleDateString();
    return (
      <View style={styles.projectItem}>
        <TouchableOpacity
          style={styles.projectItemInfo}
          onPress={() => handleOpenProject(item)}
        >
          <Text style={styles.projectIcon}>🎬</Text>
          <View style={styles.projectMeta}>
            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={styles.projectSubtitle}>
              Ratio: {item.aspectRatio} • Modifié le {dateStr}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteProject(item.id, item.name)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />
      
      {/* Header bar */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerWelcome}>Bonjour,</Text>
          <Text style={styles.headerEmail} numberOfLines={1}>
          {user?.email || 'Créateur'}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Déconnexion 🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Main Action Block */}
      <View style={styles.heroSection}>
        <TouchableOpacity style={styles.newProjectCard} onPress={handleNewProject}>
          <Text style={styles.newProjectPlus}>➕</Text>
          <Text style={styles.newProjectTitle}>Nouveau Projet</Text>
          <Text style={styles.newProjectSubtitle}>Importer une vidéo pour commencer le montage</Text>
        </TouchableOpacity>
      </View>

      {/* Projects Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mes Projets Récents</Text>
        {projects.length > 0 && (
          <TouchableOpacity onPress={fetchProjects}>
            <Text style={styles.refreshLink}>Actualiser 🔄</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Projects List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent.primary} />
          <Text style={styles.loadingText}>Chargement des projets...</Text>
        </View>
      ) : projects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>Aucun projet</Text>
          <Text style={styles.emptySubtitle}>Appuyez sur "Nouveau Projet" pour créer votre premier montage.</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderColor: Colors.border.subtle,
  },
  headerWelcome: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
  },
  headerEmail: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    maxWidth: 200,
  },
  logoutButton: {
    backgroundColor: Colors.bg.secondary,
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: 8,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  logoutText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  heroSection: {
    padding: Spacing.xl,
  },
  newProjectCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.accent.primary,
    borderStyle: 'dashed',
    paddingVertical: Spacing.mega,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newProjectPlus: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  newProjectTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
  },
  newProjectSubtitle: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
  },
  refreshLink: {
    color: Colors.accent.secondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  projectItem: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.secondary,
    borderColor: Colors.border.default,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  projectItemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  projectIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  projectMeta: {
    flex: 1,
  },
  projectName: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
  projectSubtitle: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderLeftWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteButtonText: {
    fontSize: Typography.fontSize.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.text.tertiary,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.mega,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
