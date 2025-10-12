import { PerformanceFlags } from './types';

const DEFAULT_FLAGS: PerformanceFlags = {
  heroPreload: false,
  heroFetchPriorityHigh: false,
  fontPreconnect: false,
  reserveHeroSpace: false,
  lateBanner: false,
  injectThirdParty: false,
  loadExtraCSS: false,
  lazyOff: false,
  listenersPassive: false,
  simulateLongTask: false,
  useWorker: false,
  debounce: false,
  microYield: false,
  missingSizes: false,
  intrinsicPlaceholders: false,
};

export function getFlags(): PerformanceFlags {
  if (typeof window === 'undefined') return DEFAULT_FLAGS;
  
  try {
    const stored = localStorage.getItem('hypercart-flags');
    if (stored) {
      return { ...DEFAULT_FLAGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load flags from localStorage:', error);
  }
  
  return DEFAULT_FLAGS;
}

export function setFlag(key: keyof PerformanceFlags, value: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    const current = getFlags();
    const updated = { ...current, [key]: value };
    localStorage.setItem('hypercart-flags', JSON.stringify(updated));
    
    // Update global state for immediate access
    if (!window.__hypercart) {
      window.__hypercart = { flags: updated };
    } else {
      window.__hypercart.flags = updated;
    }
    
    // Trigger storage event for cross-component updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'hypercart-flags',
      newValue: JSON.stringify(updated),
    }));
  } catch (error) {
    console.warn('Failed to save flags to localStorage:', error);
  }
}

export function toggleFlag(key: keyof PerformanceFlags): void {
  const current = getFlags();
  setFlag(key, !current[key]);
}

export function getActiveFlags(): (keyof PerformanceFlags)[] {
  const flags = getFlags();
  return Object.entries(flags)
    .filter(([, value]) => value)
    .map(([key]) => key as keyof PerformanceFlags);
}

export function getActiveFlagCount(): number {
  return getActiveFlags().length;
}

// Initialize global state
if (typeof window !== 'undefined') {
  window.__hypercart = {
    flags: getFlags(),
  };
}

declare global {
  interface Window {
    __hypercart: {
      flags: PerformanceFlags;
    };
  }
}