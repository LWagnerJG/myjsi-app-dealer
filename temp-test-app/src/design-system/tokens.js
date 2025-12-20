// Design System Tokens
// Unified design system for consistent UI across the dealer app

export const DESIGN_TOKENS = {
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },
  
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px'
  },
  
  typography: {
    h1: { size: '2rem', weight: 700, lineHeight: 1.2 },
    h2: { size: '1.5rem', weight: 600, lineHeight: 1.3 },
    h3: { size: '1.25rem', weight: 600, lineHeight: 1.4 },
    h4: { size: '1.125rem', weight: 600, lineHeight: 1.4 },
    body: { size: '0.875rem', weight: 400, lineHeight: 1.5 },
    bodyLarge: { size: '1rem', weight: 400, lineHeight: 1.5 },
    small: { size: '0.75rem', weight: 400, lineHeight: 1.4 },
    tiny: { size: '0.625rem', weight: 500, lineHeight: 1.3 }
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
    '2xl': '0 25px 50px rgba(0,0,0,0.25)'
  },
  
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Status color mappings
export const STATUS_STYLES = {
  success: { 
    bg: '#10B98120', 
    color: '#10B981', 
    darkBg: '#10B98130',
    darkColor: '#34D399'
  },
  warning: { 
    bg: '#F59E0B20', 
    color: '#F59E0B',
    darkBg: '#F59E0B30',
    darkColor: '#FBBF24'
  },
  error: { 
    bg: '#EF444420', 
    color: '#EF4444',
    darkBg: '#EF444430',
    darkColor: '#F87171'
  },
  info: { 
    bg: '#3B82F620', 
    color: '#3B82F6',
    darkBg: '#3B82F630',
    darkColor: '#60A5FA'
  },
  pending: { 
    bg: '#6B728020', 
    color: '#6B7280',
    darkBg: '#6B728030',
    darkColor: '#9CA3AF'
  }
};

// Helper function to get spacing value
export const spacing = (key) => DESIGN_TOKENS.spacing[key] || DESIGN_TOKENS.spacing.md;

// Helper function to get border radius
export const radius = (key) => DESIGN_TOKENS.borderRadius[key] || DESIGN_TOKENS.borderRadius.md;

// Helper function to get shadow
export const shadow = (key) => DESIGN_TOKENS.shadows[key] || DESIGN_TOKENS.shadows.md;

// Helper function to get transition
export const transition = (key) => DESIGN_TOKENS.transitions[key] || DESIGN_TOKENS.transitions.normal;
