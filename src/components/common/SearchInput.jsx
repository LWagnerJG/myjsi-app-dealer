import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Search, Mic, Plus } from 'lucide-react';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';

// Constants moved outside component to prevent recreation
const PHRASES = [
    'Ask me anything...',
    'Find install guides...',
    'Compare product specs...',
    'Start sample order...',
    'Check lead times...',
    'Create social posts...',
    'Show commission rates...',
    'Price out package...',
    'Search dealer directory...',
    'Summarize a contract...',
    'Suggest finish pairings...',
    'Write customer email...',
    'Draft install checklist...',
    'Analyze win chances...',
    'Plan design days...',
];

const DISPLAY_MS = 8200;
const FADE_MS = 1500;
const FADE_IN_DELAY = 360;
const INPUT_HEIGHT = 56;

// Memoized style objects to prevent recreation on every render
const createInputStyles = (theme) => ({
    color: theme.colors.textPrimary,
    height: INPUT_HEIGHT,
    lineHeight: `${INPUT_HEIGHT}px`,
    fontWeight: 400,
    WebkitFontSmoothing: 'antialiased',
});

const createIconWrapperStyles = () => ({
    width: 24,
    height: 24,
});

const createPlaceholderStyles = (theme, animation, delay = 0, shouldPulse = false) => ({
    zIndex: animation.includes('FadeIn') ? 1 : 0,
    color: theme.colors.textSecondary,
    opacity: 0.52,
    animation: shouldPulse 
        ? `${animation} ${FADE_MS}ms ${delay}ms ease both, siPulseSlow 2600ms ease-in-out infinite`
        : `${animation} ${FADE_MS}ms ${delay}ms ease both`,
    transformOrigin: 'center',
    fontWeight: 400,
});

// HomeSearchInput - Optimized with useCallback and memoized styles
export const HomeSearchInput = React.memo(function HomeSearchInput({
    theme,
    value = '',
    onChange,
    onSubmit,
    onVoiceClick,
    onFileAdd,
    attachedFiles = [],
    className = '',
    onFocus,
    onBlur,
}) {
    const [focused, setFocused] = useState(false);
    const [tick, setTick] = useState(0);
    const [prevText, setPrevText] = useState(null);
    const fileInputRef = useRef(null);
    
    const phraseFor = useCallback((i) => PHRASES[i % PHRASES.length], []);
    
    useEffect(() => {
        const id = setInterval(() => setTick(p => p + 1), DISPLAY_MS);
        return () => clearInterval(id);
    }, []);
    
    useEffect(() => {
        if (tick === 0) return;
        setPrevText(phraseFor(tick - 1));
        const t = setTimeout(() => setPrevText(null), FADE_MS + 120);
        return () => clearTimeout(t);
    }, [tick, phraseFor]);
    
    const currentText = useMemo(() => phraseFor(tick), [tick, phraseFor]);
    const isAskCycle = currentText === 'Ask me anything...';
    const shouldPulse = isAskCycle && tick !== 0;
    const showHint = !value && !focused;
    
    const handleFocus = useCallback((e) => {
        setFocused(true);
        onFocus?.(e);
    }, [onFocus]);
    
    const handleBlur = useCallback((e) => {
        setFocused(false);
        onBlur?.(e);
    }, [onBlur]);
    
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        onSubmit?.(value);
    }, [onSubmit, value]);
    
    const handleChange = useCallback((e) => {
        onChange?.(e.target.value);
    }, [onChange]);
    
    const handleFileClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);
    
    const handleFileChange = useCallback((e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0 && onFileAdd) {
            onFileAdd(files);
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    }, [onFileAdd]);
    
    // Memoize style objects
    const inputStyles = useMemo(() => createInputStyles(theme), [theme.colors.textPrimary]);
    const iconWrapperStyles = useMemo(() => createIconWrapperStyles(), []);
    const iconColor = useMemo(() => theme.colors.textSecondary, [theme.colors.textSecondary]);
    
    return (
        <form
            onSubmit={handleSubmit}
            className={`flex items-center flex-1 ${className}`}
            autoComplete="off"
        >
            <style>{`
                @keyframes siFadeIn { from { opacity: 0 } to { opacity: .52 } }
                @keyframes siFadeOut { from { opacity: .52 } to { opacity: 0 } }
                @keyframes siPulseSlow { 0% { transform: scale(1) } 50% { transform: scale(1.01) } 100% { transform: scale(1) } }
            `}</style>

            <div className="flex items-center justify-center mr-3" style={iconWrapperStyles}>
                <Search className="w-5 h-5" style={{ color: iconColor }} />
            </div>

            <div className="flex-1 relative">
                <input
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder=""
                    className="w-full bg-transparent outline-none text-[15px]"
                    style={inputStyles}
                    aria-label="Search"
                />

                {showHint && (
                    <div
                        className="pointer-events-none absolute inset-0 flex items-center"
                        aria-hidden="true"
                    >
                        {prevText && (
                            <span
                                className="absolute w-full truncate"
                                style={createPlaceholderStyles(theme, 'siFadeOut')}
                            >
                                {prevText}
                            </span>
                        )}
                        <span
                            key={tick}
                            className="absolute w-full truncate"
                            style={createPlaceholderStyles(theme, 'siFadeIn', FADE_IN_DELAY, shouldPulse)}
                        >
                            {currentText}
                        </span>
                    </div>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* File attachment button */}
            <button
                type="button"
                onClick={handleFileClick}
                className="ml-2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
                style={{ 
                    color: attachedFiles.length > 0 ? theme.colors.accent : iconColor,
                    backgroundColor: attachedFiles.length > 0 ? `${theme.colors.accent}15` : 'transparent'
                }}
                aria-label="Attach files"
            >
                <Plus className="w-5 h-5" />
                {attachedFiles.length > 0 && (
                    <span 
                        className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                        style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                    >
                        {attachedFiles.length}
                    </span>
                )}
            </button>

            <button
                type="button"
                onClick={onVoiceClick}
                className="ml-1 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: iconColor }}
                aria-label="Voice input"
            >
                <Mic className="w-5 h-5" />
            </button>
        </form>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for better memoization
    return (
        prevProps.value === nextProps.value &&
        prevProps.theme === nextProps.theme &&
        prevProps.className === nextProps.className &&
        prevProps.attachedFiles?.length === nextProps.attachedFiles?.length
    );
});

