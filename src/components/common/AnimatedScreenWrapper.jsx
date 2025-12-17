/* eslint-disable react/prop-types */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const AnimatedScreenWrapper = ({
    children,
    screenKey,
    direction = 'forward',
    onSwipeBack = null
}) => {
    // Subtle, performant transitions - minimal slide with fade
    // Forward: New enters from Right (8%), Old exits Left (-8%)
    // Backward: New enters from Left (-8%), Old exits Right (8%)

    // Fast, smooth transition without heavy spring physics
    const transition = { type: "tween", duration: 0.15, ease: [0.4, 0, 0.2, 1] };

    const variants = {
        enter: (dir) => ({
            x: dir === 'forward' ? '8%' : '-8%',
            opacity: 0,
            zIndex: dir === 'forward' ? 2 : 1
        }),
        center: {
            x: 0,
            opacity: 1,
            zIndex: 2,
            transition
        },
        exit: (dir) => ({
            x: dir === 'forward' ? '-8%' : '8%',
            opacity: 0,
            zIndex: dir === 'forward' ? 1 : 2,
            transition
        })
    };

    return (
        <div className="animated-screen-container" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={screenKey}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    // Swipe Back Logic
                    drag={onSwipeBack ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={{ right: 0.7 }} // Allow pull to right
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipeThreshold = 50;
                        const velocityThreshold = 200;
                        if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
                            if (onSwipeBack) onSwipeBack();
                        }
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'transparent', // Let child control bg, or inherit
                        willChange: 'transform',
                        boxShadow: 'none' // No shadow for cleaner, faster transitions
                    }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
