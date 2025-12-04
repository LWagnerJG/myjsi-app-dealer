// JSI Visual Identity Theme
// ===========================
// Brand Philosophy: Modern, Accessible, Confident
// Typography: Neue Haas Grotesk Display Pro
// Color Approach: Earth-toned, warm, grounded (NO pure black)

// JSI Health Color Palette
const JSI_PALETTE = {
    // Primary
    charcoal: '#353535',      // Primary text & action (replaces pure black)
    white: '#FFFFFF',         // High contrast
    
    // Earth-Toned Neutrals
    stone: '#E3E0D8',         // Warm neutral
    warmBeige: '#F0EDE8',     // Soft background
    sageGrey: '#DFE2DD',      // Cool neutral
    lightGrey: '#EAECE9',     // Lightest neutral
    
    // Softer Accent Options (less stark than pure charcoal)
    warmCharcoal: '#4A4543',  // Warmer, softer charcoal
    earthBrown: '#5C534A',    // Earth-toned brown-grey
    slateGrey: '#4E5552',     // Cooler slate option
    
    // Semantic
    success: '#4A7C59',       // Earthy green
    warning: '#C4956A',       // Warm amber
    error: '#B85C5C',         // Muted red
    info: '#5B7B8C',          // Slate blue
};

export const lightTheme = {
    colors: {
        background: JSI_PALETTE.warmBeige,        // #F0EDE8 - Warm Beige
        surface: JSI_PALETTE.white,               // #FFFFFF - Clean white for cards
        primary: JSI_PALETTE.charcoal,            // #353535 - Primary text
        accent: JSI_PALETTE.warmCharcoal,         // #4A4543 - Softer accent for buttons/CTAs
        secondary: JSI_PALETTE.sageGrey,          // #DFE2DD - Secondary elements
        textPrimary: JSI_PALETTE.charcoal,        // #353535 - Main text (NO pure black)
        textSecondary: '#5C5C5C',                 // Softer secondary text
        border: JSI_PALETTE.stone,                // #E3E0D8 - Subtle borders
        shadow: 'rgba(53,53,53,0.12)',            // Charcoal-based shadow
        subtle: JSI_PALETTE.lightGrey,            // #EAECE9 - Subtle backgrounds
        stone: JSI_PALETTE.stone,                 // For explicit stone usage
        sageGrey: JSI_PALETTE.sageGrey,           // For explicit sage usage
        // Semantic colors
        success: JSI_PALETTE.success,
        warning: JSI_PALETTE.warning,
        error: JSI_PALETTE.error,
        info: JSI_PALETTE.info,
    },
    backdropFilter: 'blur(24px)',                 // JSI blur level
    fontFamily: '"Neue Haas Grotesk Display Pro", "Helvetica Neue", Helvetica, Arial, sans-serif',
};

export const darkTheme = {
    colors: {
        background: '#1A1A1A',                    // Deep charcoal (not pure black)
        surface: '#252525',                       // Card surfaces
        primary: JSI_PALETTE.white,               // Inverted for dark mode
        accent: '#B8B0A8',                        // Warm light accent on dark
        secondary: '#888888',                     // Muted secondary
        textPrimary: '#F5F5F5',                   // Off-white text
        textSecondary: '#A0A0A0',                 // Softer secondary
        border: 'rgba(255,255,255,0.1)',          // Subtle light borders
        shadow: 'rgba(0,0,0,0.4)',                // Deeper shadows
        subtle: 'rgba(255,255,255,0.06)',         // Subtle highlights
        stone: '#3A3A3A',                         // Dark mode stone
        sageGrey: '#2F2F2F',                      // Dark mode sage
        // Semantic colors (adjusted for dark)
        success: '#6B9B7A',
        warning: '#D4A87A',
        error: '#C87070',
        info: '#7B9BAC',
    },
    backdropFilter: 'blur(24px)',
    fontFamily: '"Neue Haas Grotesk Display Pro", "Helvetica Neue", Helvetica, Arial, sans-serif',
};

export const logoLight = 'https://i.imgur.com/qskYhB0.png';