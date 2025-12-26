import React from 'react';

// JSI Brand Colors - NEVER use pure black (#000000)
// Primary: Charcoal #353535 | Earth neutrals: Stone, Beige, Sage
const JSI_CHARCOAL = '#353535';
const JSI_STONE = '#E3E0D8';
const JSI_WARM_BEIGE = '#F0EDE8';

export const lightTheme = {
    colors: {
        background: JSI_WARM_BEIGE,        // Warm beige background
        surface: '#ffffff',
        primary: JSI_CHARCOAL,             // Charcoal primary (NOT blue)
        secondary: '#5B7B8C',              // Slate blue (JSI info color)
        accent: '#C4956A',                 // Warm amber (JSI warning)
        textPrimary: JSI_CHARCOAL,         // Charcoal text (NO pure black)
        textSecondary: '#6c757d',
        border: '#d1d1d6',
        subtle: JSI_STONE,                 // Stone for subtle backgrounds
        shadow: 'rgba(53, 53, 53, 0.1)',   // Charcoal-based shadow
        charcoal: JSI_CHARCOAL,
        stone: JSI_STONE,
        success: '#4A7C59',
        warning: '#C4956A',
        error: '#B85C5C',
    },
    backdropFilter: 'blur(10px)',
};

export const darkTheme = {
    colors: {
        background: '#1a1a1a',             // Dark charcoal (NOT pure black)
        surface: '#252525',                // Elevated dark surface
        primary: '#ffffff',
        secondary: '#8BA4B0',              // Lighter slate for dark mode
        accent: '#D4A574',                 // Lighter amber for dark mode
        textPrimary: '#ffffff',
        textSecondary: '#8e8e93',
        border: '#38383a',
        subtle: '#2c2c2e',
        shadow: 'rgba(0, 0, 0, 0.3)',
        charcoal: JSI_CHARCOAL,
        stone: JSI_STONE,
        success: '#5A9469',
        warning: '#D4A574',
        error: '#C86C6C',
    },
    backdropFilter: 'blur(10px)',
};
