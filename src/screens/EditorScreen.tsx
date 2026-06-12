// src/screens/EditorScreen.tsx
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CustomSlider as Slider } from '../components/CustomSlider';
import Video from 'react-native-video';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Typography } from '../theme';
import { useEditorStore, VideoClip } from '../store/editorStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_SCALE = 50; // Pixels per second
const PROJECTS_KEY = 'local_projects_v1';

const ONLINE_MUSICS = [
  { id: 'm1', name: 'Lo-Fi Chill', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'm2', name: 'Acoustic Folk', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'm3', name: 'Pop Beat', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

const STICKERS = [
  { id: 's1', emoji: '🗼', name: 'Tour Eiffel' },
  { id: 's2', emoji: '🎩', name: 'Chapeau' },
  { id: 's3', emoji: '🕶️', name: 'Lunettes' },
  { id: 's4', emoji: '🥐', name: 'Croissant' },
  { id: 's5', emoji: '💖', name: 'Coeur' },
];

export const EditorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    id: projectId,
    name: projectName,
    aspectRatio,
    videoClips,
    audioClips,
    textOverlays,
    imageOverlays,
    currentTime,
    isPlaying,
    selectedClipId,
    selectedTrackType,
    setCurrentTime,
    setIsPlaying,
    selectClip,
    updateVideoClip,
    removeVideoClip,
    addTextOverlay,
    removeTextOverlay,
    addAudioClip,
    removeAudioClip,
    addVideoClip,
    addImageOverlay,
    removeImageOverlay,
    undo,
    redo,
  } = useEditorStore();

  const playerRef = useRef<any>(null);
  const timelineScrollRef = useRef<ScrollView>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states for tools
  const [activeModal, setActiveModal] = useState<'trim' | 'filter' | 'text' | 'speed' | 'volume' | 'audioVolume' | 'musicLib' | 'stickers' | null>(null);
  const [textInput, setTextInput] = useState('');

  // Selected items resolved
  const selectedVideoClip = videoClips.find(c => c.id === selectedClipId && selectedTrackType === 'video');

  // Compute timeline segments
  let currentStart = 0;
  const videoSegments = videoClips.map((c) => {
    const activeDuration = (c.endTrim - c.startTrim) / c.speed;
    const segment = {
      clip: c,
      start: currentStart,
      end: currentStart + activeDuration,
      duration: activeDuration,
    };
    currentStart += activeDuration;
    return segment;
  });

  const totalDuration = currentStart;
  const activeSegment = videoSegments.find(s => currentTime >= s.start && currentTime <= s.end) || videoSegments[videoSegments.length - 1];
  const activeClip = activeSegment?.clip;

  const onProgress = (data: { currentTime: number }) => {
    if (isPlaying && activeSegment && activeClip) {
      const absoluteTime = activeSegment.start + (data.currentTime - activeClip.startTrim) / activeClip.speed;
      setCurrentTime(absoluteTime);
    }
  };

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const raw = await AsyncStorage.getItem(PROJECTS_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const updated = existing.map((p: any) =>
        p.id === projectId
          ? {
              ...p,
              videoClips: JSON.stringify(videoClips),
              audioClips: JSON.stringify(audioClips),
              textOverlays: JSON.stringify(textOverlays),
              imageOverlays: JSON.stringify(imageOverlays),
              lastModified: Date.now(),
            }
          : p
      );
      if (!updated.find((p: any) => p.id === projectId)) {
        updated.unshift({
          id: projectId,
          name: projectName,
          aspectRatio,
          videoClips: JSON.stringify(videoClips),
          audioClips: JSON.stringify(audioClips),
          textOverlays: JSON.stringify(textOverlays),
          imageOverlays: JSON.stringify(imageOverlays),
          lastModified: Date.now(),
        });
      }
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
      Alert.alert('✅ Sauvegardé', 'Projet enregistré.');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddVideo = async () => {
    const result = await launchImageLibrary({ mediaType: 'video', quality: 1 });
    if (result.didCancel || !result.assets || result.assets.length === 0) return;
    const asset = result.assets[0];
    if (!asset.uri) return;
    addVideoClip({
      id: Math.random().toString(36).substring(7),
      name: asset.fileName || 'Clip Vidéo',
      uri: asset.uri,
      type: 'video',
      duration: asset.duration || 10,
      thumbnail: '',
    });
  };

  const handleAddAudioNative = async () => {
    const result = await launchImageLibrary({ mediaType: 'mixed', quality: 1 });
    if (result.didCancel || !result.assets || result.assets.length === 0) return;
    const asset = result.assets[0];
    if (!asset.uri) return;
    if (asset.type && (asset.type.includes('image') || asset.type.includes('video'))) {
      Alert.alert('Erreur', 'Veuillez sélectionner un fichier audio.');
      return;
    }
    addAudioClip({
      id: Math.random().toString(36).substring(7),
      name: asset.fileName || 'Musique Locale',
      uri: asset.uri,
      duration: asset.duration || 30,
      timelineStart: currentTime,
    });
  };

  const addOnlineMusic = (track: typeof ONLINE_MUSICS[0]) => {
    addAudioClip({
      id: Math.random().toString(36).substring(7),
      name: track.name,
      uri: track.uri,
      duration: 30,
      timelineStart: currentTime,
    });
    setActiveModal(null);
  };

  const addSticker = (sticker: typeof STICKERS[0]) => {
    addImageOverlay({
      uri: sticker.emoji,
      isEmoji: true,
      timelineStart: currentTime,
      duration: 5,
      positionX: 40,
      positionY: 40,
      scale: 1.0,
    });
    setActiveModal(null);
  };

  const handleSplit = () => {
    if (!selectedVideoClip) {
      Alert.alert('Info', 'Sélectionnez un clip vidéo.');
      return;
    }
    const segment = videoSegments.find(s => s.clip.id === selectedVideoClip.id);
    if (!segment) return;
    const playheadRelative = (currentTime - segment.start) * selectedVideoClip.speed + selectedVideoClip.startTrim;
    if (playheadRelative <= selectedVideoClip.startTrim + 0.5 || playheadRelative >= selectedVideoClip.endTrim - 0.5) {
      Alert.alert('Erreur', 'Coupe impossible ici.');
      return;
    }
    const clipIndex = videoClips.findIndex(c => c.id === selectedVideoClip.id);
    const firstHalf: VideoClip = { ...selectedVideoClip, id: Math.random().toString(36).substring(7), name: `${selectedVideoClip.name}_P1`, endTrim: playheadRelative };
    const secondHalf: VideoClip = { ...selectedVideoClip, id: Math.random().toString(36).substring(7), name: `${selectedVideoClip.name}_P2`, startTrim: playheadRelative };
    const updatedClips = [...videoClips];
    updatedClips.splice(clipIndex, 1, firstHalf, secondHalf);
    useEditorStore.setState({ videoClips: updatedClips });
    useEditorStore.getState().saveToHistory();
    selectClip(firstHalf.id, 'video');
  };

  const handleDelete = () => {
    if (selectedTrackType === 'video' && selectedClipId) removeVideoClip(selectedClipId);
    else if (selectedTrackType === 'audio' && selectedClipId) removeAudioClip(selectedClipId);
    else if (selectedTrackType === 'text' && selectedClipId) removeTextOverlay(selectedClipId);
    else if (selectedTrackType === 'image' && selectedClipId) removeImageOverlay(selectedClipId);
    else Alert.alert('Info', 'Sélectionnez un élément.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{projectName}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={undo} style={styles.actionIcon}><Text style={styles.actionIconText}>↩</Text></TouchableOpacity>
          <TouchableOpacity onPress={redo} style={styles.actionIcon}><Text style={styles.actionIconText}>↪</Text></TouchableOpacity>
          <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{isSaving ? '...' : 'Sauver'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Export')}>
            <LinearGradient colors={['#EC4899', '#8B5CF6']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.exportBtn}>
              <Text style={styles.exportBtnText}>Exporter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preview Area */}
      <View style={styles.previewContainer}>
        <View style={[styles.playerSurface, aspectRatio === '9:16' ? styles.player916 : styles.player169]}>
          {activeClip ? (
            <Video
              ref={playerRef}
              source={{ uri: activeClip.uri }}
              style={styles.video}
              resizeMode="contain"
              paused={!isPlaying}
              muted={activeClip.volume === 0}
              volume={activeClip.volume}
              rate={activeClip.speed}
              onProgress={onProgress}
            />
          ) : (
            <View style={styles.emptyPlayer}>
              <Text style={styles.emptyEmoji}>🎬</Text>
              <Text style={styles.emptyText}>Ajoutez un média</Text>
            </View>
          )}

          {/* Overlays Rendering */}
          {textOverlays.map((to) => {
            const visible = currentTime >= to.timelineStart && currentTime <= to.timelineStart + to.duration;
            if (!visible) return null;
            return (
              <Text key={to.id} style={[styles.textOverlay, { color: to.color, fontSize: to.fontSize, left: `${to.positionX}%` as any, top: `${to.positionY}%` as any }]}>
                {to.text}
              </Text>
            );
          })}
          {imageOverlays.map((io) => {
            const visible = currentTime >= io.timelineStart && currentTime <= io.timelineStart + io.duration;
            if (!visible) return null;
            return (
              <Text key={io.id} style={[styles.stickerOverlay, { fontSize: 80 * io.scale, left: `${io.positionX}%` as any, top: `${io.positionY}%` as any }]}>
                {io.uri}
              </Text>
            );
          })}
        </View>
      </View>

      {/* Playback Controls */}
      <View style={styles.controlsBar}>
        <Text style={styles.timestamp}>{currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s</Text>
        <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause}>
          <View style={styles.playBtnInner}>
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </View>
        </TouchableOpacity>
        <View style={{width: 50}} />
      </View>

      {/* Timeline Section */}
      <View style={styles.timelineSection}>
        <View style={styles.playheadLine} pointerEvents="none" />
        <ScrollView
          ref={timelineScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => !isPlaying && setCurrentTime(e.nativeEvent.contentOffset.x / TIMELINE_SCALE)}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingLeft: SCREEN_WIDTH / 2, paddingRight: SCREEN_WIDTH / 2 }}
        >
          <View style={{ width: Math.max(totalDuration, 10) * TIMELINE_SCALE }}>
            {/* Ruler */}
            <View style={styles.ruler}>
              {Array.from({ length: Math.ceil(totalDuration) + 5 }).map((_, i) => (
                <View key={i} style={[styles.tick, { left: i * TIMELINE_SCALE }]}>
                  <View style={styles.tickLine} />
                  <Text style={styles.tickLabel}>{i}s</Text>
                </View>
              ))}
            </View>

            {/* Video Track */}
            <View style={styles.track}>
              <View style={styles.trackContent}>
                {videoSegments.map((seg) => (
                  <TouchableOpacity
                    key={seg.clip.id}
                    style={[styles.clip, { width: Math.max(seg.duration * TIMELINE_SCALE, 30) }, selectedClipId === seg.clip.id && styles.selectedClip]}
                    onPress={() => selectClip(seg.clip.id, 'video')}
                  >
                    <Text style={styles.clipText} numberOfLines={1}>{seg.clip.name}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.inlineAdd} onPress={handleAddVideo}>
                  <Text style={styles.inlineAddText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Audio Track */}
            <View style={styles.track}>
              <View style={styles.trackContent}>
                {audioClips.map((ac) => (
                  <TouchableOpacity
                    key={ac.id}
                    style={[styles.audioClip, { left: ac.timelineStart * TIMELINE_SCALE, width: (ac.endTrim - ac.startTrim) * TIMELINE_SCALE }, selectedClipId === ac.id && styles.selectedAudio]}
                    onPress={() => selectClip(ac.id, 'audio')}
                  >
                    <Text style={styles.clipText} numberOfLines={1}>{ac.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarContent}>
          {[
            { id: 'add', icon: '➕', label: 'Ajouter', action: handleAddVideo },
            { id: 'music', icon: '🎵', label: 'Musique', action: () => setActiveModal('musicLib') },
            { id: 'sticker', icon: '🎨', label: 'Stickers', action: () => setActiveModal('stickers') },
            { id: 'split', icon: '✂️', label: 'Diviser', action: handleSplit },
            { id: 'text', icon: '📝', label: 'Texte', action: () => { setTextInput(''); setActiveModal('text'); } },
            { id: 'trim', icon: '⏳', label: 'Trim', action: () => selectedVideoClip ? setActiveModal('trim') : Alert.alert('Info', 'Sélectionnez un clip') },
            { id: 'del', icon: '🗑️', label: 'Suppr.', action: handleDelete },
          ].map(tool => (
            <TouchableOpacity key={tool.id} style={styles.toolItem} onPress={tool.action}>
              <View style={styles.toolIconCircle}>
                <Text style={styles.toolEmoji}>{tool.icon}</Text>
              </View>
              <Text style={styles.toolLabel}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Modals (Trim, Music, Stickers, Text) - Styled to match new theme */}
      <Modal visible={activeModal !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeModal === 'trim' && 'Découper le clip'}
                {activeModal === 'musicLib' && 'Bibliothèque Audio'}
                {activeModal === 'stickers' && 'Autocollants'}
                {activeModal === 'text' && 'Ajouter du texte'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeModalBtn}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {activeModal === 'trim' && selectedVideoClip && (
                <View style={styles.trimBody}>
                  <Text style={styles.sliderLabel}>Début: {selectedVideoClip.startTrim.toFixed(1)}s</Text>
                  <Slider minimumValue={0} maximumValue={selectedVideoClip.duration - 0.5} value={selectedVideoClip.startTrim} onValueChange={(val) => val < selectedVideoClip.endTrim - 0.5 && updateVideoClip(selectedVideoClip.id, { startTrim: val })} />
                  <Text style={styles.sliderLabel}>Fin: {selectedVideoClip.endTrim.toFixed(1)}s</Text>
                  <Slider minimumValue={0.5} maximumValue={selectedVideoClip.duration} value={selectedVideoClip.endTrim} onValueChange={(val) => val > selectedVideoClip.startTrim + 0.5 && updateVideoClip(selectedVideoClip.id, { endTrim: val })} />
                </View>
              )}

              {activeModal === 'musicLib' && (
                <ScrollView>
                  <TouchableOpacity style={styles.localUploadBtn} onPress={() => { setActiveModal(null); handleAddAudioNative(); }}>
                    <Text style={styles.localUploadText}>📁 Importer localement</Text>
                  </TouchableOpacity>
                  {ONLINE_MUSICS.map(m => (
                    <TouchableOpacity key={m.id} style={styles.musicItem} onPress={() => addOnlineMusic(m)}>
                      <Text style={styles.musicIcon}>🎵</Text>
                      <Text style={styles.musicName}>{m.name}</Text>
                      <Text style={styles.musicPlus}>+</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {activeModal === 'stickers' && (
                <View style={styles.stickersGrid}>
                  {STICKERS.map(s => (
                    <TouchableOpacity key={s.id} style={styles.stickerItem} onPress={() => addSticker(s)}>
                      <Text style={styles.stickerEmoji}>{s.emoji}</Text>
                      <Text style={styles.stickerName}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {activeModal === 'text' && (
                <View>
                  <TextInput style={styles.modalInput} placeholder="Écrivez ici..." placeholderTextColor="#666" value={textInput} onChangeText={setTextInput} autoFocus />
                  <TouchableOpacity
                    style={styles.modalActionBtn}
                    onPress={() => {
                      if(textInput.trim()) {
                        addTextOverlay({ text: textInput, color: '#fff', fontSize: 24, timelineStart: currentTime, duration: 3, positionX: 40, positionY: 40 });
                        setActiveModal(null);
                      }
                    }}
                  >
                    <Text style={styles.modalActionBtnText}>Ajouter</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  backBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { color: '#fff', fontSize: 32, fontWeight: '300' },
  headerTitleContainer: { flex: 1, paddingHorizontal: Spacing.sm },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionIcon: { padding: 4 },
  actionIconText: { fontSize: 22, color: Colors.text.secondary },
  saveBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  saveBtnText: { color: Colors.text.secondary, fontSize: 12, fontWeight: '700' },
  exportBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  exportBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  
  previewContainer: { width: '100%', height: 300, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  playerSurface: { position: 'relative', overflow: 'hidden', backgroundColor: '#000' },
  player169: { width: '100%', aspectRatio: 16/9 },
  player916: { height: '100%', aspectRatio: 9/16 },
  video: { width: '100%', height: '100%' },
  emptyPlayer: { alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyText: { color: '#444', fontWeight: '600' },

  textOverlay: { position: 'absolute', fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4 },
  stickerOverlay: { position: 'absolute' },

  controlsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.bg.secondary },
  timestamp: { color: Colors.text.tertiary, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  playBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(139, 92, 246, 0.2)', padding: 2 },
  playBtnInner: { flex: 1, borderRadius: 20, backgroundColor: Colors.accent.primary, justifyContent: 'center', alignItems: 'center' },
  playIcon: { color: '#fff', fontSize: 20, marginLeft: 2 },

  timelineSection: { flex: 1, backgroundColor: Colors.bg.primary, position: 'relative' },
  playheadLine: { position: 'absolute', left: SCREEN_WIDTH / 2, top: 0, bottom: 0, width: 2, backgroundColor: Colors.accent.pink, zIndex: 100, shadowColor: Colors.accent.pink, shadowRadius: 5, shadowOpacity: 0.5, elevation: 5 },
  ruler: { height: 30, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'relative' },
  tick: { position: 'absolute', top: 0, alignItems: 'center' },
  tickLine: { width: 1, height: 8, backgroundColor: '#333' },
  tickLabel: { fontSize: 9, color: '#444', marginTop: 2, fontWeight: '600' },

  track: { height: 60, marginVertical: 4 },
  trackContent: { flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', flexDirection: 'row', alignItems: 'center' },
  clip: { height: 44, backgroundColor: Colors.accent.primary, borderRadius: 8, justifyContent: 'center', paddingHorizontal: 8, marginHorizontal: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  selectedClip: { borderColor: '#fff', borderWidth: 2, shadowColor: '#fff', shadowRadius: 5, shadowOpacity: 0.3 },
  clipText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  inlineAdd: { width: 40, height: 44, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: '#444', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  inlineAddText: { color: '#666', fontSize: 20 },
  audioClip: { position: 'absolute', height: 36, backgroundColor: Colors.timeline.audioTrack, borderRadius: 6, justifyContent: 'center', paddingHorizontal: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  selectedAudio: { borderColor: '#fff', borderWidth: 2 },

  toolbarContainer: { backgroundColor: Colors.bg.secondary, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)', paddingVertical: 10 },
  toolbarContent: { paddingHorizontal: 16, gap: 16 },
  toolItem: { alignItems: 'center', width: 60 },
  toolIconCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  toolEmoji: { fontSize: 20 },
  toolLabel: { color: Colors.text.tertiary, fontSize: 10, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.bg.tertiary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, minHeight: 300 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  closeModalBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  closeModalText: { color: '#666', fontSize: 14 },
  modalBody: { paddingBottom: 40 },
  sliderLabel: { color: Colors.text.secondary, fontSize: 13, marginBottom: 8, marginTop: 16 },
  localUploadBtn: { backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' },
  localUploadText: { color: Colors.accent.secondary, fontWeight: '700' },
  musicItem: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 8 },
  musicIcon: { fontSize: 18, marginRight: 12 },
  musicName: { flex: 1, color: '#fff', fontWeight: '600' },
  musicPlus: { color: Colors.accent.primary, fontSize: 20, fontWeight: '900' },
  stickersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stickerItem: { width: (SCREEN_WIDTH - 64) / 3, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, alignItems: 'center' },
  stickerEmoji: { fontSize: 32, marginBottom: 4 },
  stickerName: { color: '#666', fontSize: 10, fontWeight: '600' },
  modalInput: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333', marginBottom: 20 },
  modalActionBtn: { backgroundColor: Colors.accent.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  modalActionBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
