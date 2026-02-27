import { EMOTIONS, CONTEXTS, MAX_EMOTIONS, MAX_INTENSITY, MIN_INTENSITY, DEFAULT_INTENSITY, MAX_NOTE_LENGTH } from '@/lib/constants';

describe('constants', () => {
  describe('EMOTIONS', () => {
    it('has exactly 10 emotions', () => {
      expect(EMOTIONS).toHaveLength(10);
    });

    it('each emotion has id, name, nameEn, category', () => {
      EMOTIONS.forEach((e) => {
        expect(e).toHaveProperty('id');
        expect(e).toHaveProperty('name');
        expect(e).toHaveProperty('nameEn');
        expect(e).toHaveProperty('category');
      });
    });

    it('ids are unique', () => {
      const ids = EMOTIONS.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('categories are only positive or negative', () => {
      EMOTIONS.forEach((e) => {
        expect(['positive', 'negative']).toContain(e.category);
      });
    });
  });

  describe('CONTEXTS', () => {
    it('has 6 contexts', () => {
      expect(CONTEXTS).toHaveLength(6);
    });

    it('each context has id and name', () => {
      CONTEXTS.forEach((c) => {
        expect(c).toHaveProperty('id');
        expect(c).toHaveProperty('name');
      });
    });

    it('ids are unique', () => {
      const ids = CONTEXTS.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('validation constants', () => {
    it('MAX_EMOTIONS is 3', () => {
      expect(MAX_EMOTIONS).toBe(3);
    });

    it('intensity range is 1-5', () => {
      expect(MIN_INTENSITY).toBe(1);
      expect(MAX_INTENSITY).toBe(5);
    });

    it('DEFAULT_INTENSITY is within range', () => {
      expect(DEFAULT_INTENSITY).toBeGreaterThanOrEqual(MIN_INTENSITY);
      expect(DEFAULT_INTENSITY).toBeLessThanOrEqual(MAX_INTENSITY);
    });

    it('MAX_NOTE_LENGTH is 200', () => {
      expect(MAX_NOTE_LENGTH).toBe(200);
    });
  });
});
