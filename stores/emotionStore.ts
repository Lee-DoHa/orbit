import { create } from 'zustand';
import type { EmotionId, ContextId } from '@/lib/constants';
import { DEFAULT_INTENSITY } from '@/lib/constants';

type MirrorResult = {
  understanding: string;
  structure: string;
  suggestion: string;
  question?: string | null;
};

type EmotionEntry = {
  id: string;
  emotionIds: EmotionId[];
  intensity: number;
  context: ContextId | null;
  note: string;
  mirrorResult: MirrorResult | null;
  createdAt: string;
};

type EmotionState = {
  selectedEmotions: EmotionId[];
  intensity: number;
  context: ContextId | null;
  note: string;
  isSubmitting: boolean;
  mirrorResult: MirrorResult | null;
  entries: EmotionEntry[];

  toggleEmotion: (id: EmotionId) => void;
  setIntensity: (value: number) => void;
  setContext: (id: ContextId) => void;
  setNote: (text: string) => void;
  setSubmitting: (val: boolean) => void;
  setMirrorResult: (result: MirrorResult | null) => void;
  addEntry: (entry: EmotionEntry) => void;
  reset: () => void;
};

const MAX_EMOTIONS = 3;

export const useEmotionStore = create<EmotionState>((set) => ({
  selectedEmotions: [],
  intensity: DEFAULT_INTENSITY,
  context: null,
  note: '',
  isSubmitting: false,
  mirrorResult: null,
  entries: [],

  toggleEmotion: (id) =>
    set((state) => ({
      selectedEmotions: state.selectedEmotions.includes(id)
        ? state.selectedEmotions.filter((e) => e !== id)
        : state.selectedEmotions.length < MAX_EMOTIONS
          ? [...state.selectedEmotions, id]
          : state.selectedEmotions,
    })),

  setIntensity: (value) => set({ intensity: value }),
  setContext: (id) => set({ context: id }),
  setNote: (text) => set({ note: text }),
  setSubmitting: (val) => set({ isSubmitting: val }),
  setMirrorResult: (result) => set({ mirrorResult: result }),
  addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),

  reset: () =>
    set({
      selectedEmotions: [],
      intensity: DEFAULT_INTENSITY,
      context: null,
      note: '',
      isSubmitting: false,
      mirrorResult: null,
    }),
}));
