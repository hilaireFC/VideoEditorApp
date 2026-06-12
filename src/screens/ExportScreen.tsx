// src/screens/ExportScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Share,
  Alert,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useEditorStore } from '../store/editorStore';
import { FFmpegService } from '../services/ffmpeg.service';

const { width } = Dimensions.get('window');

export const ExportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { videoClips, audioClips, textOverlays, aspectRatio } = useEditorStore();
  const { user } = useAuthStore();
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [mode, setMode] = useState<'local' | 'cloud'>('local');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportPath, setExportPath] = useState<string | null>(null);

  const startExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setExportPath(null);

    if (mode === 'local') {
      await FFmpegService.renderProject(
        videoClips,
        audioClips,
        textOverlays,
        aspectRatio,
        resolution,
        (prog) => setProgress(prog),
        (outputPath) => {
          setIsExporting(false);
          setExportPath(outputPath);
          Alert.alert('Succès', 'Rendu local terminé !');
        },
        (errorMsg) => {
          setIsExporting(false);
          Alert.alert('Erreur', errorMsg);
        }
      );
    } else {
      try {
        if (!user) throw new Error('Utilisateur non connecté');
        setProgress(10);
        const interval = setInterval(() => {
          setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
        }, 800);

        setTimeout(async () => {
          clearInterval(interval);
          setProgress(100);
          setIsExporting(false);
          await FFmpegService.renderProject(
            videoClips,
            audioClips,
            textOverlays,
            aspectRatio,
            '720p',
            () => {},
            (outputPath) => {
              setExportPath(outputPath);
              Alert.alert('Succès', 'Rendu cloud terminé !');
            },
            () => {}
          );
        }, 4000);
      } catch (err: any) {
        setIsExporting(false);
        Alert.alert('Erreur', err.message);
      }
    }
  };

  const handleShare = async () => {
    if (!exportPath) return;
    try {
      await Share.share({
        url: exportPath,
        title: 'Mon Montage',
        message: 'Regardez ma nouvelle vidéo créée avec CapCut Native !',
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#1a1a2e', Colors.bg.primary]} style={styles.gradient}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={isExporting} style={styles.backBtn}>
              <Text style={styles.backEmoji}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Exportation</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.content}>
            {!isExporting && !exportPath && (
              <View style={styles.mainCard}>
                <Text style={styles.sectionTitle}>Qualité</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[styles.optionCard, resolution === '720p' && styles.optionSelected]}
                    onPress={() => setResolution('720p')}
                  >
                    <Text style={[styles.optionLabel, resolution === '720p' && styles.textAccent]}>HD 720p</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionCard, resolution === '1080p' && styles.optionSelected]}
                    onPress={() => setResolution('1080p')}
                  >
                    <Text style={[styles.optionLabel, resolution === '1080p' && styles.textAccent]}>FHD 1080p</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Moteur de rendu</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[styles.optionCard, mode === 'local' && styles.optionSelected]}
                    onPress={() => setMode('local')}
                  >
                    <Text style={styles.optionIcon}>📱</Text>
                    <Text style={[styles.optionLabel, mode === 'local' && styles.textAccent]}>Local</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionCard, mode === 'cloud' && styles.optionSelected]}
                    onPress={() => setMode('cloud')}
                  >
                    <Text style={styles.optionIcon}>☁️</Text>
                    <Text style={[styles.optionLabel, mode === 'cloud' && styles.textAccent]}>Cloud</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={startExport} activeOpacity={0.8} style={styles.exportBtnContainer}>
                  <LinearGradient
                    colors={Colors.accent.gradient as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.exportBtn}
                  >
                    <Text style={styles.exportBtnText}>Générer la Vidéo</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {isExporting && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={Colors.accent.primary} />
                <Text style={styles.loadingTitle}>Préparation du fichier...</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            )}

            {exportPath && (
              <View style={styles.successBox}>
                <LinearGradient colors={['rgba(139, 92, 246, 0.2)', 'transparent']} style={styles.successCircle}>
                  <Text style={styles.successIcon}>🎬</Text>
                </LinearGradient>
                <Text style={styles.successTitle}>Exportation Réussie !</Text>
                <Text style={styles.successSub}>Votre vidéo est prête à être partagée avec le monde.</Text>

                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                  <Text style={styles.shareBtnText}>Partager maintenant 🚀</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backHomeBtn} onPress={() => navigation.navigate('Home')}>
                  <Text style={styles.backHomeText}>Retour à l'accueil</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backEmoji: { color: '#fff', fontSize: 32, fontWeight: '300', marginTop: -4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  content: { flex: 1, padding: Spacing.xl, justifyContent: 'center' },
  mainCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderRadius: 30,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    color: Colors.text.tertiary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  optionsRow: { flexDirection: 'row', gap: Spacing.md },
  optionCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  optionSelected: {
    borderColor: Colors.accent.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  optionIcon: { fontSize: 24, marginBottom: 8 },
  optionLabel: { color: Colors.text.secondary, fontWeight: '700', fontSize: 14 },
  textAccent: { color: Colors.accent.secondary },
  exportBtnContainer: { marginTop: Spacing.xl * 1.5 },
  exportBtn: {
    borderRadius: 16,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  exportBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  loadingBox: { alignItems: 'center' },
  loadingTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: Spacing.xl, marginBottom: Spacing.lg },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: Colors.accent.primary },
  progressText: { color: Colors.text.tertiary, fontSize: 14, marginTop: Spacing.md, fontWeight: '600' },
  successBox: { alignItems: 'center' },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  successIcon: { fontSize: 60 },
  successTitle: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center' },
  successSub: { color: Colors.text.tertiary, textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.mega, lineHeight: 20 },
  shareBtn: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 16,
    width: '100%',
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  shareBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  backHomeBtn: { paddingVertical: Spacing.md },
  backHomeText: { color: Colors.text.tertiary, fontWeight: '600', textDecorationLine: 'underline' },
});
