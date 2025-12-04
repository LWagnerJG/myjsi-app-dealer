// JSI Skeleton Loading Components
// Beautiful loading placeholders with earth-toned shimmer
import React from 'react';
import { DESIGN_TOKENS, JSI_COLORS } from './tokens.js';

// Base skeleton with JSI-branded shimmer animation
export const Skeleton = ({ 
    width = '100%', 
    height = 16, 
    radius = 'md',
    theme,
    className = '',
    style = {},
}) => {
    const borderRadius = DESIGN_TOKENS.borderRadius[radius] || radius;
    const bgColor = theme?.colors?.subtle || JSI_COLORS.lightGrey;
    
    return (
        <div
            className={`skeleton-shimmer ${className}`}
            style={{
                width,
                height,
                borderRadius,
                backgroundColor: bgColor,
                ...style,
            }}
        />
    );
};

// Text skeleton - mimics text lines
export const SkeletonText = ({ 
    lines = 1, 
    lastLineWidth = '60%',
    theme,
    className = '',
}) => (
    <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                width={i === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
                height={14}
                radius="sm"
                theme={theme}
            />
        ))}
    </div>
);

// Avatar skeleton
export const SkeletonAvatar = ({ 
    size = 40, 
    theme,
    className = '',
}) => (
    <Skeleton
        width={size}
        height={size}
        radius="full"
        theme={theme}
        className={className}
    />
);

// Card skeleton - for list items
export const SkeletonCard = ({ theme, className = '' }) => (
    <div 
        className={`p-4 rounded-2xl ${className}`}
        style={{ 
            backgroundColor: theme?.colors?.surface || '#FFFFFF',
            boxShadow: DESIGN_TOKENS.shadows.card,
        }}
    >
        <div className="flex items-start gap-3">
            <SkeletonAvatar size={40} theme={theme} />
            <div className="flex-1">
                <Skeleton width="60%" height={16} theme={theme} className="mb-2" />
                <Skeleton width="40%" height={12} theme={theme} />
            </div>
            <Skeleton width={60} height={24} radius="full" theme={theme} />
        </div>
    </div>
);

// Grid item skeleton - for sample cards, products
export const SkeletonGridItem = ({ theme, className = '' }) => (
    <div 
        className={`rounded-2xl overflow-hidden ${className}`}
        style={{ 
            backgroundColor: theme?.colors?.surface || '#FFFFFF',
            boxShadow: DESIGN_TOKENS.shadows.card,
        }}
    >
        <Skeleton width="100%" height={120} radius="none" theme={theme} />
        <div className="p-3">
            <Skeleton width="70%" height={14} theme={theme} className="mb-2" />
            <Skeleton width="40%" height={12} theme={theme} />
        </div>
    </div>
);

// Stats card skeleton
export const SkeletonStat = ({ theme, className = '' }) => (
    <div 
        className={`p-4 rounded-2xl ${className}`}
        style={{ 
            backgroundColor: theme?.colors?.surface || '#FFFFFF',
            boxShadow: DESIGN_TOKENS.shadows.card,
        }}
    >
        <Skeleton width="50%" height={12} theme={theme} className="mb-2" />
        <Skeleton width="70%" height={28} theme={theme} />
    </div>
);

// List skeleton - multiple cards
export const SkeletonList = ({ 
    count = 3, 
    theme, 
    gap = 12,
    className = '' 
}) => (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap }}>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} theme={theme} />
        ))}
    </div>
);

// Grid skeleton
export const SkeletonGrid = ({ 
    count = 6, 
    columns = 3,
    theme, 
    gap = 12,
    className = '' 
}) => (
    <div 
        className={className}
        style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap,
        }}
    >
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonGridItem key={i} theme={theme} />
        ))}
    </div>
);

// Quick Access grid skeleton (home screen)
export const SkeletonQuickAccess = ({ theme, className = '' }) => (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
            <div 
                key={i}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl"
                style={{ 
                    backgroundColor: theme?.colors?.surface || '#FFFFFF',
                    boxShadow: DESIGN_TOKENS.shadows.card,
                }}
            >
                <Skeleton width={44} height={44} radius="lg" theme={theme} />
                <Skeleton width={48} height={12} theme={theme} />
            </div>
        ))}
    </div>
);

// Inject JSI-branded shimmer animation styles
if (typeof document !== 'undefined' && !document.getElementById('skeleton-styles')) {
    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.innerHTML = `
        @keyframes skeleton-shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        .skeleton-shimmer {
            background: linear-gradient(
                90deg,
                #E3E0D8 25%,
                #F0EDE8 50%,
                #E3E0D8 75%
            );
            background-size: 200% 100%;
            animation: skeleton-shimmer 1.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
            .skeleton-shimmer {
                animation: none;
            }
        }
    `;
    document.head.appendChild(style);
}

export default Skeleton;
