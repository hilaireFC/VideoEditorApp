// src/store/editorStore.ts
import { create } from 'zustand';

export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
}

export interface VideoClip {
  id: string;
  name: string;
  uri: string;
  type: 'video' | 'image';
  duration: number;
  startTrim: number;
  endTrim: number;
  volume: number;
  speed: number;
  filter: FilterSettings;
  thumbnail: string;
}

export interface AudioClip {
  id: string;
  name: string;
  uri: string;
  duration: number;
  startTrim: number;
  endTrim: number;
  volume: number;
  timelineStart: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  timelineStart: number;
  duration: number;
  positionX: number;
  positionY: number;
}

export interface ImageOverlay {
  id: string;
  uri: string;
  isEmoji: boolean;
  timelineStart: number;
  duration: number;
  positionX: number;
  positionY: number;
  scale: number;
}

interface ProjectState {
  id: string;
  name: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  videoClips: VideoClip[];
  audioClips: AudioClip[];
  textOverlays: TextOverlay[];
  imageOverlays: ImageOverlay[];
  currentTime: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  selectedTrackType: 'video' | 'audio' | 'text' | 'image' | null;
  history: Array<{
    videoClips: VideoClip[];
    audioClips: AudioClip[];
    textOverlays: TextOverlay[];
    imageOverlays: ImageOverlay[];
  }>;
  historyIndex: number;
}

interface EditorActions {
  setProjectName: (name: string) => void;
  setAspectRatio: (ratio: '16:9' | '9:16' | '1:1' | '4:3') => void;
  resetProject: (id: string, name: string) => void;
  loadProject: (project: Omit<ProjectState, 'isPlaying' | 'currentTime' | 'selectedClipId' | 'selectedTrackType' | 'history' | 'historyIndex'>) => void;
  
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  selectClip: (id: string | null, type: 'video' | 'audio' | 'text' | 'image' | null) => void;
  
  addVideoClip: (clip: Omit<VideoClip, 'startTrim' | 'endTrim' | 'volume' | 'speed' | 'filter'>) => void;
  removeVideoClip: (id: string) => void;
  updateVideoClip: (id: string, updates: Partial<Omit<VideoClip, 'id'>>) => void;
  reorderVideoClips: (clips: VideoClip[]) => void;
  
  addAudioClip: (clip: Omit<AudioClip, 'startTrim' | 'endTrim' | 'volume'>) => void;
  removeAudioClip: (id: string) => void;
  updateAudioClip: (id: string, updates: Partial<Omit<AudioClip, 'id'>>) => void;
  
  addTextOverlay: (text: Omit<TextOverlay, 'id'>) => void;
  removeTextOverlay: (id: string) => void;
  updateTextOverlay: (id: string, updates: Partial<Omit<TextOverlay, 'id'>>) => void;

