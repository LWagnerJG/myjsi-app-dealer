// JSI ScreenLayout - Consistent page structure wrapper
// Handles: responsive max-width, sticky header, scroll detection, padding
// Uses JSI blur effects and typography
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useIsDesktop } from '../hooks/useResponsive.js';
import { DESIGN_TOKENS, JSI_COLORS, JSI_TYPOGRAPHY, shadow } from './tokens.js';

export const ScreenLayout = ({
    children,
    theme,
    // Header configuration
    header,
    stickyHeader = true,
    headerBlur = true,
    // Content configuration
    maxWidth = 'lg', // 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
    padding = true,
    paddingBottom = '6rem', // Extra space for bottom navigation/FAB
    // Scroll behavior
    onScrollChange,
    className = '',
}) => {
    const isDesktop = useIsDesktop();
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollRef = useRef(null);
    
    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const scrolled = scrollRef.current.scrollTop > 10;
        setIsScrolled(scrolled);
        onScrollChange?.(scrolled, scrollRef.current.scrollTop);
    }, [onScrollChange]);
    
    // Max-width mapping
    const maxWidthMap = {
        sm: '480px',
        md: '640px',
        lg: '768px',
        xl: '896px',
        '2xl': '1024px',
        '3xl': '1152px',
        full: '100%',
    };
    
    const contentMaxWidth = maxWidthMap[maxWidth] || maxWidthMap.lg;
    const shouldConstrainWidth = isDesktop && maxWidth !== 'full';
    
    const bgColor = theme?.colors?.background || JSI_COLORS.warmBeige;
    
    const headerStyles = stickyHeader ? {
        position: 'sticky',
        top: 0,
        zIndex: DESIGN_TOKENS.zIndex.sticky,
        backgroundColor: isScrolled 
            ? `${bgColor}e8` 
            : bgColor,
        backdropFilter: isScrolled && headerBlur ? DESIGN_TOKENS.blur.light : 'none',
        WebkitBackdropFilter: isScrolled && headerBlur ? DESIGN_TOKENS.blur.light : 'none',
        borderBottom: `1px solid ${isScrolled ? JSI_COLORS.stone : 'transparent'}`,
        transition: DESIGN_TOKENS.transitions.fast,
        boxShadow: isScrolled ? shadow('sm', theme) : 'none',
    } : {};
    
    const contentWrapperStyle = shouldConstrainWidth ? {
        maxWidth: contentMaxWidth,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
    } : {};
    
    return (
        <div 
            className={`flex flex-col h-full ${className}`}
            style={{ 
                backgroundColor: bgColor,
                fontFamily: JSI_TYPOGRAPHY.fontFamily,
            }}
        >
            {/* Sticky Header Area */}
            {header && (
                <div style={headerStyles}>
                    <div style={contentWrapperStyle}>
                        {typeof header === 'function' ? header({ isScrolled, isDesktop }) : header}
                    </div>
                </div>
            )}
            
            {/* Scrollable Content Area */}
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto scrollbar-hide"
            >
                <div 
                    style={{
                        ...contentWrapperStyle,
                        paddingLeft: padding ? '1rem' : 0,
                        paddingRight: padding ? '1rem' : 0,
                        paddingTop: padding ? '1rem' : 0,
                        paddingBottom: paddingBottom,
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

// Section header component with JSI typography
export const SectionHeader = ({ 
    title, 
    action, 
    actionLabel, 
    onAction, 
    theme,
    className = '' 
}) => (
    <div className={`flex items-center justify-between mb-4 px-1 ${className}`}>
        <h3 
            className="font-semibold text-sm uppercase tracking-wider"
            style={{ 
                color: theme?.colors?.textSecondary || '#5C5C5C',
                fontFamily: JSI_TYPOGRAPHY.fontFamily,
                letterSpacing: '0.05em',
            }}
        >
            {title}
        </h3>
        {(action || onAction) && (
            <button
                onClick={onAction}
                className="text-xs font-semibold flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                style={{ 
                    color: JSI_COLORS.charcoal,
                    fontFamily: JSI_TYPOGRAPHY.fontFamily,
                }}
            >
                {actionLabel || 'View All'}
                {action}
            </button>
        )}
    </div>
);

// Empty state component with JSI styling
export const EmptyState = ({
    icon: Icon,
    title,
    subtitle,
    action,
    theme,
    className = '',
}) => (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
        {Icon && (
            <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: JSI_COLORS.stone }}
            >
                <Icon 
                    className="w-8 h-8" 
                    style={{ color: JSI_COLORS.charcoal }} 
                />
            </div>
        )}
        <p 
            className="text-lg font-bold text-center mb-1"
            style={{ 
                color: JSI_COLORS.charcoal,
                fontFamily: JSI_TYPOGRAPHY.fontFamily,
            }}
        >
            {title}
        </p>
        {subtitle && (
            <p 
                className="text-sm text-center max-w-xs"
                style={{ 
                    color: '#5C5C5C',
                    fontFamily: JSI_TYPOGRAPHY.fontFamily,
                }}
            >
                {subtitle}
            </p>
        )}
        {action && (
            <div className="mt-6">
                {action}
            </div>
        )}
    </div>
);

export default ScreenLayout;
