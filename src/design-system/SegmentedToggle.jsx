// JSI Segmented Toggle Component
// Unified toggle/tab component for consistent UI across all screens
// Strictly pill-shaped with earth-toned colors
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DESIGN_TOKENS, JSI_COLORS, JSI_TYPOGRAPHY } from './tokens.js';

/**
 * JSI SegmentedToggle - Unified toggle component
 * 
 * Variants:
 * - pills: Filled background indicator (default, most common)
 * - underline: Animated underline indicator
 * - outlined: Border-based with fill on active
 * 
 * Sizes:
 * - sm: Compact for tight spaces
 * - md: Default size
 * - lg: Prominent toggles
 */
export const SegmentedToggle = ({
    options = [],           // [{ key: string, label: string, icon?: Component }]
    value,                  // Currently selected key
    onChange,               // (key) => void
    theme,
    variant = 'pills',      // 'pills' | 'underline' | 'outlined'
    size = 'md',
    fullWidth = true,       // Whether to expand to fill container
    className = '',
    style = {},
}) => {
    const containerRef = useRef(null);
    const buttonRefs = useRef([]);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
    
    // Size configurations
    const sizes = {
        sm: { height: 40, px: 16, text: 13, iconSize: 14, gap: 6 },
        md: { height: 48, px: 20, text: 14, iconSize: 16, gap: 8 },
        lg: { height: 56, px: 24, text: 15, iconSize: 18, gap: 10 },
    };
    
    const s = sizes[size] || sizes.md;
    
    // Get accent color - use softer Stone-based color instead of stark Charcoal
    const accentColor = theme?.colors?.accent || JSI_COLORS.charcoal;
    const surfaceColor = theme?.colors?.surface || JSI_COLORS.white;
    const borderColor = theme?.colors?.border || JSI_COLORS.stone;
    const textPrimary = theme?.colors?.textPrimary || JSI_COLORS.charcoal;
    const textSecondary = theme?.colors?.textSecondary || '#666666';
    
    // Update indicator position
    const updateIndicator = useCallback(() => {
        const activeIndex = options.findIndex(opt => opt.key === value);
        if (activeIndex === -1 || !buttonRefs.current[activeIndex] || !containerRef.current) {
            setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
            return;
        }
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const buttonRect = buttonRefs.current[activeIndex].getBoundingClientRect();
        
        setIndicatorStyle({
            left: buttonRect.left - containerRect.left,
            width: buttonRect.width,
            opacity: 1,
        });
    }, [value, options]);
    
    useEffect(() => {
        updateIndicator();
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [updateIndicator]);
    
    // Render based on variant
    if (variant === 'underline') {
        return (
            <div
                ref={containerRef}
                className={`relative flex ${className}`}
                style={{
                    borderBottom: `1px solid ${borderColor}`,
                    ...style,
                }}
            >
                {options.map((opt, index) => {
                    const isActive = opt.key === value;
                    const Icon = opt.icon;
                    
                    return (
                        <button
                            key={opt.key}
                            ref={el => buttonRefs.current[index] = el}
                            onClick={() => onChange?.(opt.key)}
                            className="flex-1 flex items-center justify-center gap-2 transition-colors"
                            style={{
                                height: s.height,
                                fontSize: s.text,
                                fontFamily: JSI_TYPOGRAPHY.fontFamily,
                                fontWeight: 600,
                                color: isActive ? textPrimary : textSecondary,
                            }}
                        >
                            {Icon && (
                                <Icon 
                                    style={{ 
                                        width: s.iconSize, 
                                        height: s.iconSize,
                                        color: isActive ? accentColor : textSecondary,
                                    }} 
                                />
                            )}
                            {opt.label}
                        </button>
                    );
                })}
                
                {/* Animated underline */}
                <motion.div
                    className="absolute bottom-0 h-[3px] rounded-full"
                    style={{
                        backgroundColor: accentColor,
                        left: indicatorStyle.left,
                        width: indicatorStyle.width,
                        opacity: indicatorStyle.opacity,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                    }}
                    layout
                />
            </div>
        );
    }
    
    if (variant === 'outlined') {
        return (
            <div
                ref={containerRef}
                className={`inline-flex rounded-full border overflow-hidden ${fullWidth ? 'w-full' : ''} ${className}`}
                style={{
                    height: s.height,
                    borderColor: borderColor,
                    backgroundColor: surfaceColor,
                    boxShadow: DESIGN_TOKENS.shadows.sm,
                    ...style,
                }}
            >
                {options.map((opt, index) => {
                    const isActive = opt.key === value;
                    const Icon = opt.icon;
                    
                    return (
                        <button
                            key={opt.key}
                            ref={el => buttonRefs.current[index] = el}
                            onClick={() => onChange?.(opt.key)}
                            className="flex-1 flex items-center justify-center gap-2 transition-all duration-200"
                            style={{
                                fontSize: s.text,
                                fontFamily: JSI_TYPOGRAPHY.fontFamily,
                                fontWeight: 600,
                                backgroundColor: isActive ? accentColor : 'transparent',
                                color: isActive ? JSI_COLORS.white : textPrimary,
                                borderRight: index < options.length - 1 ? `1px solid ${borderColor}` : 'none',
                            }}
                        >
                            {Icon && (
                                <Icon 
                                    style={{ 
                                        width: s.iconSize, 
                                        height: s.iconSize,
                                    }} 
                                />
                            )}
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        );
    }
    
    // Default: Pills variant with sliding indicator
    return (
        <div
            ref={containerRef}
            className={`relative flex p-1 rounded-full ${fullWidth ? 'w-full' : ''} ${className}`}
            style={{
                backgroundColor: JSI_COLORS.stone,
                height: s.height + 8, // Extra for padding
                boxShadow: 'inset 0 1px 2px rgba(53,53,53,0.06)',
                ...style,
            }}
        >
            {/* Sliding indicator */}
            <motion.div
                className="absolute top-1 bottom-1 rounded-full"
                style={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                    backgroundColor: surfaceColor,
                    boxShadow: DESIGN_TOKENS.shadows.md,
                    opacity: indicatorStyle.opacity,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 35,
                }}
                layout
            />
            
            {options.map((opt, index) => {
                const isActive = opt.key === value;
                const Icon = opt.icon;
                
                return (
                    <button
                        key={opt.key}
                        ref={el => buttonRefs.current[index] = el}
                        onClick={() => onChange?.(opt.key)}
                        className="relative flex-1 flex items-center justify-center gap-2 z-10 transition-colors duration-200"
                        style={{
                            fontSize: s.text,
                            fontFamily: JSI_TYPOGRAPHY.fontFamily,
                            fontWeight: 600,
                            color: isActive ? accentColor : textSecondary,
                        }}
                    >
                        {Icon && (
                            <Icon 
                                style={{ 
                                    width: s.iconSize, 
                                    height: s.iconSize,
                                }} 
                            />
                        )}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
};

/**
 * JSI TabToggle - Simpler two-option toggle
 * Now uses inset pill style with white sliding indicator
 */
export const TabToggle = ({
    options = [],           // [{ key: string, label: string }]
    value,
    onChange,
    theme,
    size = 'md',
    className = '',
}) => {
    const sizes = {
        sm: { height: 36, text: 12, py: 6 },
        md: { height: 44, text: 13, py: 8 },
        lg: { height: 52, text: 14, py: 10 },
    };
    
    const s = sizes[size] || sizes.md;
    const accentColor = theme?.colors?.accent || JSI_COLORS.charcoal;
    const stoneColor = theme?.colors?.stone || JSI_COLORS.stone || '#E3E0D8';
    
    return (
        <div
            className={`inline-flex rounded-full p-1 shadow-inner ${className}`}
            style={{
                backgroundColor: stoneColor,
            }}
        >
            {options.map((opt) => {
                const isActive = opt.key === value;
                
                return (
                    <button
                        key={opt.key}
                        onClick={() => onChange?.(opt.key)}
                        className={`flex-1 px-5 flex items-center justify-center transition-all duration-300 rounded-full ${isActive ? 'shadow-md' : ''}`}
                        style={{
                            height: s.height - 8,
                            fontSize: s.text,
                            fontFamily: JSI_TYPOGRAPHY.fontFamily,
                            fontWeight: 600,
                            backgroundColor: isActive ? '#ffffff' : 'transparent',
                            color: isActive ? accentColor : theme?.colors?.textSecondary || '#666666',
                        }}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
};

/**
 * JSI FilterChips - Horizontal scrollable filter chips
 * Used for stage selection, category filters, etc.
 */
export const FilterChips = ({
    options = [],           // [{ key: string, label: string, count?: number }]
    value,
    onChange,
    theme,
    showArrows = true,      // Show arrow separators between chips
    className = '',
}) => {
    const scrollRef = useRef(null);
    const [showFadeLeft, setShowFadeLeft] = useState(false);
    const [showFadeRight, setShowFadeRight] = useState(false);
    
    const updateFade = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setShowFadeLeft(scrollLeft > 4);
        setShowFadeRight(scrollLeft + clientWidth < scrollWidth - 4);
    }, []);
    
    useEffect(() => {
        updateFade();
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', updateFade);
            return () => el.removeEventListener('scroll', updateFade);
        }
    }, [updateFade]);
    
    const accentColor = theme?.colors?.accent || JSI_COLORS.charcoal;
    const bgColor = theme?.colors?.background || JSI_COLORS.warmBeige;
    
    return (
        <div className={`relative ${className}`}>
            <div
                ref={scrollRef}
                className="overflow-x-auto scrollbar-hide"
            >
                <div className="flex items-center gap-3 pb-2 whitespace-nowrap pr-2">
                    {options.map((opt, index) => {
                        const isActive = opt.key === value;
                        
                        return (
                            <React.Fragment key={opt.key}>
                                <button
                                    onClick={() => onChange?.(opt.key)}
                                    className="flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-semibold transition-all duration-200"
                                    style={{
                                        fontFamily: JSI_TYPOGRAPHY.fontFamily,
                                        backgroundColor: isActive ? accentColor : 'transparent',
                                        color: isActive ? JSI_COLORS.white : theme?.colors?.textSecondary || '#666666',
                                        border: isActive ? 'none' : `1.5px solid ${JSI_COLORS.stone}`,
                                    }}
                                >
                                    {opt.label}
                                    {opt.count !== undefined && (
                                        <span 
                                            className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{
                                                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : JSI_COLORS.stone,
                                                color: isActive ? JSI_COLORS.white : JSI_COLORS.charcoal,
                                            }}
                                        >
                                            {opt.count}
                                        </span>
                                    )}
                                </button>
                                
                                {showArrows && index < options.length - 1 && (
                                    <svg 
                                        width="12" 
                                        height="12" 
                                        viewBox="0 0 12 12" 
                                        fill="none"
                                        className="opacity-30 flex-shrink-0"
                                    >
                                        <path 
                                            d="M4.5 2.5L8 6L4.5 9.5" 
                                            stroke={theme?.colors?.textSecondary || '#666666'} 
                                            strokeWidth="1.5" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            
            {/* Fade gradients */}
            {showFadeLeft && (
                <div 
                    className="pointer-events-none absolute inset-y-0 left-0 w-6"
                    style={{ background: `linear-gradient(to right, ${bgColor}, ${bgColor}00)` }}
                />
            )}
            {showFadeRight && (
                <div 
                    className="pointer-events-none absolute inset-y-0 right-0 w-6"
                    style={{ background: `linear-gradient(to left, ${bgColor}, ${bgColor}00)` }}
                />
            )}
        </div>
    );
};

export default SegmentedToggle;
