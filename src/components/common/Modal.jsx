import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { GlassCard } from './GlassCard.jsx';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';
import { useModalState } from '../../hooks/useModalState.js';

export const Modal = ({ show, onClose, title, children, theme }) => {
    const { openModal, closeModal } = useModalState();

    useEffect(() => {
        if (show) {
            openModal();
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                closeModal();
                document.body.style.overflow = prev;
            };
        } else {
            closeModal();
        }
    }, [show, openModal, closeModal]);

    if (!show) return null;

    // Calculate safe area padding for mobile bottom nav - ensure modal is above nav
    const mobileNavHeight = 80; // Height of bottom nav
    const safeAreaBottom = typeof window !== 'undefined' ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0', 10) : 0;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    // On mobile, position modal above bottom nav with extra padding
    const bottomPadding = isMobile 
        ? mobileNavHeight + safeAreaBottom + 24 // Nav height + safe area + extra padding for visibility
        : 0;

    return ReactDOM.createPortal(
        <>
            {/* Backdrop - positioned below header */}
            <div
                className="fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300 pointer-events-auto"
                style={{ 
                    top: 76, // Below header
                    zIndex: DESIGN_TOKENS.zIndex.overlay,
                    opacity: show ? 1 : 0 
                }}
                onClick={onClose}
            />
            {/* Modal Container - positioned above bottom nav on mobile */}
            <div
                className="fixed inset-x-0 flex items-end sm:items-center justify-center transition-transform duration-300 pointer-events-none"
                style={{ 
                    top: 76, // Below header
                    bottom: isMobile ? `${bottomPadding}px` : 0,
                    padding: isMobile ? '1rem' : '1.5rem',
                    zIndex: DESIGN_TOKENS.zIndex.modal,
                }}
                onClick={onClose}
            >
                <div
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl pointer-events-auto overflow-hidden"
                    style={{
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                        maxHeight: isMobile 
                            ? `calc(100vh - ${76 + bottomPadding}px)` 
                            : '85vh',
                    }}
                >
                    {title && (
                        <div
                            className="flex justify-between items-center p-4 border-b flex-shrink-0"
                            style={{ borderColor: theme.colors.border }}
                        >
                            <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                                style={{ backgroundColor: theme.colors.subtle }}
                            >
                                <X className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                            </button>
                        </div>
                    )}
                    <div
                        className={`${title ? "p-6" : "pt-8 px-6 pb-6"} overflow-y-auto space-y-4 scrollbar-hide`}
                        style={{
                            paddingBottom: typeof window !== 'undefined' && window.innerWidth < 1024 
                                ? `calc(1.5rem + env(safe-area-inset-bottom, 0px))` 
                                : '1.5rem'
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};