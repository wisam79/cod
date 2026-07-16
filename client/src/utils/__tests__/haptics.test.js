import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerHaptic } from '../haptics';

describe('triggerHaptic', () => {
  let vibrateSpy;

  beforeEach(() => {
    vibrateSpy = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateSpy,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('triggers vibrate with default light pattern (10ms)', () => {
    triggerHaptic();
    expect(vibrateSpy).toHaveBeenCalledWith(10);
  });

  it('triggers vibrate with light pattern', () => {
    triggerHaptic('light');
    expect(vibrateSpy).toHaveBeenCalledWith(10);
  });

  it('triggers vibrate with medium pattern', () => {
    triggerHaptic('medium');
    expect(vibrateSpy).toHaveBeenCalledWith(20);
  });

  it('triggers vibrate with heavy pattern', () => {
    triggerHaptic('heavy');
    expect(vibrateSpy).toHaveBeenCalledWith([10, 30, 10]);
  });

  it('triggers vibrate with success pattern', () => {
    triggerHaptic('success');
    expect(vibrateSpy).toHaveBeenCalledWith([10, 50, 20]);
  });

  it('triggers vibrate with error pattern', () => {
    triggerHaptic('error');
    expect(vibrateSpy).toHaveBeenCalledWith([30, 50, 30, 50, 30]);
  });

  it('triggers vibrate with close pattern', () => {
    triggerHaptic('close');
    expect(vibrateSpy).toHaveBeenCalledWith(8);
  });

  it('triggers vibrate with submit pattern', () => {
    triggerHaptic('submit');
    expect(vibrateSpy).toHaveBeenCalledWith(15);
  });

  it('triggers vibrate with default for unknown pattern', () => {
    triggerHaptic('unknown');
    expect(vibrateSpy).toHaveBeenCalledWith(10);
  });

  it('triggers vibrate with numeric pattern', () => {
    triggerHaptic(50);
    expect(vibrateSpy).toHaveBeenCalledWith(50);
  });

  it('triggers vibrate with array pattern', () => {
    triggerHaptic([10, 20, 30]);
    expect(vibrateSpy).toHaveBeenCalledWith([10, 20, 30]);
  });

  it('does not throw if navigator.vibrate is not available', () => {
    const originalVibrate = navigator.vibrate;
    delete navigator.vibrate;
    expect(() => triggerHaptic('light')).not.toThrow();
    navigator.vibrate = originalVibrate;
  });
});
