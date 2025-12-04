// JSI Badge/Pill Component
// Strictly pill-shaped (9999px) with uppercase text
// Used for labels like "NEW!", "Quickship Products", status indicators
import React from 'react';
import { DESIGN_TOKENS, JSI_COLORS, JSI_TYPOGRAPHY, STATUS_STYLES, isDarkTheme } from './tokens.js';
import { Clock, ShoppingCart, Sparkles, Tag } from 'lucide-react';

/**
 * JSI Badge variants:
 * - filled: Solid Charcoal background
 * - soft: Light earth-toned background with colored text
 * - outline: Charcoal border only
 * - status: Pre-defined status colors (success, warning, error, info)
 * - new: "NEW!" badge style
 * - quickship: Quickship product indicator
 */

export const Badge = React.memo(({
    children,
    variant = 'soft',
    status, // 'success' | 'warning' | 'error' | 'info' | 'pending' | 'new' | 'quickship'
    size = 'sm',
    theme,
    icon: Icon,
    uppercase = true,       // JSI: Badges typically use uppercase
    removable = false,
    onRemove,
    className = '',
    style = {},
}) => {
    const isDark = isDarkTheme(theme);
    
    // Size configurations
    const sizes = {
        xs: { height: 20, px: 8, text: 9, iconSize: 10, gap: 4 },
        sm: { height: 24, px: 10, text: 10, iconSize: 12, gap: 5 },
        md: { height: 28, px: 12, text: 11, iconSize: 14, gap: 6 },
        lg: { height: 34, px: 14, text: 12, iconSize: 16, gap: 7 },
    };
    
    const s = sizes[size] || sizes.sm;
    
    // Get colors based on variant and status
    const getColors = () => {
        const charcoal = JSI_COLORS.charcoal;
        const white = JSI_COLORS.white;
        const stone = JSI_COLORS.stone;
        const warmBeige = JSI_COLORS.warmBeige;
        const sageGrey = JSI_COLORS.sageGrey;
        
        // If status is provided, use status colors
        if (status && STATUS_STYLES[status]) {
            const statusStyle = STATUS_STYLES[status];
            
            // Special handling for "new" and "quickship" badges
            if (status === 'new') {
                return {
                    backgroundColor: charcoal,
                    color: white,
                    borderColor: 'transparent',
                    iconColor: white,
                };
            }
            if (status === 'quickship') {
                return {
                    backgroundColor: JSI_COLORS.success,
                    color: white,
                    borderColor: 'transparent',
                    iconColor: white,
                };
            }
            
            return {
                backgroundColor: isDark ? statusStyle.darkBg : statusStyle.bg,
                color: isDark ? statusStyle.darkColor : statusStyle.color,
                borderColor: 'transparent',
                iconColor: isDark ? statusStyle.darkColor : statusStyle.color,
            };
        }
        
        // Variant-based colors
        switch (variant) {
            case 'filled':
                return {
                    backgroundColor: charcoal,
                    color: white,
                    borderColor: charcoal,
                    iconColor: white,
                };
            case 'soft':
                return {
                    backgroundColor: stone,
                    color: charcoal,
                    borderColor: 'transparent',
                    iconColor: charcoal,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    color: charcoal,
                    borderColor: charcoal,
                    iconColor: charcoal,
                };
            case 'subtle':
                return {
                    backgroundColor: warmBeige,
                    color: charcoal,
                    borderColor: 'transparent',
                    iconColor: charcoal,
                };
            case 'muted':
                return {
                    backgroundColor: sageGrey,
                    color: charcoal,
                    borderColor: 'transparent',
                    iconColor: charcoal,
                };
            default:
                return {
                    backgroundColor: stone,
                    color: charcoal,
                    borderColor: 'transparent',
                    iconColor: charcoal,
                };
        }
    };
    
    const colors = getColors();
    
    // Auto-select icon for special statuses
    const getAutoIcon = () => {
        if (Icon) return Icon;
        if (status === 'new') return Sparkles;
        if (status === 'quickship') return Clock;
        return null;
    };
    
    const ResolvedIcon = getAutoIcon();
    
    const badgeStyles = {
        height: s.height,
        paddingLeft: s.px,
        paddingRight: removable ? s.px - 2 : s.px,
        fontSize: s.text,
        fontFamily: JSI_TYPOGRAPHY.fontFamily,
        fontWeight: JSI_TYPOGRAPHY.weights.semibold,
        letterSpacing: uppercase ? '0.04em' : '0.01em',
        textTransform: uppercase ? 'uppercase' : 'none',
        borderRadius: DESIGN_TOKENS.borderRadius.pill, // STRICT pill shape
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        border: colors.borderColor !== 'transparent' ? `1.5px solid ${colors.borderColor}` : 'none',
        backgroundColor: colors.backgroundColor,
        color: colors.color,
        whiteSpace: 'nowrap',
        ...style,
    };
    
    return (
        <span className={className} style={badgeStyles}>
            {ResolvedIcon && (
                <ResolvedIcon style={{ width: s.iconSize, height: s.iconSize, color: colors.iconColor }} />
            )}
            {children}
            {removable && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove?.();
                    }}
                    className="ml-0.5 rounded-full hover:bg-black/10 active:scale-90 transition-all"
                    style={{ 
                        padding: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg 
                        width={s.iconSize - 2} 
                        height={s.iconSize - 2} 
                        viewBox="0 0 12 12" 
                        fill="none"
                    >
                        <path 
                            d="M3 3l6 6M9 3l-6 6" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            )}
        </span>
    );
});

Badge.displayName = 'Badge';

// Status Badge - shorthand for common statuses
export const StatusBadge = ({ status, children, ...props }) => (
    <Badge status={status} {...props}>
        {children || status?.charAt(0).toUpperCase() + status?.slice(1)}
    </Badge>
);

// NEW! Badge - JSI signature element
export const NewBadge = ({ size = 'sm', ...props }) => (
    <Badge status="new" size={size} {...props}>
        NEW!
    </Badge>
);

// Quickship Badge
export const QuickshipBadge = ({ size = 'sm', ...props }) => (
    <Badge status="quickship" size={size} {...props}>
        Quickship
    </Badge>
);

// Count Badge - for notifications, cart counts
export const CountBadge = ({ count, theme, className = '' }) => {
    if (!count || count <= 0) return null;
    
    return (
        <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold ${className}`}
            style={{
                backgroundColor: JSI_COLORS.charcoal,
                color: JSI_COLORS.white,
                padding: '0 5px',
                fontFamily: JSI_TYPOGRAPHY.fontFamily,
            }}
        >
            {count > 99 ? '99+' : count}
        </span>
    );
};

// Category/Tag Badge - for product categorization
export const TagBadge = ({ children, icon: Icon = Tag, ...props }) => (
    <Badge variant="outline" icon={Icon} {...props}>
        {children}
    </Badge>
);

export default Badge;