  addImageOverlay: (image: Omit<ImageOverlay, 'id'>) => void;
  removeImageOverlay: (id: string) => void;
  updateImageOverlay: (id: string, updates: Partial<Omit<ImageOverlay, 'id'>>) => void;

  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export type EditorStore = ProjectState & EditorActions;

const initialProjectState: ProjectState = {
  id: '',
  name: 'Nouveau Projet',
  aspectRatio: '16:9',
  videoClips: [],
  audioClips: [],
  textOverlays: [],
  imageOverlays: [],
  currentTime: 0,
  isPlaying: false,
  selectedClipId: null,
  selectedTrackType: null,
  history: [],
  historyIndex: -1,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialProjectState,

  setProjectName: (name) => set({ name }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  
  resetProject: (id, name) => set({
    ...initialProjectState,
    id,
    name,
    history: [],
    historyIndex: -1,
  }),

  loadProject: (project) => set({
    ...project,
    currentTime: 0,
    isPlaying: false,
    selectedClipId: null,
    selectedTrackType: null,
    history: [
      {
        videoClips: project.videoClips || [],
        audioClips: project.audioClips || [],
        textOverlays: project.textOverlays || [],
        imageOverlays: project.imageOverlays || [],
      }
    ],
    historyIndex: 0,
  }),

  setCurrentTime: (currentTime) => {
    const totalDur = get().videoClips.reduce((acc, c) => acc + ((c.endTrim - c.startTrim) / c.speed), 0);
    const clamped = Math.max(0, Math.min(currentTime, totalDur));
    set({ currentTime: clamped });
  },

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  selectClip: (selectedClipId, selectedTrackType) => set({ selectedClipId, selectedTrackType }),

  addVideoClip: (clip) => {
    const newClip: VideoClip = {
      ...clip,
      startTrim: 0,
      endTrim: clip.duration,
      volume: 1.0,
      speed: 1.0,
      filter: { brightness: 1.0, contrast: 1.0, saturation: 1.0 },
    };
    const updatedClips = [...get().videoClips, newClip];
    set({ videoClips: updatedClips });
    get().saveToHistory();
  },

  removeVideoClip: (id) => {
    const updatedClips = get().videoClips.filter(c => c.id !== id);
    const isSelected = get().selectedClipId === id;
    set({
      videoClips: updatedClips,
      selectedClipId: isSelected ? null : get().selectedClipId,
      selectedTrackType: isSelected ? null : get().selectedTrackType,
    });
    get().saveToHistory();
  },

  updateVideoClip: (id, updates) => {
    const updatedClips = get().videoClips.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    set({ videoClips: updatedClips });
    get().saveToHistory();
  },

  reorderVideoClips: (clips) => {
    set({ videoClips: clips });
    get().saveToHistory();
  },

  addAudioClip: (clip) => {
    const newClip: AudioClip = {
      ...clip,
      startTrim: 0,
      endTrim: clip.duration,
      volume: 1.0,
    };
    set({ audioClips: [...get().audioClips, newClip] });
    get().saveToHistory();
  },

  removeAudioClip: (id) => {
    const updated = get().audioClips.filter(c => c.id !== id);
    const isSelected = get().selectedClipId === id;
    set({
      audioClips: updated,
      selectedClipId: isSelected ? null : get().selectedClipId,
      selectedTrackType: isSelected ? null : get().selectedTrackType,
    });
    get().saveToHistory();
  },

  updateAudioClip: (id, updates) => {
    const updated = get().audioClips.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    set({ audioClips: updated });
    get().saveToHistory();
  },

  addTextOverlay: (text) => {
    const id = Math.random().toString(36).substring(7);
    const newText: TextOverlay = { id, ...text };
    set({ textOverlays: [...get().textOverlays, newText] });
    get().saveToHistory();
  },

  removeTextOverlay: (id) => {
    const updated = get().textOverlays.filter(t => t.id !== id);
    const isSelected = get().selectedClipId === id;
    set({
      textOverlays: updated,
      selectedClipId: isSelected ? null : get().selectedClipId,
      selectedTrackType: isSelected ? null : get().selectedTrackType,
    });
    get().saveToHistory();
  },

  updateTextOverlay: (id, updates) => {
    const updated = get().textOverlays.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    set({ textOverlays: updated });
    get().saveToHistory();
  },

  addImageOverlay: (image) => {
    const id = Math.random().toString(36).substring(7);
    const newImage: ImageOverlay = { id, ...image };
    set({ imageOverlays: [...get().imageOverlays, newImage] });
    get().saveToHistory();
  },

  removeImageOverlay: (id) => {
    const updated = get().imageOverlays.filter(i => i.id !== id);
    const isSelected = get().selectedClipId === id;
    set({
      imageOverlays: updated,
      selectedClipId: isSelected ? null : get().selectedClipId,
      selectedTrackType: isSelected ? null : get().selectedTrackType,
    });
    get().saveToHistory();
  },

  updateImageOverlay: (id, updates) => {
    const updated = get().imageOverlays.map(i => 
      i.id === id ? { ...i, ...updates } : i
    );
    set({ imageOverlays: updated });
    get().saveToHistory();
  },

  saveToHistory: () => {
    const { videoClips, audioClips, textOverlays, imageOverlays, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      videoClips: JSON.parse(JSON.stringify(videoClips)),
      audioClips: JSON.parse(JSON.stringify(audioClips)),
      textOverlays: JSON.parse(JSON.stringify(textOverlays)),
      imageOverlays: JSON.parse(JSON.stringify(imageOverlays || [])),
    });
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const snapshot = history[targetIndex];
      set({
        videoClips: snapshot.videoClips,
        audioClips: snapshot.audioClips,
        textOverlays: snapshot.textOverlays,
        imageOverlays: snapshot.imageOverlays,
        historyIndex: targetIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const snapshot = history[targetIndex];
      set({
        videoClips: snapshot.videoClips,
        audioClips: snapshot.audioClips,
        textOverlays: snapshot.textOverlays,
        imageOverlays: snapshot.imageOverlays,
        historyIndex: targetIndex,
      });
    }
  },
}));
