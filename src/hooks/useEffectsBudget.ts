import { useState, useEffect } from 'react';

export type EffectsBudget = 'lite' | 'full';

/**
 * Determines whether the device should run in "lite" mode:
 * - saveData is active
 * - 2G / slow-2G connection
 * - deviceMemory <= 2 GB
 * - hardwareConcurrency <= 4 cores
 * - prefers-reduced-motion is active
 */
export function getEffectsBudget(): EffectsBudget {
  if (typeof window === 'undefined') return 'full';

  // 1. Reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'lite';
  }

  const nav = navigator as unknown as {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };

  // 2. saveData header / API active
  if (nav.connection?.saveData === true || window.matchMedia('(save-data: on)').matches) {
    return 'lite';
  }

  // 3. 2G effective network type
  if (nav.connection?.effectiveType === '2g' || nav.connection?.effectiveType === 'slow-2g') {
    return 'lite';
  }

  // 4. Low device memory (<= 2GB)
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) {
    return 'lite';
  }

  // 5. Low CPU hardware concurrency (<= 4 cores)
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) {
    return 'lite';
  }

  return 'full';
}

/**
 * React hook returning "lite" or "full" based on device constraints.
 * In lite mode:
 * - Disables canvas particles (SlingRingPortal & BackToTop)
 * - Disables music-note cursor trail (keeps diamond cursor)
 * - Disables GSAP parallax in Hero
 * - Disables Ken Burns drift in EventDetail banner
 * - Disables spark orbits
 *
 * Everything remains fully usable and visually grounded in the Doctor Strange theme.
 */
export function useEffectsBudget(): EffectsBudget {
  const [budget, setBudget] = useState<EffectsBudget>(() => getEffectsBudget());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => {
      setBudget(getEffectsBudget());
    };

    mediaQuery.addEventListener?.('change', handleMotionChange);

    const nav = navigator as unknown as {
      connection?: EventTarget & { saveData?: boolean; effectiveType?: string };
    };
    if (nav.connection) {
      nav.connection.addEventListener?.('change', handleMotionChange);
    }

    return () => {
      mediaQuery.removeEventListener?.('change', handleMotionChange);
      if (nav.connection) {
        nav.connection.removeEventListener?.('change', handleMotionChange);
      }
    };
  }, []);

  return budget;
}
