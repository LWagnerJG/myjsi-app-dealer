// JSI Button Component
// Strictly pill-shaped (border-radius: 9999px) for all interactive elements
// Primary: Solid Charcoal (#353535) with White text
// Secondary: Outline style
// Arrow iconography emphasis with circular containers
import React from 'react';
import { DESIGN_TOKENS, JSI_COLORS, JSI_TYPOGRAPHY, shadow, isDarkTheme } from './tokens.js';
import { ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * JSI Button variants:
 * - primary: Solid Charcoal with White text (MAIN CTA)
 * - secondary: White/surface with Charcoal outline
 * - ghost: Transparent with hover state
 * - danger: Muted red for destructive actions
 * - icon: Circular icon-only button
 * - arrow: Button with arrow in circular container (JSI signature)
 */

// Arrow icon in circular container (JSI signature element)
const ArrowCircle = ({ direction = 'right', size = 16, color = '#FFFFFF', bgColor = 'transparent' }) => {
    const ArrowIcon = {
        right: ArrowRight,
        left: ArrowLeft,
        up: ArrowUp,
        down: ArrowDown,
    }[direction] || ArrowRight;
    
    return (
        <span 
            className="inline-flex items-center justify-center rounded-full flex-shrink-0"
            style={{ 
                width: size + 8, 
                height: size + 8, 
                backgroundColor: bgColor,
                border: bgColor === 'transparent' ? `1.5px solid ${color}` : 'none',
            }}
        >
            <ArrowIcon style={{ width: size * 0.7, height: size * 0.7, color }} />
        </span>
    );
};

export const Button = React.memo(React.forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    theme,
    onClick,
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    arrow = false,           // JSI: Add arrow in circular container
    arrowDirection = 'right',
    fullWidth = false,
    className = '',
    style = {},
    type = 'button',
    ...props
}, ref) => {
    const isDark = isDarkTheme(theme);
    
    // Size configurations - adjusted for JSI proportions
    const sizes = {
        sm: { height: 36, px: 16, text: 13, iconSize: 14, gap: 8, arrowSize: 14 },
        md: { height: 44, px: 20, text: 14, iconSize: 16, gap: 10, arrowSize: 16 },
        lg: { height: 52, px: 24, text: 15, iconSize: 18, gap: 12, arrowSize: 18 },
        xl: { height: 60, px: 28, text: 16, iconSize: 20, gap: 14, arrowSize: 20 },
    };
    
    const s = sizes[size] || sizes.md;
    
    // JSI Variant styles
    const getVariantStyles = () => {
        const charcoal = JSI_COLORS.charcoal;
        const white = JSI_COLORS.white;
        const stone = JSI_COLORS.stone;
        const error = JSI_COLORS.error;
        const surface = theme?.colors?.surface || white;
        
        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: disabled ? `${charcoal}60` : charcoal,
                    color: white,
                    border: 'none',
                    boxShadow: disabled ? 'none' : shadow('button', theme),
                    arrowColor: white,
                    arrowBg: 'transparent',
                };
            case 'secondary':
                return {
                    backgroundColor: surface,
                    color: charcoal,
                    border: `1.5px solid ${charcoal}`,
                    boxShadow: 'none',
                    arrowColor: charcoal,
                    arrowBg: 'transparent',
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                    color: charcoal,
                    border: 'none',
                    boxShadow: 'none',
                    arrowColor: charcoal,
                    arrowBg: stone,
                };
            case 'danger':
                return {
                    backgroundColor: disabled ? `${error}60` : error,
                    color: white,
                    border: 'none',
                    boxShadow: disabled ? 'none' : shadow('button', theme),
                    arrowColor: white,
                    arrowBg: 'transparent',
                };
            case 'subtle':
                return {
                    backgroundColor: stone,
                    color: charcoal,
                    border: 'none',
                    boxShadow: 'none',
                    arrowColor: charcoal,
                    arrowBg: white,
                };
            case 'icon':
                return {
                    backgroundColor: surface,
                    color: charcoal,
                    border: `1.5px solid ${stone}`,
                    boxShadow: shadow('sm', theme),
                    width: s.height,
                    padding: 0,
                };
            case 'icon-filled':
                return {
                    backgroundColor: charcoal,
                    color: white,
                    border: 'none',
                    boxShadow: shadow('button', theme),
                    width: s.height,
                    padding: 0,
                };
            default:
                return {
                    backgroundColor: charcoal,
                    color: white,
                    border: 'none',
                    boxShadow: shadow('button', theme),
                    arrowColor: white,
                    arrowBg: 'transparent',
                };
        }
    };
    
    const variantStyles = getVariantStyles();
    
    const baseStyles = {
        height: s.height,
        paddingLeft: variant === 'icon' || variant === 'icon-filled' ? 0 : s.px,
        paddingRight: variant === 'icon' || variant === 'icon-filled' ? 0 : (arrow ? s.px - 4 : s.px),
        fontSize: s.text,
        fontFamily: JSI_TYPOGRAPHY.fontFamily,
        fontWeight: JSI_TYPOGRAPHY.weights.semibold,
        letterSpacing: '-0.01em',
        borderRadius: DESIGN_TOKENS.borderRadius.pill, // STRICT pill shape
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: DESIGN_TOKENS.transitions.elegant,
        outline: 'none',
        width: fullWidth ? '100%' : (variant === 'icon' || variant === 'icon-filled') ? s.height : 'auto',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        ...variantStyles,
        ...style,
    };
    
    // Loading spinner
    const Spinner = () => (
        <svg 
            className="animate-spin" 
            width={s.iconSize} 
            height={s.iconSize} 
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginRight: children ? s.gap : 0 }}
        >
            <circle 
                cx="12" cy="12" r="10" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                opacity="0.25"
            />
            <path 
                d="M12 2a10 10 0 0 1 10 10" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
            />
        </svg>
    );
    
    return (
        <button
            ref={ref}
            type={type}
            onClick={disabled || loading ? undefined : onClick}
            disabled={disabled || loading}
            className={`
                hover:opacity-90 
                hover:shadow-lg
                active:scale-[0.97] 
                focus:outline-none
                focus:ring-2 
                focus:ring-offset-2 
                focus:ring-[#353535]/20
                disabled:hover:opacity-50
                disabled:hover:shadow-none
                disabled:active:scale-100
                ${className}
            `.trim()}
            style={baseStyles}
            {...props}
        >
            {loading ? (
                <Spinner />
            ) : Icon && iconPosition === 'left' ? (
                <Icon style={{ width: s.iconSize, height: s.iconSize }} />
            ) : null}
            {children}
            {!loading && Icon && iconPosition === 'right' && !arrow ? (
                <Icon style={{ width: s.iconSize, height: s.iconSize }} />
            ) : null}
            {!loading && arrow && (
                <ArrowCircle 
                    direction={arrowDirection} 
                    size={s.arrowSize} 
                    color={variantStyles.arrowColor}
                    bgColor={variantStyles.arrowBg}
                />
            )}
        </button>
    );
}));

Button.displayName = 'Button';

// Icon Button shorthand - circular for JSI
export const IconButton = React.memo(React.forwardRef(({
    icon: Icon,
    size = 'md',
    theme,
    filled = false,
    ...props
}, ref) => (
    <Button
        ref={ref}
        variant={filled ? 'icon-filled' : 'icon'}
        size={size}
        theme={theme}
        {...props}
    >
        {Icon && <Icon />}
    </Button>
)));

IconButton.displayName = 'IconButton';

// Arrow Button - JSI signature element
export const ArrowButton = React.memo(React.forwardRef(({
    children,
    direction = 'right',
    ...props
}, ref) => (
    <Button
        ref={ref}
        arrow
        arrowDirection={direction}
        {...props}
    >
        {children}
    </Button>
)));

ArrowButton.displayName = 'ArrowButton';

export default Button;
