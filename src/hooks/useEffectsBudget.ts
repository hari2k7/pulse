import { useState, useEffect } from 'react';

export type EffectsBudget = 'lite' | 'full';

/**
 * Single isLite check per Step 2:
 * - Viewport under 768px
 * - pointer: coarse OR hover: none
 * - saveData active OR 2g / slow-2g
 * - deviceMemory <= 4 OR hardwareConcurrency <= 4
 * - prefers-reduced-motion is active
 */
export function isLiteDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Viewport under 768px
  if (window.innerWidth < 768) return true;

  // 2. Touch / coarse pointer or no hover support
  try {
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches) {
      return true;
    }
  } catch {
    // Media query fallback
  }

  // 3. Reduced motion preference
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
  } catch {
    // Fallback
  }

  const nav = navigator as unknown as {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };

  // 4. saveData header / API active
  try {
    if (nav.connection?.saveData === true || window.matchMedia('(save-data: on)').matches) {
      return true;
    }
  } catch {
    // Fallback
  }

  // 5. 2G / slow-2G connection
  if (nav.connection?.effectiveType === '2g' || nav.connection?.effectiveType === 'slow-2g') {
    return true;
  }

  // 6. Device memory <= 4 GB
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) {
    return true;
  }

  // 7. Hardware concurrency <= 4 cores
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) {
    return true;
  }

  return false;
}

export function getEffectsBudget(): EffectsBudget {
  return isLiteDevice() ? 'lite' : 'full';
}

/**
 * React hook returning "lite" or "full" based on device constraints.
 */
export function useEffectsBudget(): EffectsBudget {
  const [budget, setBudget] = useState<EffectsBudget>(() => getEffectsBudget());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUpdate = () => {
      setBudget(getEffectsBudget());
    };

    window.addEventListener('resize', handleUpdate, { passive: true });

    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMq.addEventListener?.('change', handleUpdate);

    const pointerMq = window.matchMedia('(pointer: coarse)');
    pointerMq.addEventListener?.('change', handleUpdate);

    const nav = navigator as unknown as {
      connection?: EventTarget;
    };
    if (nav.connection) {
      nav.connection.addEventListener?.('change', handleUpdate);
    }

    return () => {
      window.removeEventListener('resize', handleUpdate);
      motionMq.removeEventListener?.('change', handleUpdate);
      pointerMq.removeEventListener?.('change', handleUpdate);
      if (nav.connection) {
        nav.connection.removeEventListener?.('change', handleUpdate);
      }
    };
  }, []);

  return budget;
}
