// JSI Input Components
// Unified form inputs with JSI visual identity
// Pill-shaped for search inputs, rounded for standard inputs
import React, { useState, forwardRef } from 'react';
import { DESIGN_TOKENS, JSI_COLORS, JSI_TYPOGRAPHY } from './tokens.js';
import { Search, X, Eye, EyeOff } from 'lucide-react';

// Base Input
export const Input = forwardRef(({
    value,
    onChange,
    placeholder,
    type = 'text',
    size = 'md',
    variant = 'default', // 'default' | 'filled' | 'outline'
    theme,
    icon: Icon,
    iconPosition = 'left',
    clearable = false,
    disabled = false,
    error,
    className = '',
    style = {},
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === 'password';
    
    // Size configurations
    const sizes = {
        sm: { height: 40, px: 14, text: 14, iconSize: 16 },
        md: { height: 48, px: 16, text: 15, iconSize: 18 },
        lg: { height: 56, px: 18, text: 16, iconSize: 20 },
    };
    
    const s = sizes[size] || sizes.md;
    
    const getVariantStyles = () => {
        const charcoal = JSI_COLORS.charcoal;
        const white = JSI_COLORS.white;
        const stone = JSI_COLORS.stone;
        const warmBeige = JSI_COLORS.warmBeige;
        const error = JSI_COLORS.error;
        
        const base = {
            borderColor: error ? error : isFocused ? charcoal : stone,
        };
        
        switch (variant) {
            case 'filled':
                return { ...base, backgroundColor: warmBeige };
            case 'outline':
                return { ...base, backgroundColor: 'transparent' };
            default:
                return { ...base, backgroundColor: white };
        }
    };
    
    const variantStyles = getVariantStyles();
    const hasLeftIcon = Icon && iconPosition === 'left';
    const hasRightIcon = (Icon && iconPosition === 'right') || clearable || isPassword;
    
    const inputStyles = {
        height: s.height,
        width: '100%',
        paddingLeft: hasLeftIcon ? s.height : s.px,
        paddingRight: hasRightIcon ? s.height : s.px,
        fontSize: s.text,
        fontFamily: JSI_TYPOGRAPHY.fontFamily,
        fontWeight: JSI_TYPOGRAPHY.weights.regular,
        borderRadius: DESIGN_TOKENS.borderRadius.xl, // 24px for inputs
        border: `1.5px solid ${variantStyles.borderColor}`,
        backgroundColor: variantStyles.backgroundColor,
        color: JSI_COLORS.charcoal,
        outline: 'none',
        transition: DESIGN_TOKENS.transitions.fast,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
        ...style,
    };
    
    const handleClear = () => {
        onChange?.({ target: { value: '' } });
    };
    
    return (
        <div className={`relative ${className}`}>
            {hasLeftIcon && (
                <div 
                    className="absolute left-0 top-0 flex items-center justify-center pointer-events-none"
                    style={{ width: s.height, height: s.height }}
                >
                    <Icon 
                        style={{ 
                            width: s.iconSize, 
                            height: s.iconSize,
                            color: isFocused ? JSI_COLORS.charcoal : '#888888',
                        }} 
                    />
                </div>
            )}
            
            <input
                ref={ref}
                type={isPassword && showPassword ? 'text' : type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={inputStyles}
                {...props}
            />
            
            {hasRightIcon && (
                <div 
                    className="absolute right-0 top-0 flex items-center justify-center"
                    style={{ width: s.height, height: s.height }}
                >
                    {isPassword ? (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1.5 rounded-full hover:bg-black/5 active:scale-95 transition-all"
                        >
                            {showPassword ? (
                                <EyeOff style={{ width: s.iconSize, height: s.iconSize, color: JSI_COLORS.charcoal }} />
                            ) : (
                                <Eye style={{ width: s.iconSize, height: s.iconSize, color: '#888888' }} />
                            )}
                        </button>
                    ) : clearable && value ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1.5 rounded-full hover:bg-black/5 active:scale-95 transition-all"
                        >
                            <X style={{ width: s.iconSize - 2, height: s.iconSize - 2, color: '#888888' }} />
                        </button>
                    ) : Icon && iconPosition === 'right' ? (
                        <Icon style={{ width: s.iconSize, height: s.iconSize, color: '#888888' }} />
                    ) : null}
                </div>
            )}
            
            {error && (
                <p className="mt-1.5 text-xs font-medium" style={{ color: JSI_COLORS.error }}>
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

// Search Input - PILL SHAPED for JSI
export const SearchInput = forwardRef(({
    value,
    onChange,
    onClear,
    placeholder = 'Search...',
    size = 'md',
    theme,
    className = '',
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const sizes = {
        sm: { height: 40, px: 16, text: 14, iconSize: 16 },
        md: { height: 48, px: 18, text: 15, iconSize: 18 },
        lg: { height: 56, px: 20, text: 16, iconSize: 20 },
    };
    
    const s = sizes[size] || sizes.md;
    
    return (
        <div className={`relative ${className}`}>
            <div 
                className="absolute left-0 top-0 flex items-center justify-center pointer-events-none"
                style={{ width: s.height, height: s.height }}
            >
                <Search 
                    style={{ 
                        width: s.iconSize, 
                        height: s.iconSize,
                        color: isFocused ? JSI_COLORS.charcoal : '#888888',
                    }} 
                />
            </div>
            <input
                ref={ref}
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="focus:outline-none"
                style={{
                    height: s.height,
                    width: '100%',
                    paddingLeft: s.height,
                    paddingRight: value ? s.height : s.px,
                    fontSize: s.text,
                    fontFamily: JSI_TYPOGRAPHY.fontFamily,
                    fontWeight: JSI_TYPOGRAPHY.weights.regular,
                    borderRadius: DESIGN_TOKENS.borderRadius.pill, // PILL for search
                    border: `1.5px solid ${isFocused ? JSI_COLORS.charcoal : JSI_COLORS.stone}`,
                    backgroundColor: JSI_COLORS.white,
                    color: JSI_COLORS.charcoal,
                    transition: DESIGN_TOKENS.transitions.fast,
                }}
                {...props}
            />
            {value && (
                <div 
                    className="absolute right-0 top-0 flex items-center justify-center"
                    style={{ width: s.height, height: s.height }}
                >
                    <button
                        type="button"
                        onClick={() => {
                            onChange?.({ target: { value: '' } });
                            onClear?.();
                        }}
                        className="p-1.5 rounded-full hover:bg-black/5 active:scale-95 transition-all"
                    >
                        <X style={{ width: s.iconSize - 2, height: s.iconSize - 2, color: '#888888' }} />
                    </button>
                </div>
            )}
        </div>
    );
});

SearchInput.displayName = 'SearchInput';

// Textarea
export const Textarea = forwardRef(({
    value,
    onChange,
    placeholder,
    rows = 4,
    theme,
    disabled = false,
    error,
    resize = 'vertical', // 'none' | 'vertical' | 'horizontal' | 'both'
    className = '',
    style = {},
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const textareaStyles = {
        width: '100%',
        padding: 16,
        fontSize: 15,
        fontFamily: JSI_TYPOGRAPHY.fontFamily,
        fontWeight: JSI_TYPOGRAPHY.weights.regular,
        lineHeight: 1.6,
        borderRadius: DESIGN_TOKENS.borderRadius.xl,
        border: `1.5px solid ${error ? JSI_COLORS.error : isFocused ? JSI_COLORS.charcoal : JSI_COLORS.stone}`,
        backgroundColor: JSI_COLORS.white,
        color: JSI_COLORS.charcoal,
        outline: 'none',
        transition: DESIGN_TOKENS.transitions.fast,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
        resize,
        ...style,
    };
    
    return (
        <div className={className}>
            <textarea
                ref={ref}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={textareaStyles}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-xs font-medium" style={{ color: JSI_COLORS.error }}>
                    {error}
                </p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

// Select Input
export const Select = forwardRef(({
    value,
    onChange,
    options = [], // [{ value, label }]
    placeholder = 'Select...',
    size = 'md',
    theme,
    disabled = false,
    error,
    className = '',
    style = {},
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const sizes = {
        sm: { height: 40, px: 14, text: 14 },
        md: { height: 48, px: 16, text: 15 },
        lg: { height: 56, px: 18, text: 16 },
    };
    
    const s = sizes[size] || sizes.md;
    
    const selectStyles = {
        height: s.height,
        width: '100%',
        paddingLeft: s.px,
        paddingRight: 40,
        fontSize: s.text,
        fontFamily: JSI_TYPOGRAPHY.fontFamily,
        fontWeight: JSI_TYPOGRAPHY.weights.regular,
        borderRadius: DESIGN_TOKENS.borderRadius.xl,
        border: `1.5px solid ${error ? JSI_COLORS.error : isFocused ? JSI_COLORS.charcoal : JSI_COLORS.stone}`,
        backgroundColor: JSI_COLORS.white,
        color: JSI_COLORS.charcoal,
        outline: 'none',
        transition: DESIGN_TOKENS.transitions.fast,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        appearance: 'none',
        ...style,
    };
    
    return (
        <div className={`relative ${className}`}>
            <select
                ref={ref}
                value={value}
                onChange={onChange}
                disabled={disabled}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={selectStyles}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            
            {/* Dropdown arrow */}
            <div 
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path 
                        d="M2.5 4.5L6 8L9.5 4.5" 
                        stroke={JSI_COLORS.charcoal} 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            
            {error && (
                <p className="mt-1.5 text-xs font-medium" style={{ color: JSI_COLORS.error }}>
                    {error}
                </p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Input;
