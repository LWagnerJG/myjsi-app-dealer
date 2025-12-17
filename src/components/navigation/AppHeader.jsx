/* eslint-disable react/prop-types */
import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { logoLight } from '../../data.jsx'; // checking import path
import { DESIGN_TOKENS } from '../../design-system/tokens.js';
import { useModalState } from '../../hooks/useModalState.js';
import { motion, AnimatePresence } from 'framer-motion';

export const AppHeader = React.memo(({
    onHomeClick,
    isDarkMode,
    theme,
    onProfileClick,
    handleBack,
    showBack,
    userName
}) => {
    const { isModalOpen } = useModalState();
    const filterStyle = isDarkMode ? 'brightness(0) invert(1)' : 'none';
    const isHome = !showBack;

    // Shadow logic - COMPLETELY REMOVED to solve "horizontal line" issue
    const pillShadow = 'none';

    return (
        <div
            className="pt-4 pb-1 fixed top-0 left-0 right-0 pointer-events-none"
            style={{ zIndex: DESIGN_TOKENS.zIndex.header }}
        >
            <div className="mx-auto w-full px-4 lg:px-6" style={{ maxWidth: DESIGN_TOKENS.maxWidth.content }}>
                <motion.div
                    className="w-full flex items-center justify-between px-5 pointer-events-auto bg-white dark:bg-[#353535]"
                    initial={false}
                    animate={{
                        backgroundColor: theme.colors.surface,
                        boxShadow: pillShadow
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                        borderRadius: 9999,
                        height: 56,
                        border: 'none', // Explicitly remove border
                    }}
                >
                    <div className="flex items-center gap-1 overflow-hidden">
                        <AnimatePresence initial={false} mode="popLayout">
                            {showBack && (
                                <motion.button
                                    key="back-btn"
                                    layout
                                    initial={{ opacity: 0, x: -20, width: 0 }}
                                    animate={{ opacity: 1, x: 0, width: 'auto' }}
                                    exit={{ opacity: 0, x: -20, width: 0 }}
                                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                    aria-label="Go back"
                                    onClick={handleBack}
                                    className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors -ml-2 mr-1"
                                >
                                    <ArrowLeft className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <motion.button
                            layout
                            aria-label="Go to homepage"
                            onClick={onHomeClick}
                            className="hover:opacity-90 transition-opacity flex items-center"
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        >
                            <motion.img
                                layoutId="app-logo"
                                src={logoLight}
                                alt="MyJSI Logo"
                                className="h-8 w-auto"
                                style={{ filter: filterStyle }}
                            />
                        </motion.button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <AnimatePresence>
                            {isHome && (
                                <motion.div
                                    key="greeting"
                                    initial={{ opacity: 0, width: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, width: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, width: 0, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="text-[15px] leading-tight whitespace-nowrap overflow-hidden origin-right"
                                    style={{ color: theme.colors.textPrimary }}
                                >
                                    Hello, {userName}!
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            layout
                            aria-label="Open profile menu"
                            onClick={onProfileClick}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg:white/5"
                            style={{ backgroundColor: theme.colors.surface, boxShadow: 'none' }}
                        >
                            <User className="w-5 h-5" style={{ color: theme.colors.textPrimary }} strokeWidth={2} />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
});
