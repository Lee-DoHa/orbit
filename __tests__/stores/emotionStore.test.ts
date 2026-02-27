import { useEmotionStore } from '@/stores/emotionStore';
import { DEFAULT_INTENSITY } from '@/lib/constants';
import type { EmotionId, ContextId } from '@/lib/constants';

describe('emotionStore', () => {
  beforeEach(() => {
    useEmotionStore.setState({
      selectedEmotions: [],
      intensity: DEFAULT_INTENSITY,
      context: null,
      note: '',
      isSubmitting: false,
      mirrorResult: null,
      entries: [],
    });
  });

  describe('initial state', () => {
    it('has empty selectedEmotions', () => {
      expect(useEmotionStore.getState().selectedEmotions).toEqual([]);
    });

    it('has default intensity', () => {
      expect(useEmotionStore.getState().intensity).toBe(DEFAULT_INTENSITY);
    });

    it('has null context', () => {
      expect(useEmotionStore.getState().context).toBeNull();
    });

    it('has empty note', () => {
      expect(useEmotionStore.getState().note).toBe('');
    });

    it('is not submitting', () => {
      expect(useEmotionStore.getState().isSubmitting).toBe(false);
    });
  });

  describe('toggleEmotion', () => {
    it('adds emotion when not selected', () => {
      useEmotionStore.getState().toggleEmotion(1 as EmotionId);
      expect(useEmotionStore.getState().selectedEmotions).toEqual([1]);
    });

    it('removes emotion when already selected', () => {
      useEmotionStore.setState({ selectedEmotions: [1 as EmotionId] });
      useEmotionStore.getState().toggleEmotion(1 as EmotionId);
      expect(useEmotionStore.getState().selectedEmotions).toEqual([]);
    });

    it('allows up to 3 emotions', () => {
      useEmotionStore.getState().toggleEmotion(1 as EmotionId);
      useEmotionStore.getState().toggleEmotion(2 as EmotionId);
      useEmotionStore.getState().toggleEmotion(3 as EmotionId);
      expect(useEmotionStore.getState().selectedEmotions).toEqual([1, 2, 3]);
    });

    it('does not add 4th emotion', () => {
      useEmotionStore.setState({ selectedEmotions: [1, 2, 3] as EmotionId[] });
      useEmotionStore.getState().toggleEmotion(4 as EmotionId);
      expect(useEmotionStore.getState().selectedEmotions).toEqual([1, 2, 3]);
    });

    it('can remove from full list and add different one', () => {
      useEmotionStore.setState({ selectedEmotions: [1, 2, 3] as EmotionId[] });
      useEmotionStore.getState().toggleEmotion(2 as EmotionId);
      expect(useEmotionStore.getState().selectedEmotions).toEqual([1, 3]);
      useEmotionStore.getState().toggleEmotion(5 as EmotionId);
      expect(useEmotionStore.getState().selectedEmotions).toEqual([1, 3, 5]);
    });
  });

  describe('setIntensity', () => {
    it('sets intensity value', () => {
      useEmotionStore.getState().setIntensity(5);
      expect(useEmotionStore.getState().intensity).toBe(5);
    });
  });

  describe('setContext', () => {
    it('sets context id', () => {
      useEmotionStore.getState().setContext('work' as ContextId);
      expect(useEmotionStore.getState().context).toBe('work');
    });
  });

  describe('setNote', () => {
    it('sets note text', () => {
      useEmotionStore.getState().setNote('테스트 메모');
      expect(useEmotionStore.getState().note).toBe('테스트 메모');
    });
  });

  describe('setSubmitting', () => {
    it('sets submitting state', () => {
      useEmotionStore.getState().setSubmitting(true);
      expect(useEmotionStore.getState().isSubmitting).toBe(true);
    });
  });

  describe('setMirrorResult', () => {
    it('sets mirror result', () => {
      const result = {
        understanding: '이해',
        structure: '구조',
        suggestion: '제안',
        question: '질문',
      };
      useEmotionStore.getState().setMirrorResult(result);
      expect(useEmotionStore.getState().mirrorResult).toEqual(result);
    });

    it('sets mirror result to null', () => {
      useEmotionStore.getState().setMirrorResult(null);
      expect(useEmotionStore.getState().mirrorResult).toBeNull();
    });
  });

  describe('addEntry', () => {
    it('adds entry to beginning of list', () => {
      const entry1 = {
        id: '1',
        emotionIds: [1] as EmotionId[],
        intensity: 3,
        context: 'work' as ContextId,
        note: '첫 번째',
        mirrorResult: null,
        createdAt: '2026-01-01',
      };
      const entry2 = {
        id: '2',
        emotionIds: [2] as EmotionId[],
        intensity: 4,
        context: 'health' as ContextId,
        note: '두 번째',
        mirrorResult: null,
        createdAt: '2026-01-02',
      };

      useEmotionStore.getState().addEntry(entry1);
      useEmotionStore.getState().addEntry(entry2);

      const entries = useEmotionStore.getState().entries;
      expect(entries).toHaveLength(2);
      expect(entries[0].id).toBe('2');
      expect(entries[1].id).toBe('1');
    });
  });

  describe('reset', () => {
    it('resets input state but keeps entries', () => {
      useEmotionStore.setState({
        selectedEmotions: [1, 2] as EmotionId[],
        intensity: 5,
        context: 'work' as ContextId,
        note: '메모',
        isSubmitting: true,
        mirrorResult: { understanding: 'a', structure: 'b', suggestion: 'c' },
        entries: [
          {
            id: '1',
            emotionIds: [1] as EmotionId[],
            intensity: 3,
            context: null,
            note: '',
            mirrorResult: null,
            createdAt: '2026-01-01',
          },
        ],
      });

      useEmotionStore.getState().reset();

      const state = useEmotionStore.getState();
      expect(state.selectedEmotions).toEqual([]);
      expect(state.intensity).toBe(DEFAULT_INTENSITY);
      expect(state.context).toBeNull();
      expect(state.note).toBe('');
      expect(state.isSubmitting).toBe(false);
      expect(state.mirrorResult).toBeNull();
      expect(state.entries).toHaveLength(1);
    });
  });
});
