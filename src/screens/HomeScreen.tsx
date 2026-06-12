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
  Dimensions,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useEditorStore } from '../store/editorStore';

const { width } = Dimensions.get('window');
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
    const result = await launchImageLibrary({ mediaType: 'video', quality: 1 });
    if (result.didCancel || !result.assets || result.assets.length === 0) return;

    const asset = result.assets[0];
    if (!asset.uri) {
      Alert.alert('Erreur', 'Impossible de récupérer la vidéo sélectionnée.');
      return;
    }

    const newProjectId = Math.random().toString(36).substring(7);
    const projectName = `Projet_${new Date().toLocaleDateString().replace(/\//g, '-')}`;

    resetProject(newProjectId, projectName);
    addVideoClip({
      id: Math.random().toString(36).substring(7),
      name: asset.fileName || 'Video Clip',
      uri: asset.uri,
      type: 'video',
      duration: asset.duration || 10,
      thumbnail: '',
    });

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
      Alert.alert('Erreur', 'Impossible de charger le projet.');
    }
  };

  const handleDeleteProject = (id: string, name: string) => {
    Alert.alert('Supprimer', `Supprimer "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const raw = await AsyncStorage.getItem(PROJECTS_KEY);
          const existing: ProjectData[] = raw ? JSON.parse(raw) : [];
          const filtered = existing.filter(p => p.id !== id);
          await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
          setProjects(filtered);
        },
      },
    ]);
  };

  const renderProjectItem = ({ item }: { item: ProjectData }) => {
    const dateStr = new Date(item.lastModified).toLocaleDateString();
    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => handleOpenProject(item)}
        activeOpacity={0.9}
      >
        <View style={styles.projectThumbnail}>
          <Text style={styles.projectThumbnailIcon}>🎞️</Text>
        </View>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.projectMeta}>{dateStr} • {item.aspectRatio}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteIconButton}
          onPress={() => handleDeleteProject(item.id, item.name)}
        >
          <Text style={{ fontSize: 16 }}>🗑️</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Dynamic Header */}
      <LinearGradient colors={['#1e1e2d', Colors.bg.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Mes Projets</Text>
            <Text style={styles.userEmail}>{user?.email || 'Créateur'}</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={handleLogout}>
            <Text style={styles.profileEmoji}>👤</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleNewProject} activeOpacity={0.8}>
          <LinearGradient
            colors={Colors.accent.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.newProjectHero}
          >
            <View style={styles.newProjectCircle}>
              <Text style={styles.plusIcon}>+</Text>
            </View>
            <View style={styles.newProjectTextContainer}>
              <Text style={styles.newProjectTitle}>Nouveau Projet</Text>
              <Text style={styles.newProjectSubtitle}>Importez une vidéo pour commencer</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Projects Section */}
      <View style={styles.projectsSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Récents</Text>
          {projects.length > 0 && (
            <TouchableOpacity onPress={fetchProjects}>
              <Text style={styles.refreshText}>Actualiser</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.accent.primary} style={{ marginTop: 40 }} />
        ) : projects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎬</Text>
            <Text style={styles.emptyText}>Commencez votre première création</Text>
          </View>
        ) : (
          <FlatList
            data={projects}
            renderItem={renderProjectItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  welcomeText: {
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  userEmail: {
    color: Colors.text.tertiary,
    fontSize: 14,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileEmoji: { fontSize: 20 },
  newProjectHero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 20,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  newProjectCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  newProjectTextContainer: {
    marginLeft: Spacing.md,
  },
  newProjectTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  newProjectSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  projectsSection: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  refreshText: {
    color: Colors.accent.secondary,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 40,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.secondary,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  projectThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectThumbnailIcon: { fontSize: 24 },
  projectInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  projectName: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  projectMeta: {
    color: Colors.text.tertiary,
    fontSize: 12,
    marginTop: 2,
  },
  deleteIconButton: {
    padding: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  emptyIcon: { fontSize: 60, marginBottom: 10 },
  emptyText: { color: Colors.text.tertiary, textAlign: 'center' },
});
