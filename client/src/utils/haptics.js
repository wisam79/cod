/**
 * Utility to trigger haptic feedback (vibration) in a consistent and deduplicated way.
 * Supports predefined patterns or custom patterns/durations.
 */
export function triggerHaptic(pattern = 'light') {
  if (typeof window !== 'undefined' && window.navigator && 'vibrate' in window.navigator) {
    if (typeof pattern === 'number' || Array.isArray(pattern)) {
      window.navigator.vibrate(pattern);
      return;
    }
    switch (pattern) {
      case 'light':
        window.navigator.vibrate(10);
        break;
      case 'medium':
        window.navigator.vibrate(20);
        break;
      case 'heavy':
        window.navigator.vibrate([10, 30, 10]);
        break;
      case 'success':
        window.navigator.vibrate([10, 50, 20]);
        break;
      case 'error':
        window.navigator.vibrate([30, 50, 30, 50, 30]);
        break;
      case 'close':
        window.navigator.vibrate(8);
        break;
      case 'submit':
        window.navigator.vibrate(15);
        break;
      default:
        window.navigator.vibrate(10);
    }
  }
}
