import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerHaptic, resetHapticDedupe } from '../haptics';

describe('triggerHaptic', () => {
  let vibrateSpy;

  beforeEach(() => {
    vibrateSpy = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateSpy,
      writable: true,
      configurable: true
    });
    resetHapticDedupe();
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

  it('triggers new patterns: soft, rigid, tick, selection, warning', () => {
    triggerHaptic('soft', { force: true });
    expect(vibrateSpy).toHaveBeenLastCalledWith(5);
    triggerHaptic('rigid', { force: true });
    expect(vibrateSpy).toHaveBeenLastCalledWith(25);
    triggerHaptic('tick', { force: true });
    expect(vibrateSpy).toHaveBeenLastCalledWith(6);
    triggerHaptic('selection', { force: true });
    expect(vibrateSpy).toHaveBeenLastCalledWith(4);
    triggerHaptic('warning', { force: true });
    expect(vibrateSpy).toHaveBeenLastCalledWith([12, 40, 12]);
  });

  it('deduplicates rapid calls within the default window', () => {
    triggerHaptic('light');
    triggerHaptic('medium');
    triggerHaptic('heavy');
    expect(vibrateSpy).toHaveBeenCalledTimes(1);
    expect(vibrateSpy).toHaveBeenCalledWith(10);
  });

  it('can bypass deduplication via force flag', () => {
    triggerHaptic('light');
    triggerHaptic('light', { force: true });
    triggerHaptic('medium', { force: true });
    expect(vibrateSpy).toHaveBeenCalledTimes(3);
    expect(vibrateSpy).toHaveBeenNthCalledWith(2, 10);
    expect(vibrateSpy).toHaveBeenLastCalledWith(20);
  });

  it('respects a custom dedupe window', () => {
    triggerHaptic('light', { dedupe: 0 });
    triggerHaptic('medium', { dedupe: 0 });
    triggerHaptic('heavy', { dedupe: 0 });
    expect(vibrateSpy).toHaveBeenCalledTimes(3);
    expect(vibrateSpy).toHaveBeenLastCalledWith([10, 30, 10]);
  });

  it('resetHapticDedupe lets the next call go through immediately', () => {
    triggerHaptic('light');
    expect(vibrateSpy).toHaveBeenCalledTimes(1);
    triggerHaptic('medium');
    expect(vibrateSpy).toHaveBeenCalledTimes(1);
    resetHapticDedupe();
    triggerHaptic('medium');
    expect(vibrateSpy).toHaveBeenCalledTimes(2);
  });
});
