// src/screens/EditorScreen.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Slider,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import { Colors, Spacing, Typography } from '../theme';
import { useEditorStore, VideoClip, AudioClip, TextOverlay } from '../store/editorStore';
import { FirebaseService } from '../services/firebase.service';
import { FFmpegService } from '../services/ffmpeg.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_SCALE = 30; // Pixels per second

export const EditorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    id: projectId,
    name: projectName,
    aspectRatio,
    videoClips,
    audioClips,
    textOverlays,
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
    updateTextOverlay,
    addAudioClip,
    removeAudioClip,
    undo,
    redo,
  } = useEditorStore();

  const playerRef = useRef<any>(null);
  const timelineScrollRef = useRef<ScrollView>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states for tools
  const [activeModal, setActiveModal] = useState<'trim' | 'filter' | 'text' | 'speed' | 'volume' | null>(null);
  const [textInput, setTextInput] = useState('');
  
  // Selected items resolved
  const selectedVideoClip = videoClips.find(c => c.id === selectedClipId && selectedTrackType === 'video');
  const selectedAudioClip = audioClips.find(c => c.id === selectedClipId && selectedTrackType === 'audio');
  const selectedTextOverlay = textOverlays.find(t => t.id === selectedClipId && selectedTrackType === 'text');

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

  // Resolve which clip is active under playhead
  const activeSegment = videoSegments.find(s => currentTime >= s.start && currentTime <= s.end) || videoSegments[videoSegments.length - 1];
  const activeClip = activeSegment?.clip;

  // Track playback time update
  const onProgress = (data: { currentTime: number }) => {
    if (isPlaying && activeSegment) {
      const absoluteTimelineTime = activeSegment.start + (data.currentTime - activeClip.startTrim) / activeClip.speed;
      setCurrentTime(absoluteTimelineTime);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await FirebaseService.saveProject({
        id: projectId,
        name: projectName,
        aspectRatio,
        videoClips: JSON.stringify(videoClips),
        audioClips: JSON.stringify(audioClips),
        textOverlays: JSON.stringify(textOverlays),
      });
      Alert.alert('Succès', 'Projet sauvegardé sur Firebase Firestore.');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le projet.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSplit = () => {
    if (!selectedVideoClip) {
      Alert.alert('Info', 'Sélectionnez un clip vidéo sur la timeline pour le diviser.');
      return;
    }

    // Determine current playhead position relative to the selected clip
    const segment = videoSegments.find(s => s.clip.id === selectedVideoClip.id);
    if (!segment) return;

    const playheadRelative = (currentTime - segment.start) * selectedVideoClip.speed + selectedVideoClip.startTrim;
    
    if (playheadRelative <= selectedVideoClip.startTrim + 0.5 || playheadRelative >= selectedVideoClip.endTrim - 0.5) {
      Alert.alert('Erreur', 'Impossible de couper trop près des extrémités du clip.');
      return;
    }

    // Clone and update
    const clipIndex = videoClips.findIndex(c => c.id === selectedVideoClip.id);
    
    const firstHalf: VideoClip = {
      ...selectedVideoClip,
      id: Math.random().toString(36).substring(7),
      name: `${selectedVideoClip.name}_Part1`,
      endTrim: playheadRelative,
    };

    const secondHalf: VideoClip = {
      ...selectedVideoClip,
      id: Math.random().toString(36).substring(7),
      name: `${selectedVideoClip.name}_Part2`,
      startTrim: playheadRelative,
    };

    const updatedClips = [...videoClips];
    updatedClips.splice(clipIndex, 1, firstHalf, secondHalf);
    
    useEditorStore.setState({ videoClips: updatedClips });
    useEditorStore.getState().saveToHistory();
    selectClip(firstHalf.id, 'video');
  };

  const handleExport = () => {
    navigation.navigate('Export');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />

      {/* Editor Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBtnText}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {projectName}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={undo} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>↩️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={redo} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>↪️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} disabled={isSaving}>
            <Text style={styles.headerBtnText}>{isSaving ? '...' : 'Sauvegarder 💾'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExport} style={styles.exportBtn}>
            <Text style={styles.exportBtnText}>Exporter ▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preview Player Area */}
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
            <Text style={styles.placeholderText}>Aucun média</Text>
          </View>
        )}

        {/* Dynamic Text Overlay preview */}
        {textOverlays.map((to) => {
          const isTextVisible = currentTime >= to.timelineStart && currentTime <= to.timelineStart + to.duration;
          if (!isTextVisible) return null;
          return (
            <Text
              key={to.id}
              style={[
                styles.playerTextOverlay,
                {
                  color: to.color,
                  fontSize: to.fontSize,
                  left: `${to.positionX}%`,
                  top: `${to.positionY}%`,
                },
              ]}
            >
              {to.text}
            </Text>
          );
        })}
      </View>

      {/* Player Time Controls */}
      <View style={styles.playerControls}>
        <Text style={styles.timeLabel}>
          {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
        </Text>
        <TouchableOpacity style={styles.playPauseBtn} onPress={handlePlayPause}>
          <Text style={styles.playPauseIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <View style={{ width: 60 }} />
      </View>

      {/* Scrollable Timeline */}
      <View style={styles.timelineContainer}>
        {/* Playhead indicator bar */}
        <View style={styles.playhead} pointerEvents="none" />

        <ScrollView
          ref={timelineScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            if (!isPlaying) {
              const scrollX = e.nativeEvent.contentOffset.x;
              const calculatedTime = scrollX / TIMELINE_SCALE;
              setCurrentTime(calculatedTime);
            }
          }}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.timelineContent, { paddingLeft: SCREEN_WIDTH / 2 }]}
        >
          {/* Timeline Tracks */}
          <View style={{ width: totalDuration * TIMELINE_SCALE + SCREEN_WIDTH / 2 }}>
            {/* 1. Ruler / Time grads */}
            <View style={styles.timelineRuler}>
              {Array.from({ length: Math.ceil(totalDuration) + 5 }).map((_, i) => (
                <View key={i} style={[styles.rulerGrad, { left: i * TIMELINE_SCALE }]}>
                  <View style={styles.rulerTick} />
                  <Text style={styles.rulerLabel}>{i}s</Text>
                </View>
              ))}
            </View>

            {/* 2. Video Track */}
            <View style={styles.track}>
              <Text style={styles.trackLabel}>🎞️ Vidéo</Text>
              <View style={styles.trackRow}>
                {videoSegments.map((seg) => {
                  const isSelected = selectedClipId === seg.clip.id && selectedTrackType === 'video';
                  return (
                    <TouchableOpacity
                      key={seg.clip.id}
                      style={[
                        styles.clipBlock,
                        { width: seg.duration * TIMELINE_SCALE },
                        isSelected && styles.clipSelected,
                      ]}
                      onPress={() => selectClip(seg.clip.id, 'video')}
                    >
                      <Text style={styles.clipBlockText} numberOfLines={1}>
                        {seg.clip.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. Audio Track */}
            <View style={styles.track}>
              <Text style={styles.trackLabel}>🎵 Audio</Text>
              <View style={styles.trackRow}>
                {audioClips.map((ac) => {
                  const isSelected = selectedClipId === ac.id && selectedTrackType === 'audio';
                  const acDuration = ac.endTrim - ac.startTrim;
                  return (
                    <TouchableOpacity
                      key={ac.id}
                      style={[
                        styles.audioBlock,
                        {
                          left: ac.timelineStart * TIMELINE_SCALE,
                          width: acDuration * TIMELINE_SCALE,
                        },
                        isSelected && styles.audioSelected,
                      ]}
                      onPress={() => selectClip(ac.id, 'audio')}
                    >
                      <Text style={styles.clipBlockText} numberOfLines={1}>
                        {ac.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Text Track */}
            <View style={styles.track}>
              <Text style={styles.trackLabel}>📝 Texte</Text>
              <View style={styles.trackRow}>
                {textOverlays.map((to) => {
                  const isSelected = selectedClipId === to.id && selectedTrackType === 'text';
                  return (
                    <TouchableOpacity
                      key={to.id}
                      style={[
                        styles.textBlock,
                        {
                          left: to.timelineStart * TIMELINE_SCALE,
                          width: to.duration * TIMELINE_SCALE,
                        },
                        isSelected && styles.textSelected,
                      ]}
                      onPress={() => selectClip(to.id, 'text')}
                    >
                      <Text style={styles.clipBlockText} numberOfLines={1}>
                        {to.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Editor Toolbar (Bottom) */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={handleSplit}>
          <Text style={styles.toolIcon}>✂️</Text>
          <Text style={styles.toolLabel}>Diviser</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolBtn} onPress={() => setActiveModal('trim')}>
          <Text style={styles.toolIcon}>⏳</Text>
          <Text style={styles.toolLabel}>Trim</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolBtn} onPress={() => setActiveModal('filter')}>
          <Text style={styles.toolIcon}>🎨</Text>
          <Text style={styles.toolLabel}>Filtres</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolBtn} onPress={() => { setTextInput(''); setActiveModal('text'); }}>
          <Text style={styles.toolIcon}>📝</Text>
          <Text style={styles.toolLabel}>Texte</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolBtn} onPress={() => setActiveModal('speed')}>
          <Text style={styles.toolIcon}>⚡</Text>
          <Text style={styles.toolLabel}>Vitesse</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolBtn} onPress={() => setActiveModal('volume')}>
          <Text style={styles.toolIcon}>🔊</Text>
          <Text style={styles.toolLabel}>Volume</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => {
            if (selectedTrackType === 'video' && selectedClipId) {
              removeVideoClip(selectedClipId);
            } else if (selectedTrackType === 'audio' && selectedClipId) {
              removeAudioClip(selectedClipId);
            } else if (selectedTrackType === 'text' && selectedClipId) {
              removeTextOverlay(selectedClipId);
            } else {
              Alert.alert('Info', 'Sélectionnez un élément sur la timeline pour le supprimer.');
            }
          }}
        >
          <Text style={styles.toolIcon}>🗑️</Text>
          <Text style={styles.toolLabel}>Supprimer</Text>
        </TouchableOpacity>
      </View>

      {/* 🛠️ EDIT PROPERTIES MODALS */}
      
      {/* 1. FILTER ADJUSTMENTS MODAL */}
      <Modal visible={activeModal === 'filter'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajustement des Filtres</Text>
            {selectedVideoClip ? (
              <View style={styles.modalBody}>
                <Text style={styles.label}>Luminosité ({selectedVideoClip.filter.brightness.toFixed(1)})</Text>
                <Slider
                  minimumValue={0.5}
                  maximumValue={1.5}
                  value={selectedVideoClip.filter.brightness}
                  onValueChange={(val) => {
                    updateVideoClip(selectedVideoClip.id, {
                      filter: { ...selectedVideoClip.filter, brightness: val }
                    });
                  }}
                />

                <Text style={styles.label}>Contraste ({selectedVideoClip.filter.contrast.toFixed(1)})</Text>
                <Slider
                  minimumValue={0.5}
                  maximumValue={1.5}
                  value={selectedVideoClip.filter.contrast}
                  onValueChange={(val) => {
                    updateVideoClip(selectedVideoClip.id, {
                      filter: { ...selectedVideoClip.filter, contrast: val }
                    });
                  }}
                />

                <Text style={styles.label}>Saturation ({selectedVideoClip.filter.saturation.toFixed(1)})</Text>
                <Slider
                  minimumValue={0.5}
                  maximumValue={1.5}
                  value={selectedVideoClip.filter.saturation}
                  onValueChange={(val) => {
                    updateVideoClip(selectedVideoClip.id, {
                      filter: { ...selectedVideoClip.filter, saturation: val }
                    });
                  }}
                />
              </View>
            ) : (
              <Text style={styles.errorText}>Sélectionnez d'abord un clip vidéo.</Text>
            )}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. TEXT ADDER MODAL */}
      <Modal visible={activeModal === 'text'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter du Texte</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Votre texte ici..."
              placeholderTextColor={Colors.text.tertiary}
              value={textInput}
              onChangeText={setTextInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => setActiveModal(null)}
              >
                <Text style={styles.btnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => {
                  if (textInput.trim() !== '') {
                    addTextOverlay({
                      text: textInput,
                      color: '#ffffff',
                      fontSize: 24,
                      fontFamily: 'System',
                      timelineStart: currentTime,
                      duration: 3,
                      positionX: 40,
                      positionY: 40,
                    });
                    setActiveModal(null);
                  }
                }}
              >
                <Text style={styles.btnText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. SPEED MULTIPLIER MODAL */}
      <Modal visible={activeModal === 'speed'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Vitesse de lecture</Text>
            {selectedVideoClip ? (
              <View style={styles.speedOptions}>
                {[0.25, 0.5, 1.0, 1.5, 2.0, 4.0].map((sp) => (
                  <TouchableOpacity
                    key={sp}
                    style={[styles.speedOption, selectedVideoClip.speed === sp && styles.speedOptionSelected]}
                    onPress={() => {
                      updateVideoClip(selectedVideoClip.id, { speed: sp });
                    }}
                  >
                    <Text style={styles.speedText}>{sp}x</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.errorText}>Sélectionnez d'abord un clip vidéo.</Text>
            )}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4. VOLUME SLIDER MODAL */}
      <Modal visible={activeModal === 'volume'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajuster le volume</Text>
            {selectedVideoClip ? (
              <View style={styles.modalBody}>
                <Text style={styles.label}>Volume du clip ({Math.round(selectedVideoClip.volume * 100)}%)</Text>
                <Slider
                  minimumValue={0.0}
                  maximumValue={1.0}
                  value={selectedVideoClip.volume}
                  onValueChange={(val) => {
                    updateVideoClip(selectedVideoClip.id, { volume: val });
                  }}
                />
              </View>
            ) : (
              <Text style={styles.errorText}>Sélectionnez d'abord un clip vidéo.</Text>
            )}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 5. TRIM CLIP MODAL */}
      <Modal visible={activeModal === 'trim'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Découper le clip (Trim)</Text>
            {selectedVideoClip ? (
              <View style={styles.modalBody}>
                <Text style={styles.label}>Début ({selectedVideoClip.startTrim.toFixed(1)}s)</Text>
                <Slider
                  minimumValue={0}
                  maximumValue={selectedVideoClip.duration - 0.5}
                  value={selectedVideoClip.startTrim}
                  onValueChange={(val) => {
                    if (val < selectedVideoClip.endTrim) {
                      updateVideoClip(selectedVideoClip.id, { startTrim: val });
                    }
                  }}
                />

                <Text style={styles.label}>Fin ({selectedVideoClip.endTrim.toFixed(1)}s)</Text>
                <Slider
                  minimumValue={0.5}
                  maximumValue={selectedVideoClip.duration}
                  value={selectedVideoClip.endTrim}
                  onValueChange={(val) => {
                    if (val > selectedVideoClip.startTrim) {
                      updateVideoClip(selectedVideoClip.id, { endTrim: val });
                    }
                  }}
                />
              </View>
            ) : (
              <Text style={styles.errorText}>Sélectionnez d'abord un clip vidéo.</Text>
            )}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderColor: Colors.border.subtle,
  },
  headerBtnText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  headerTitle: {
    color: Colors.text.primary,
    fontWeight: '700',
    fontSize: Typography.fontSize.base,
    maxWidth: 120,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    padding: Spacing.xs,
  },
  iconBtnText: {
    fontSize: 16,
  },
  exportBtn: {
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  exportBtnText: {
    color: Colors.text.primary,
    fontWeight: '700',
    fontSize: Typography.fontSize.sm,
  },
  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  player916: {
    aspectRatio: 9 / 16,
    maxHeight: 320,
    alignSelf: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  placeholderPlayer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.text.tertiary,
  },
  playerTextOverlay: {
    position: 'absolute',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: Spacing.xs,
    borderRadius: 4,
  },
  playerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderColor: Colors.border.subtle,
  },
  timeLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
  },
  playPauseBtn: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    fontSize: 20,
    color: Colors.text.primary,
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: Colors.bg.secondary,
    position: 'relative',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: SCREEN_WIDTH / 2,
    width: 2,
    backgroundColor: Colors.timeline.playhead,
    zIndex: 10,
  },
  timelineContent: {
    paddingVertical: Spacing.md,
  },
  timelineRuler: {
    height: 30,
    borderBottomWidth: 1,
    borderColor: Colors.border.subtle,
    position: 'relative',
  },
  rulerGrad: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: '100%',
    alignItems: 'center',
  },
  rulerTick: {
    width: 1,
    height: 8,
    backgroundColor: Colors.text.tertiary,
  },
  rulerLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  track: {
    marginVertical: Spacing.xs,
  },
  trackLabel: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.xs,
    marginLeft: Spacing.sm,
    marginBottom: 2,
  },
  trackRow: {
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  clipBlock: {
    height: '90%',
    backgroundColor: Colors.accent.primary,
    borderColor: '#fff',
    borderWidth: 0.5,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  clipSelected: {
    borderColor: Colors.accent.pink,
    borderWidth: 2,
  },
  audioBlock: {
    position: 'absolute',
    height: '80%',
    backgroundColor: Colors.timeline.audioTrack,
    borderColor: '#fff',
    borderWidth: 0.5,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  audioSelected: {
    borderColor: Colors.accent.pink,
    borderWidth: 2,
  },
  textBlock: {
    position: 'absolute',
    height: '80%',
    backgroundColor: Colors.timeline.textTrack,
    borderColor: '#fff',
    borderWidth: 0.5,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  textSelected: {
    borderColor: Colors.accent.pink,
    borderWidth: 2,
  },
  clipBlockText: {
    color: '#fff',
    fontSize: Typography.fontSize.xs,
    fontWeight: 'bold',
  },
  toolbar: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.bg.primary,
  },
  toolBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  toolLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.bg.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderColor: Colors.border.default,
  },
  modalTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalBody: {
    marginVertical: Spacing.md,
  },
  label: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.sm,
  },
  modalCloseBtn: {
    backgroundColor: Colors.bg.tertiary,
    borderRadius: 10,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  modalCloseBtnText: {
    color: Colors.text.primary,
    fontWeight: '700',
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  textInput: {
    backgroundColor: Colors.bg.tertiary,
    borderColor: Colors.border.default,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    color: Colors.text.primary,
    fontSize: Typography.fontSize.base,
    marginVertical: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: Colors.accent.primary,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: Colors.bg.tertiary,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: Colors.text.primary,
    fontWeight: '700',
  },
  speedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  speedOption: {
    backgroundColor: Colors.bg.tertiary,
    borderColor: Colors.border.default,
    borderWidth: 1,
    borderRadius: 10,
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedOptionSelected: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  speedText: {
    color: Colors.text.primary,
    fontWeight: '700',
  },
});
