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
  const selectedAudioClip = audioClips.find(c => c.id === selectedClipId && selectedTrackType === 'audio');

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
      Alert.alert('✅ Succès', 'Projet sauvegardé localement !');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le projet.');
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
    
    // Strict validation: Reject photos/videos if the user picked one by mistake
    if (asset.type && (asset.type.includes('image') || asset.type.includes('video'))) {
      Alert.alert('Erreur', 'Veuillez sélectionner uniquement un fichier audio (musique), et non une photo ou vidéo.');
      return;
    }

    addAudioClip({
      id: Math.random().toString(36).substring(7),
      name: asset.fileName || 'Musique Locale',
      uri: asset.uri,
      duration: asset.duration || 30, // Estimé si inconnu
      timelineStart: currentTime,
    });
  };

  const addOnlineMusic = (track: typeof ONLINE_MUSICS[0]) => {
    addAudioClip({
      id: Math.random().toString(36).substring(7),
      name: track.name,
      uri: track.uri,
      duration: 30, // Default duration since it's a stream
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
      Alert.alert('Info', 'Sélectionnez un clip vidéo sur la timeline pour le diviser.');
      return;
    }
    const segment = videoSegments.find(s => s.clip.id === selectedVideoClip.id);
    if (!segment) return;
    const playheadRelative = (currentTime - segment.start) * selectedVideoClip.speed + selectedVideoClip.startTrim;
    if (playheadRelative <= selectedVideoClip.startTrim + 0.5 || playheadRelative >= selectedVideoClip.endTrim - 0.5) {
      Alert.alert('Erreur', 'Impossible de couper trop près des extrémités du clip.');
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
    else Alert.alert('Info', 'Sélectionnez un élément sur la timeline pour le supprimer.');
  };

  const handleExport = () => navigation.navigate('Export');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBtnText}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{projectName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={undo} style={styles.iconBtn}><Text style={styles.iconBtnText}>↩️</Text></TouchableOpacity>
          <TouchableOpacity onPress={redo} style={styles.iconBtn}><Text style={styles.iconBtnText}>↪️</Text></TouchableOpacity>
          <TouchableOpacity onPress={handleSave} disabled={isSaving}>
            <Text style={styles.headerBtnText}>{isSaving ? '...' : '💾'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExport} style={styles.exportBtn}>
            <Text style={styles.exportBtnText}>Exporter ▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preview Player */}
      <View style={[styles.playerContainer, aspectRatio === '9:16' && styles.player916]}>
        {activeClip ? (
          <Video
            ref={playerRef}
            source={{ uri: activeClip.uri }}
            style={styles.videoPlayer}
            resizeMode="contain"
            paused={!isPlaying}
            muted={activeClip.volume === 0}
            volume={activeClip.volume}
            rate={activeClip.speed}
            onProgress={onProgress}
            playInBackground={false}
          />
        ) : (
          <View style={styles.placeholderPlayer}>
            <Text style={styles.placeholderIcon}>🎬</Text>
            <Text style={styles.placeholderText}>Appuyez sur "➕ Vidéo" pour commencer</Text>
          </View>
        )}
        {/* Text overlays */}
        {textOverlays.map((to) => {
          const visible = currentTime >= to.timelineStart && currentTime <= to.timelineStart + to.duration;
          if (!visible) return null;
          return (
            <Text key={to.id} style={[styles.playerTextOverlay, { color: to.color, fontSize: to.fontSize, left: `${to.positionX}%` as any, top: `${to.positionY}%` as any }]}>
              {to.text}
            </Text>
          );
        })}
        {/* Image/Sticker overlays */}
        {imageOverlays.map((io) => {
          const visible = currentTime >= io.timelineStart && currentTime <= io.timelineStart + io.duration;
          if (!visible) return null;
          return (
            <Text key={io.id} style={[styles.playerStickerOverlay, { fontSize: 80 * io.scale, left: `${io.positionX}%` as any, top: `${io.positionY}%` as any }]}>
              {io.uri}
            </Text>
          );
        })}
      </View>

      {/* Player Controls */}
      <View style={styles.playerControls}>
        <Text style={styles.timeLabel}>{currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s</Text>
        <TouchableOpacity style={styles.playPauseBtn} onPress={handlePlayPause}>
          <Text style={styles.playPauseIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <View style={{ width: 60 }} />
      </View>

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        <View style={styles.playhead} pointerEvents="none" />
        <ScrollView
          ref={timelineScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            if (!isPlaying) {
              setCurrentTime(e.nativeEvent.contentOffset.x / TIMELINE_SCALE);
            }
          }}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.timelineContent, { paddingLeft: SCREEN_WIDTH / 2 }]}
        >
          <View style={{ width: Math.max(totalDuration, 30) * TIMELINE_SCALE + SCREEN_WIDTH / 2 }}>
            {/* Ruler */}
            <View style={styles.timelineRuler}>
              {Array.from({ length: Math.ceil(Math.max(totalDuration, 30)) + 2 }).map((_, i) => (
                <View key={i} style={[styles.rulerGrad, { left: i * TIMELINE_SCALE }]}>
                  <View style={styles.rulerTick} />
                  <Text style={styles.rulerLabel}>{i}s</Text>
                </View>
              ))}
            </View>

            {/* Video Track */}
            <View style={styles.track}>
              <Text style={styles.trackLabel}>🎞️ Vidéo</Text>
              <View style={styles.trackRow}>
                {videoSegments.map((seg) => {
                  const isSelected = selectedClipId === seg.clip.id && selectedTrackType === 'video';
                  return (
                    <TouchableOpacity
                      key={seg.clip.id}
                      style={[styles.clipBlock, { width: Math.max(seg.duration * TIMELINE_SCALE, 40) }, isSelected && styles.clipSelected]}
                      onPress={() => selectClip(seg.clip.id, 'video')}
                    >
                      <Text style={styles.clipBlockText} numberOfLines={1}>{seg.clip.name}</Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={styles.addClipInline} onPress={handleAddVideo}>
                  <Text style={styles.addClipInlineText}>➕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Audio Track */}
            <View style={styles.track}>
              <Text style={styles.trackLabel}>🎵 Audio</Text>
              <View style={styles.trackRow}>
                {audioClips.map((ac) => {
                  const isSelected = selectedClipId === ac.id && selectedTrackType === 'audio';
                  const acDuration = ac.endTrim - ac.startTrim;
                  return (
                    <TouchableOpacity
                      key={ac.id}
                      style={[styles.audioBlock, { left: ac.timelineStart * TIMELINE_SCALE, width: Math.max(acDuration * TIMELINE_SCALE, 40) }, isSelected && styles.audioSelected]}
                      onPress={() => selectClip(ac.id, 'audio')}
                    >
                      <Text style={styles.clipBlockText} numberOfLines={1}>{ac.name}</Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={[styles.addClipInline, { marginLeft: audioClips.length > 0 ? 8 : 0 }]} onPress={handleAddAudioNative}>
                  <Text style={styles.addClipInlineText}>🎵➕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Overlays Track (Text + Stickers) */}
            <View style={styles.track}>
              <Text style={styles.trackLabel}>✨ Calques (Texte & Décors)</Text>
              <View style={styles.trackRow}>
                {textOverlays.map((to) => {
                  const isSelected = selectedClipId === to.id && selectedTrackType === 'text';
                  return (
                    <TouchableOpacity
                      key={to.id}
                      style={[styles.textBlock, { left: to.timelineStart * TIMELINE_SCALE, width: Math.max(to.duration * TIMELINE_SCALE, 40) }, isSelected && styles.textSelected]}
                      onPress={() => selectClip(to.id, 'text')}
                    >
                      <Text style={styles.clipBlockText} numberOfLines={1}>{to.text}</Text>
                    </TouchableOpacity>
                  );
                })}
                {imageOverlays.map((io) => {
                  const isSelected = selectedClipId === io.id && selectedTrackType === 'image';
                  return (
                    <TouchableOpacity
                      key={io.id}
                      style={[styles.stickerBlock, { left: io.timelineStart * TIMELINE_SCALE, width: Math.max(io.duration * TIMELINE_SCALE, 40) }, isSelected && styles.textSelected]}
                      onPress={() => selectClip(io.id, 'image')}
                    >
                      <Text style={styles.clipBlockText} numberOfLines={1}>{io.uri} Decor</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Toolbar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbar} contentContainerStyle={styles.toolbarContent}>
        <TouchableOpacity style={styles.toolBtn} onPress={handleAddVideo}>
          <Text style={styles.toolIcon}>➕</Text>
          <Text style={styles.toolLabel}>Vidéo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => setActiveModal('musicLib')}>
          <Text style={styles.toolIcon}>🎧</Text>
          <Text style={styles.toolLabel}>Musique</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => setActiveModal('stickers')}>
          <Text style={styles.toolIcon}>🎩</Text>
          <Text style={styles.toolLabel}>Stickers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={handleSplit}>
          <Text style={styles.toolIcon}>✂️</Text>
          <Text style={styles.toolLabel}>Diviser</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => selectedVideoClip ? setActiveModal('trim') : Alert.alert('Info', 'Sélectionnez un clip vidéo.')}>
          <Text style={styles.toolIcon}>⏳</Text>
          <Text style={styles.toolLabel}>Trim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => selectedVideoClip ? setActiveModal('filter') : Alert.alert('Info', 'Sélectionnez un clip vidéo.')}>
          <Text style={styles.toolIcon}>🎨</Text>
          <Text style={styles.toolLabel}>Filtres</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => { setTextInput(''); setActiveModal('text'); }}>
          <Text style={styles.toolIcon}>📝</Text>
          <Text style={styles.toolLabel}>Texte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={handleDelete}>
          <Text style={styles.toolIcon}>🗑️</Text>
          <Text style={styles.toolLabel}>Supprimer</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL: Music Library & Local Audio */}
      <Modal visible={activeModal === 'musicLib'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎧 Ajouter de la Musique</Text>
            
            <TouchableOpacity style={styles.localAudioBtn} onPress={() => { setActiveModal(null); handleAddAudioNative(); }}>
              <Text style={styles.localAudioBtnIcon}>📁</Text>
              <Text style={styles.localAudioBtnText}>Importer depuis le téléphone</Text>
            </TouchableOpacity>

            <View style={styles.divider} />
            <Text style={styles.libTitle}>Bibliothèque Gratuite en ligne :</Text>

            <ScrollView style={styles.musicList}>
              {ONLINE_MUSICS.map(track => (
                <TouchableOpacity key={track.id} style={styles.musicTrackItem} onPress={() => addOnlineMusic(track)}>
                  <Text style={styles.musicTrackIcon}>🎵</Text>
                  <Text style={styles.musicTrackName}>{track.name}</Text>
                  <Text style={styles.musicTrackAdd}>+</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Stickers & Decors */}
      <Modal visible={activeModal === 'stickers'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✨ Décors et Accessoires</Text>
            <View style={styles.stickersGrid}>
              {STICKERS.map(sticker => (
                <TouchableOpacity key={sticker.id} style={styles.stickerGridItem} onPress={() => addSticker(sticker)}>
                  <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
                  <Text style={styles.stickerName}>{sticker.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Filtres */}
      <Modal visible={activeModal === 'filter'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎨 Ajustement des Filtres</Text>
            {selectedVideoClip && (
              <View style={styles.modalBody}>
                <Text style={styles.label}>Luminosité ({selectedVideoClip.filter.brightness.toFixed(1)})</Text>
                <Slider style={styles.slider} minimumValue={0.5} maximumValue={1.5} value={selectedVideoClip.filter.brightness} onValueChange={(val) => updateVideoClip(selectedVideoClip.id, { filter: { ...selectedVideoClip.filter, brightness: val } })} />
              </View>
            )}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Texte */}
      <Modal visible={activeModal === 'text'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📝 Ajouter du Texte</Text>
            <TextInput style={styles.textInput} placeholder="Votre texte ici..." placeholderTextColor={Colors.text.tertiary} value={textInput} onChangeText={setTextInput} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setActiveModal(null)}><Text style={styles.btnText}>Annuler</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => { if (textInput.trim()) { addTextOverlay({ text: textInput, color: '#ffffff', fontSize: 24, fontFamily: 'System', timelineStart: currentTime, duration: 3, positionX: 40, positionY: 40 }); setActiveModal(null); } }}><Text style={styles.btnText}>Ajouter</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: Trim */}
      <Modal visible={activeModal === 'trim'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⏳ Découper le clip (Trim)</Text>
            {selectedVideoClip && (
              <View style={styles.modalBody}>
                <Text style={styles.label}>Début ({selectedVideoClip.startTrim.toFixed(1)}s)</Text>
                <Slider style={styles.slider} minimumValue={0} maximumValue={selectedVideoClip.duration - 0.5} value={selectedVideoClip.startTrim} onValueChange={(val) => { if (val < selectedVideoClip.endTrim - 0.5) updateVideoClip(selectedVideoClip.id, { startTrim: val }); }} />
                <Text style={styles.label}>Fin ({selectedVideoClip.endTrim.toFixed(1)}s)</Text>
                <Slider style={styles.slider} minimumValue={0.5} maximumValue={selectedVideoClip.duration} value={selectedVideoClip.endTrim} onValueChange={(val) => { if (val > selectedVideoClip.startTrim + 0.5) updateVideoClip(selectedVideoClip.id, { endTrim: val }); }} />
              </View>
            )}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}><Text style={styles.modalCloseBtnText}>Fermer</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderColor: Colors.border.subtle },
  headerBtnText: { color: Colors.text.secondary, fontSize: Typography.fontSize.sm, fontWeight: '600' },
  headerTitle: { color: Colors.text.primary, fontWeight: '700', fontSize: Typography.fontSize.base, maxWidth: 120 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBtn: { padding: Spacing.xs },
  iconBtnText: { fontSize: 16 },
  exportBtn: { backgroundColor: Colors.accent.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: 8 },
  exportBtnText: { color: Colors.text.primary, fontWeight: '700', fontSize: Typography.fontSize.sm },
  playerContainer: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  player916: { aspectRatio: 9 / 16, maxHeight: 320, alignSelf: 'center' },
  videoPlayer: { width: '100%', height: '100%' },
  placeholderPlayer: { justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { fontSize: 40, marginBottom: Spacing.sm },
  placeholderText: { color: Colors.text.tertiary, textAlign: 'center', paddingHorizontal: Spacing.lg },
  playerTextOverlay: { position: 'absolute', fontWeight: 'bold', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: Spacing.xs, borderRadius: 4 },
  playerStickerOverlay: { position: 'absolute' },
  playerControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderColor: Colors.border.subtle },
  timeLabel: { color: Colors.text.secondary, fontSize: Typography.fontSize.sm },
  playPauseBtn: { backgroundColor: Colors.bg.secondary, borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  playPauseIcon: { fontSize: 20, color: Colors.text.primary },
  timelineContainer: { flex: 1, backgroundColor: Colors.bg.secondary, position: 'relative' },
  playhead: { position: 'absolute', top: 0, bottom: 0, left: SCREEN_WIDTH / 2, width: 2, backgroundColor: '#FF3B30', zIndex: 10 },
  timelineContent: { paddingVertical: Spacing.sm },
  timelineRuler: { height: 28, borderBottomWidth: 1, borderColor: Colors.border.subtle, position: 'relative' },
  rulerGrad: { position: 'absolute', top: 0, width: 40, height: '100%', alignItems: 'center' },
  rulerTick: { width: 1, height: 8, backgroundColor: Colors.text.tertiary },
  rulerLabel: { fontSize: 9, color: Colors.text.tertiary, marginTop: 2 },
  track: { marginVertical: 2 },
  trackLabel: { color: Colors.text.tertiary, fontSize: Typography.fontSize.xs, marginLeft: Spacing.sm, marginBottom: 2 },
  trackRow: { height: 48, backgroundColor: 'rgba(0,0,0,0.2)', flexDirection: 'row', alignItems: 'center', position: 'relative' },
  clipBlock: { height: '85%', backgroundColor: Colors.accent.primary, borderColor: '#fff', borderWidth: 0.5, borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xs, marginHorizontal: 1 },
  clipSelected: { borderColor: '#FF3B30', borderWidth: 2 },
  audioBlock: { position: 'absolute', height: '75%', backgroundColor: Colors.timeline?.audioTrack || '#2dd4bf', borderColor: '#fff', borderWidth: 0.5, borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xs },
  audioSelected: { borderColor: '#FF3B30', borderWidth: 2 },
  textBlock: { position: 'absolute', height: '75%', backgroundColor: '#a855f7', borderColor: '#fff', borderWidth: 0.5, borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xs },
  textSelected: { borderColor: '#FF3B30', borderWidth: 2 },
  stickerBlock: { position: 'absolute', height: '75%', backgroundColor: '#F59E0B', borderColor: '#fff', borderWidth: 0.5, borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xs },
  clipBlockText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  addClipInline: { height: '75%', width: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)', borderWidth: 1, borderStyle: 'dashed', borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  addClipInlineText: { fontSize: 14 },
  toolbar: { backgroundColor: Colors.bg.primary, borderTopWidth: 1, borderColor: Colors.border.subtle, maxHeight: 70 },
  toolbarContent: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, gap: Spacing.xs },
  toolBtn: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, minWidth: 56 },
  toolIcon: { fontSize: 20 },
  toolLabel: { color: Colors.text.tertiary, fontSize: 10, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.bg.secondary, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.xl, paddingBottom: 40 },
  modalTitle: { color: Colors.text.primary, fontSize: Typography.fontSize.lg, fontWeight: '800', marginBottom: Spacing.lg, textAlign: 'center' },
  modalBody: { gap: Spacing.sm },
  label: { color: Colors.text.secondary, fontSize: Typography.fontSize.sm, marginBottom: 4 },
  slider: { width: '100%', height: 40 },
  textInput: { backgroundColor: Colors.bg.primary, borderRadius: 12, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, color: Colors.text.primary, fontSize: Typography.fontSize.base, borderWidth: 1, borderColor: Colors.border.default, marginBottom: Spacing.lg },
  modalActions: { flexDirection: 'row', gap: Spacing.md },
  btnPrimary: { flex: 1, backgroundColor: Colors.accent.primary, borderRadius: 12, paddingVertical: Spacing.md, alignItems: 'center' },
  btnSecondary: { flex: 1, backgroundColor: Colors.bg.primary, borderRadius: 12, paddingVertical: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border.default },
  btnText: { color: Colors.text.primary, fontWeight: '700', fontSize: Typography.fontSize.base },
  modalCloseBtn: { backgroundColor: Colors.accent.primary, borderRadius: 12, paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.lg },
  modalCloseBtnText: { color: '#fff', fontWeight: '700', fontSize: Typography.fontSize.base },
  
  // Audio Library specific
  localAudioBtn: { backgroundColor: Colors.bg.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.border.default, marginBottom: Spacing.md },
  localAudioBtnIcon: { fontSize: 24, marginRight: Spacing.sm },
  localAudioBtnText: { color: Colors.text.primary, fontWeight: '600', fontSize: Typography.fontSize.base },
  divider: { height: 1, backgroundColor: Colors.border.subtle, marginVertical: Spacing.md },
  libTitle: { color: Colors.text.secondary, fontSize: Typography.fontSize.sm, fontWeight: '600', marginBottom: Spacing.md },
  musicList: { maxHeight: 200 },
  musicTrackItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.primary, padding: Spacing.md, borderRadius: 8, marginBottom: Spacing.sm },
  musicTrackIcon: { fontSize: 20, marginRight: Spacing.md },
  musicTrackName: { flex: 1, color: Colors.text.primary, fontWeight: '600' },
  musicTrackAdd: { color: Colors.accent.primary, fontSize: 24, fontWeight: '700' },

  // Stickers Grid
  stickersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, justifyContent: 'center' },
  stickerGridItem: { backgroundColor: Colors.bg.primary, borderRadius: 12, padding: Spacing.md, alignItems: 'center', width: 80, height: 80, justifyContent: 'center', borderWidth: 1, borderColor: Colors.border.default },
  stickerEmoji: { fontSize: 32, marginBottom: 4 },
  stickerName: { color: Colors.text.secondary, fontSize: 10, textAlign: 'center' },
});
