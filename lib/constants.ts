export const EMOTIONS = [
  { id: 1, name: '긴장', nameEn: 'tension', category: 'negative' },
  { id: 2, name: '불안', nameEn: 'anxiety', category: 'negative' },
  { id: 3, name: '피로', nameEn: 'fatigue', category: 'negative' },
  { id: 4, name: '안정', nameEn: 'calm', category: 'positive' },
  { id: 5, name: '설렘', nameEn: 'excitement', category: 'positive' },
  { id: 6, name: '무기력', nameEn: 'lethargy', category: 'negative' },
  { id: 7, name: '집중', nameEn: 'focus', category: 'positive' },
  { id: 8, name: '만족', nameEn: 'satisfaction', category: 'positive' },
  { id: 9, name: '외로움', nameEn: 'loneliness', category: 'negative' },
  { id: 10, name: '혼란', nameEn: 'confusion', category: 'negative' },
] as const;

export const CONTEXTS = [
  { id: 'work', name: '업무' },
  { id: 'relationship', name: '관계' },
  { id: 'health', name: '건강' },
  { id: 'family', name: '가족' },
  { id: 'growth', name: '자기계발' },
  { id: 'other', name: '기타' },
] as const;

export const MAX_EMOTIONS = 3;
export const MAX_INTENSITY = 5;
export const MIN_INTENSITY = 1;
export const DEFAULT_INTENSITY = 3;
export const MAX_NOTE_LENGTH = 200;

export type EmotionId = (typeof EMOTIONS)[number]['id'];
export type EmotionName = (typeof EMOTIONS)[number]['name'];
export type ContextId = (typeof CONTEXTS)[number]['id'];
