import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { radius, shadow } from '../../design-system/tokens.js';

export const FloatingActionButton = ({ 
  icon: Icon, 
  onClick, 
  label,
  position = 'bottom-right',
  theme 
}) => {
  const [showLabel, setShowLabel] = useState(false);
  
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2'
  };
  
  return (
    <div className={`fixed z-50 ${positionClasses[position]}`}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setShowLabel(true)}
        onHoverEnd={() => setShowLabel(false)}
        className="relative"
      >
        {/* Label tooltip */}
        <AnimatePresence>
          {label && showLabel && (
            <motion.span
              initial={{ opacity: 0, x: position.includes('right') ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: position.includes('right') ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-1/2 -translate-y-1/2 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap ${
                position.includes('right') ? 'right-full mr-3' : 'left-full ml-3'
              }`}
              style={{ 
                backgroundColor: theme.colors.surface,
                color: theme.colors.textPrimary,
                boxShadow: shadow('lg'),
                borderRadius: radius('full')
              }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* FAB button */}
        <button
          onClick={onClick}
          className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-offset-2 transition-shadow"
          style={{ 
            backgroundColor: theme.colors.accent,
            borderRadius: radius('full'),
            boxShadow: shadow('2xl')
          }}
        >
          <Icon className="w-6 h-6 text-white" />
        </button>
      </motion.div>
    </div>
  );
};

// Extended FAB with multiple actions
export const ExtendedFAB = ({ 
  icon: Icon,
  label,
  actions = [],
  theme 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="flex flex-col items-end gap-3">
        {/* Action buttons */}
        <AnimatePresence>
          {isOpen && actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ 
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
              className="flex items-center gap-3"
            >
              <span
                className="px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap shadow-lg"
                style={{ 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.textPrimary,
                  borderRadius: radius('full')
                }}
              >
                {action.label}
              </span>
              <button
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className="w-12 h-12 rounded-full shadow-xl flex items-center justify-center"
                style={{ 
                  backgroundColor: action.color || theme.colors.accent,
                  borderRadius: radius('full')
                }}
              >
                <action.icon className="w-5 h-5 text-white" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Main FAB */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
          style={{ 
            backgroundColor: theme.colors.accent,
            borderRadius: radius('full'),
            boxShadow: shadow('2xl')
          }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.button>
      </div>
    </div>
  );
};