// Standard search input with header variant - Optimized with design tokens
export const SearchInput = React.memo(function SearchInput({
    id,
    value = '',
    onChange,
    placeholder,
    theme,
    className = '',
    style = {},
    variant = 'default', // 'default' | 'header'
    inputClassName = ''
}) {
    const isHeader = variant === 'header';

    // Use design tokens for consistent styling - memoized to prevent recreation
    const pill = useMemo(() => isHeader ? {
        height: 56,
        backgroundColor: theme?.colors?.surface,
        border: 'none',
        boxShadow: DESIGN_TOKENS.shadows.lg,
        borderRadius: DESIGN_TOKENS.borderRadius.pill,
        paddingLeft: 20,
        paddingRight: 20,
        transition: DESIGN_TOKENS.transitions.fast
    } : {
        height: 44,
        backgroundColor: theme?.colors?.surface,
        border: 'none',
        boxShadow: DESIGN_TOKENS.shadows.md,
        borderRadius: DESIGN_TOKENS.borderRadius.pill,
        paddingLeft: 16,
        paddingRight: 16,
        transition: DESIGN_TOKENS.transitions.fast
    }, [isHeader, theme?.colors?.surface]);

    const iconColor = useMemo(() => theme?.colors?.textSecondary || '#666', [theme?.colors?.textSecondary]);
    const textColor = useMemo(() => theme?.colors?.textPrimary || '#111', [theme?.colors?.textPrimary]);
    
    const handleChange = useCallback((e) => {
        onChange?.(e.target.value);
    }, [onChange]);

    return (
        <div id={id} className={`flex items-center flex-1 gap-2 ${className}`}
             style={{ ...pill, ...style }}>
            <Search className="w-5 h-5" style={{ color: iconColor }} />
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className={`flex-1 h-full bg-transparent outline-none text-[15px] placeholder:opacity-70 ${inputClassName}`}
                style={{ 
                    color: textColor,
                    border: 'none',
                    boxShadow: 'none',
                }}
                onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.border = 'none';
                    e.target.style.boxShadow = 'none';
                }}
                aria-label={placeholder}
            />
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.value === nextProps.value &&
        prevProps.theme === nextProps.theme &&
        prevProps.placeholder === nextProps.placeholder &&
        prevProps.variant === nextProps.variant &&
        prevProps.className === nextProps.className
    );
});
