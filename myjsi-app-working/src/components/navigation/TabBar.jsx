import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { radius, transition } from '../../design-system/tokens.js';

export const TabBar = ({ tabs, activeTab, onChange, theme, variant = 'pills' }) => {
  const tabRefs = useRef([]);
  const containerRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0, opacity: 0 });
  
  const updateUnderline = useCallback(() => {
    const activeIndex = tabs.findIndex(t => t.key === activeTab);
    if (activeIndex === -1 || !tabRefs.current[activeIndex]) return;
    
    const activeTabEl = tabRefs.current[activeIndex];
    const containerEl = containerRef.current;
    
    if (!activeTabEl || !containerEl) return;
    
    const containerRect = containerEl.getBoundingClientRect();
    const tabRect = activeTabEl.getBoundingClientRect();
    
    setUnderlineStyle({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
      opacity: 1
    });
  }, [activeTab, tabs]);
  
  useEffect(() => {
    updateUnderline();
    window.addEventListener('resize', updateUnderline);
    return () => window.removeEventListener('resize', updateUnderline);
  }, [updateUnderline]);
  
  if (variant === 'pills') {
    return (
      <div 
        className="relative flex gap-1 p-1 rounded-2xl" 
        style={{ 
          backgroundColor: theme.colors.surface,
          borderRadius: radius('xl')
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isActive ? 'shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={{
                backgroundColor: isActive ? theme.colors.accent : 'transparent',
                color: isActive ? '#fff' : theme.colors.textSecondary,
                borderRadius: radius('lg')
              }}
            >
              {tab.icon && <tab.icon className="w-4 h-4 mr-2 inline" />}
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }
  
  // Underline variant
  return (
    <div 
      ref={containerRef}
      className="relative flex"
      style={{ borderBottom: `1px solid ${theme.colors.border}` }}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            ref={el => tabRefs.current[index] = el}
            onClick={() => onChange(tab.key)}
            className="flex-1 flex items-center justify-center gap-2 h-12 font-semibold text-sm tracking-wide transition-colors"
            style={{ 
              color: isActive ? theme.colors.textPrimary : theme.colors.textSecondary 
            }}
          >
            {tab.icon && (
              <tab.icon 
                className="w-4 h-4" 
                style={{ color: isActive ? theme.colors.accent : theme.colors.textSecondary }} 
              />
            )}
            {tab.label}
          </button>
        );
      })}
      
      {/* Animated underline */}
      <motion.div
        className="absolute bottom-0 h-[3px] rounded-full"
        style={{ 
          backgroundColor: theme.colors.accent,
          left: underlineStyle.left,
          width: underlineStyle.width,
          opacity: underlineStyle.opacity
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 30 
        }}
      />
    </div>
  );
};

// Segmented control variant (like iOS)
export const SegmentedControl = ({ tabs, activeTab, onChange, theme }) => {
  return (
    <div 
      className="inline-flex p-0.5 rounded-lg" 
      style={{ 
        backgroundColor: theme.colors.subtle,
        borderRadius: radius('md')
      }}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`px-4 py-1.5 rounded-md font-medium text-sm transition-all ${
              isActive ? 'shadow-sm' : ''
            }`}
            style={{
              backgroundColor: isActive ? theme.colors.surface : 'transparent',
              color: isActive ? theme.colors.textPrimary : theme.colors.textSecondary,
              borderRadius: radius('sm')
            }}
          >
            {tab.icon && <tab.icon className="w-4 h-4 mr-2 inline" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
