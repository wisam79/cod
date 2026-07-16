import { describe, it, expect } from 'vitest';
import { translatePriority } from '../translations';

describe('translatePriority', () => {
  it('translates high priority to Arabic', () => {
    expect(translatePriority('high')).toBe('عالية');
  });

  it('translates medium priority to Arabic', () => {
    expect(translatePriority('medium')).toBe('متوسطة');
  });

  it('translates low priority to Arabic', () => {
    expect(translatePriority('low')).toBe('منخفضة');
  });

  it('returns default متوسطة for unknown priority', () => {
    expect(translatePriority('unknown')).toBe('متوسطة');
  });

  it('returns default متوسطة for empty string', () => {
    expect(translatePriority('')).toBe('متوسطة');
  });

  it('returns default متوسطة for null', () => {
    expect(translatePriority(null)).toBe('متوسطة');
  });

  it('returns default متوسطة for undefined', () => {
    expect(translatePriority(undefined)).toBe('متوسطة');
  });
});
