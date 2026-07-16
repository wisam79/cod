/**
 * Utility to trigger haptic feedback (vibration) in a consistent and deduplicated way.
 * Supports predefined patterns or custom patterns/durations.
 */
const HAPTIC_PATTERNS = {
  light: 10,
  medium: 20,
  soft: 5,
  rigid: 25,
  heavy: [10, 30, 10],
  success: [10, 50, 20],
  warning: [12, 40, 12],
  error: [30, 50, 30, 50, 30],
  close: 8,
  submit: 15,
  tick: 6,
  selection: 4
};

const DEFAULT_DEDUPE_MS = 80;
let lastFiredAt = 0;

export function triggerHaptic(pattern = 'light', options = {}) {
  if (typeof window === 'undefined' || !window.navigator || !('vibrate' in window.navigator)) return;

  const { dedupe = DEFAULT_DEDUPE_MS, force = false } = options;
  const now = performance.now();
  if (!force && now - lastFiredAt < dedupe) return;
  lastFiredAt = now;

  if (typeof pattern === 'number' || Array.isArray(pattern)) {
    window.navigator.vibrate(pattern);
    return;
  }

  const preset = HAPTIC_PATTERNS[pattern];
  if (preset === undefined) {
    window.navigator.vibrate(HAPTIC_PATTERNS.light);
    return;
  }
  window.navigator.vibrate(preset);
}

export function resetHapticDedupe() {
  lastFiredAt = 0;
}
