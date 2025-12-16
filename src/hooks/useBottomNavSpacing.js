// Hook to calculate proper bottom padding for mobile navigation
// Ensures content doesn't overlap with bottom nav regardless of screen size or zoom
import { useMemo } from 'react';
import { useIsDesktop } from './useResponsive.js';

const MOBILE_NAV_HEIGHT = 80; // Height of bottom nav bar
const EXTRA_PADDING = 24; // Extra padding for visual breathing room

export const useBottomNavSpacing = (additionalPadding = 0) => {
  const isDesktop = useIsDesktop();
  
  return useMemo(() => {
    if (isDesktop) {
      return additionalPadding || 0;
    }
    
    // Calculate safe area bottom inset
    const safeAreaBottom = typeof window !== 'undefined' 
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0', 10) 
      : 0;
    
    // Total bottom padding = nav height + safe area + extra padding + any additional
    return MOBILE_NAV_HEIGHT + safeAreaBottom + EXTRA_PADDING + additionalPadding;
  }, [isDesktop, additionalPadding]);
};

// CSS class name for consistent bottom padding
export const BOTTOM_NAV_PADDING_CLASS = 'pb-mobile-nav-safe';

