import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { User, Bell, Palette, ChevronDown, Check, Navigation, Shield } from 'lucide-react';
import { DESIGN_TOKENS, JSI_COLORS, getInputStyles, ScreenLayout } from '../../design-system/index.js';
import { ALL_NAV_ITEMS } from '../../components/navigation/NavigationShell.jsx';

// Animated Toggle Switch
const Toggle = ({ checked, onChange, theme }) => (
  <button
    onClick={() => onChange(!checked)}
    className="w-12 h-7 rounded-full relative transition-colors duration-300 focus:outline-none"
    style={{
      backgroundColor: checked ? theme.colors.accent : theme.colors.border,
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
    }}
  >
    <motion.div
      className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 left-1"
      animate={{ x: checked ? 20 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </button>
);

// Custom Select with Portal for overflow safety and premium styling
const Select = ({ value, onChange, options, theme }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const portalRef = useRef(null);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (!open) return;
      if (triggerRef.current?.contains(e.target)) return;
      if (portalRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (open && triggerRef.current) {
      const update = () => { if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect()); };
      update();
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
    }
  }, [open]);

  const currentLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className="relative" ref={triggerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 rounded-xl flex items-center justify-between text-sm transition-all duration-200"
        style={{
          backgroundColor: theme.colors.surface,
          border: `1px solid ${open ? theme.colors.accent : theme.colors.border}`,
          color: theme.colors.textPrimary,
          boxShadow: open ? `0 0 0 2px ${theme.colors.accent}20` : 'none'
        }}
      >
        <span className="font-medium">{currentLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
      </button>
      {open && rect && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: rect.bottom + 6,
              left: rect.left,
              width: rect.width,
              zIndex: 99999
            }}
          >
            <div
              className="py-1.5 overflow-hidden backdrop-blur-xl"
              style={{
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 16,
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
              }}
            >
              {options.map(o => (
                <button
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                  style={{
                    color: o.value === value ? theme.colors.accent : theme.colors.textPrimary,
                    fontWeight: o.value === value ? 600 : 400
                  }}
                >
                  {o.label}
                  {o.value === value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export const SettingsScreen = ({ theme, isDarkMode, onToggleTheme, customNavItems = [], onUpdateNavItems }) => {
  const [firstName, setFirstName] = useState('Luke');
  const [lastName, setLastName] = useState('Wagner');
  const [shirtSize, setShirtSize] = useState('L');
  const [notif, setNotif] = useState({
    newOrder: true,
    samplesShipped: true,
    leadTimeChange: true,
    communityPost: false,
    replacementApproved: true,
    commissionPosted: true,
    orderUpdate: true
  });
  
  const [selectedNavItems, setSelectedNavItems] = useState(
    customNavItems && customNavItems.length > 0 
      ? customNavItems 
      : ['home', 'projects', 'orders', 'sales', 'resources/dealer-directory']
  );
  
  // Sync with prop changes
  useEffect(() => {
    if (customNavItems && customNavItems.length > 0) {
      setSelectedNavItems(customNavItems);
    }
  }, [customNavItems]);
  
  const handleNavItemToggle = (itemId) => {
    const newItems = selectedNavItems.includes(itemId)
      ? selectedNavItems.filter(id => id !== itemId)
      : [...selectedNavItems, itemId];
    setSelectedNavItems(newItems);
    onUpdateNavItems?.(newItems);
  };

  const notifLabels = {
    newOrder: 'New order placed',
    orderUpdate: 'Order status update',
    samplesShipped: 'Samples shipped',
    leadTimeChange: 'Lead time change',
    replacementApproved: 'Replacement approved',
    commissionPosted: 'Commission posted',
    communityPost: 'New JSI community post'
  };

  const header = (
    <div className="flex items-center gap-5 pt-6 pb-2">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl ring-4 ring-white/20"
        style={{ backgroundColor: theme.colors.accent, color: JSI_COLORS.white }}
      >
        {firstName[0]}{lastName[0]}
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: theme.colors.textPrimary }}>
          Settings
        </h1>
        <p className="font-medium" style={{ color: theme.colors.textSecondary }}>
          Partner Portal Preferences
        </p>
      </div>
    </div>
  );

  return (
    <ScreenLayout
      theme={theme}
      header={header}
      maxWidth="default"
      padding={true}
      paddingBottom="8rem"
    >
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Account Settings */}
        <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
          <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: theme.colors.subtle }}>
            <div className="p-2 rounded-full bg-black/5 dark:bg-white/10">
              <User className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>Account Details</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider pl-1" style={{ color: theme.colors.textSecondary }}>First Name</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm transition-shadow focus:ring-2 focus:ring-opacity-50 outline-none"
                  style={{
                    ...getInputStyles(theme),
                    boxShadow: 'none'
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider pl-1" style={{ color: theme.colors.textSecondary }}>Last Name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm transition-shadow focus:ring-2 focus:ring-opacity-50 outline-none"
                  style={{
                    ...getInputStyles(theme),
                    boxShadow: 'none'
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider pl-1" style={{ color: theme.colors.textSecondary }}>T-Shirt Size</label>
              <Select
                value={shirtSize}
                onChange={setShirtSize}
                options={['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(s => ({ value: s, label: s }))}
                theme={theme}
              />
            </div>
          </div>
        </GlassCard>

        {/* Notifications */}
        <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
          <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: theme.colors.subtle }}>
            <div className="p-2 rounded-full bg-black/5 dark:bg-white/10">
              <Bell className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>Notifications</h2>
          </div>
          <div className="divide-y" style={{ borderColor: theme.colors.subtle }}>
            {Object.keys(notif).map((key) => (
              <div key={key} className="flex items-center justify-between px-6 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                  {notifLabels[key]}
                </span>
                <Toggle
                  checked={!!notif[key]}
                  onChange={v => setNotif(p => ({ ...p, [key]: v }))}
                  theme={theme}
                />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Navigation */}
        <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
          <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: theme.colors.subtle }}>
            <div className="p-2 rounded-full" style={{ backgroundColor: `${theme.colors.accent}10` }}>
              <Navigation className="w-5 h-5" style={{ color: theme.colors.accent }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>Bottom Navigation</h2>
              <p className="text-xs font-medium mt-0.5" style={{ color: theme.colors.textSecondary }}>
                Customize your navigation bar (up to 5 items)
              </p>
            </div>
          </div>
          <div className="p-6 space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {ALL_NAV_ITEMS.map((option) => {
                const isSelected = selectedNavItems.includes(option.id);
                const isDisabled = !isSelected && selectedNavItems.length >= 5;
                const Icon = option.icon;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => !isDisabled && handleNavItemToggle(option.id)}
                    disabled={isDisabled}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                    style={{
                      backgroundColor: isSelected ? theme.colors.surface : theme.colors.subtle,
                      border: `1.5px solid ${isSelected ? theme.colors.accent : theme.colors.border}`,
                      boxShadow: isSelected ? DESIGN_TOKENS.shadows.sm : 'none'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: isSelected ? `${theme.colors.accent}15` : `${theme.colors.accent}08`
                        }}
                      >
                        {Icon ? (
                          <Icon 
                            className="w-5 h-5" 
                            style={{ color: isSelected ? theme.colors.accent : theme.colors.textSecondary }} 
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200" />
                        )}
                      </div>
                      <span 
                        className="text-sm font-semibold" 
                        style={{ color: isSelected ? theme.colors.textPrimary : theme.colors.textSecondary }}
                      >
                        {option.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: theme.colors.accent }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedNavItems.length >= 5 && (
              <p className="text-xs text-center pt-2" style={{ color: theme.colors.textSecondary }}>
                Maximum 5 items selected. Deselect one to add another.
              </p>
            )}
          </div>
        </GlassCard>

        {/* Appearance */}
        <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
          <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: theme.colors.subtle }}>
            <div className="p-2 rounded-full bg-black/5 dark:bg-white/10">
              <Palette className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>Appearance</h2>
          </div>
          <div className="p-6 flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>Dark Mode</span>
            <Toggle checked={isDarkMode} onChange={onToggleTheme} theme={theme} />
          </div>
        </GlassCard>

        <div className="pt-4 pb-8 flex flex-col items-center justify-center space-y-2 opacity-50">
          {Shield ? (
            <Shield className="w-6 h-6 mb-1" style={{ color: theme.colors.textSecondary }} />
          ) : (
            <div className="w-6 h-6 mb-1 rounded-full border-2 border-current opacity-20" />
          )}
          <p className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
            Version 0.9.4 (Build 2024.12)
          </p>
          <p className="text-[10px]" style={{ color: theme.colors.textSecondary }}>
            © 2024 JSI Furniture. All rights reserved.
          </p>
        </div>
      </div>
    </ScreenLayout>
  );
};
