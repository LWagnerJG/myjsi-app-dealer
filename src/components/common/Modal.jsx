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
    // JSI "Floating Island" Style: consistently rounded, floats above nav
    const bottomOffset = isMobile
        ? mobileNavHeight + safeAreaBottom + 16 // Nav height + safe area + moderate gap
        : 0;

    return ReactDOM.createPortal(
        <>
            {/* Backdrop - NOW COVERS HEADER (top: 0) with higher Z-index - JSI Blur 24 */}
            <div
                className="fixed inset-0 bg-black/40 transition-opacity duration-300 pointer-events-auto"
                style={{
                    top: 0, // Cover entire screen including header
                    zIndex: DESIGN_TOKENS.zIndex.overlay + 10, // Ensure it's above header (30) and standard overlay (50)
                    opacity: show ? 1 : 0,
                    backdropFilter: DESIGN_TOKENS.blur.light, // Background Blur 24 from style guide
                    WebkitBackdropFilter: DESIGN_TOKENS.blur.light
                }}
                onClick={onClose}
            />
            {/* Modal Container */}
            <div
                className="fixed inset-x-0 flex items-end sm:items-center justify-center transition-transform duration-300 pointer-events-none"
                style={{
                    top: 0, // Cover entire screen
                    bottom: 0,
                    padding: isMobile ? '1rem' : '1.5rem',
                    paddingBottom: isMobile ? `${bottomOffset}px` : '1.5rem',
                    zIndex: DESIGN_TOKENS.zIndex.modal + 10, // Above backdrop
                }}
                onClick={onClose}
            >
                <div
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md rounded-3xl flex flex-col shadow-2xl pointer-events-auto overflow-hidden transition-all duration-300 transform scale-100"
                    style={{
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                        maxHeight: isMobile
                            ? `calc(100vh - ${bottomOffset + 32}px)` // Accounting for top/bottom padding
                            : '85vh',
                        boxShadow: DESIGN_TOKENS.shadows.modal
                    }}
                >
                    {title && (
                        <div
                            className="flex justify-between items-center p-4 border-b flex-shrink-0"
                            style={{ borderColor: theme.colors.border }}
                        >
                            <h2 className="text-xl font-bold px-1" style={{ color: theme.colors.textPrimary }}>
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full transition-colors hover:bg-black/5 active:bg-black/10"
                                style={{ backgroundColor: theme.colors.subtle }}
                            >
                                <X className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                            </button>
                        </div>
                    )}
                    <div
                        className={`${title ? "p-6" : "pt-8 px-6 pb-6"} overflow-y-auto space-y-4 scrollbar-hide`}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};