// Unified Spacing Utilities
// Use these instead of hardcoded Tailwind classes for consistency
import { DESIGN_TOKENS } from '../design-system/tokens.js';

/**
 * Get consistent spacing value from design tokens
 * @param {string} size - xs, sm, md, lg, xl, 2xl, 3xl
 * @returns {string} CSS spacing value
 */
export const getSpacing = (size = 'md') => {
  return DESIGN_TOKENS.spacing[size] || DESIGN_TOKENS.spacing.md;
};

/**
 * Standard spacing classes for consistent margins and padding
 * These map to design tokens and should be used throughout the app
 */
export const SPACING_CLASSES = {
  // Padding
  padding: {
    xs: 'p-1',      // 4px
    sm: 'p-2',      // 8px
    md: 'p-4',      // 16px
    lg: 'p-6',      // 24px
    xl: 'p-8',      // 32px
    '2xl': 'p-12',  // 48px
  },
  paddingX: {
    xs: 'px-1',
    sm: 'px-2',
    md: 'px-4',
    lg: 'px-6',
    xl: 'px-8',
    '2xl': 'px-12',
  },
  paddingY: {
    xs: 'py-1',
    sm: 'py-2',
    md: 'py-4',
    lg: 'py-6',
    xl: 'py-8',
    '2xl': 'py-12',
  },
  paddingTop: {
    xs: 'pt-1',
    sm: 'pt-2',
    md: 'pt-4',
    lg: 'pt-6',
    xl: 'pt-8',
    '2xl': 'pt-12',
  },
  paddingBottom: {
    xs: 'pb-1',
    sm: 'pb-2',
    md: 'pb-4',
    lg: 'pb-6',
    xl: 'pb-8',
    '2xl': 'pb-12',
  },
  // Margins
  margin: {
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
    '2xl': 'm-12',
  },
  marginX: {
    xs: 'mx-1',
    sm: 'mx-2',
    md: 'mx-4',
    lg: 'mx-6',
    xl: 'mx-8',
    '2xl': 'mx-12',
  },
  marginY: {
    xs: 'my-1',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
    '2xl': 'my-12',
  },
  marginTop: {
    xs: 'mt-1',
    sm: 'mt-2',
    md: 'mt-4',
    lg: 'mt-6',
    xl: 'mt-8',
    '2xl': 'mt-12',
  },
  marginBottom: {
    xs: 'mb-1',
    sm: 'mb-2',
    md: 'mb-4',
    lg: 'mb-6',
    xl: 'mb-8',
    '2xl': 'mb-12',
  },
  // Gaps
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12',
  },
};

/**
 * Standard screen content padding
 * Use for consistent horizontal padding across screens
 */
export const SCREEN_PADDING = {
  mobile: 'px-4',
  desktop: 'lg:px-6',
  both: 'px-4 lg:px-6',
};

/**
 * Standard screen content spacing
 * Use for consistent vertical spacing between sections
 */
export const SCREEN_SPACING = {
  section: 'mb-6 lg:mb-8',
  subsection: 'mb-4 lg:mb-6',
  item: 'mb-3 lg:mb-4',
};

/**
 * Content max-width classes for responsive layouts
 */
export const CONTENT_MAX_WIDTH = {
  sm: 'max-w-md mx-auto',
  md: 'max-w-lg mx-auto',
  lg: 'max-w-3xl mx-auto',
  xl: 'max-w-4xl mx-auto',
  '2xl': 'max-w-5xl mx-auto',
  '3xl': 'max-w-6xl mx-auto',
  full: 'max-w-full',
};

