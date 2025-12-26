import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { User, Bell, Palette, ChevronDown, Check, Navigation, Shield, Camera, Clock, GripVertical, ChevronRight, Timer } from 'lucide-react';
import { DESIGN_TOKENS, JSI_COLORS, getInputStyles, ScreenLayout } from '../../design-system/index.js';
import { ALL_NAV_ITEMS } from '../../components/navigation/NavigationShell.jsx';
import { LEAD_TIMES_DATA } from '../resources/lead-times/data.js';

// Animated Toggle Switch
const Toggle = ({ checked, onChange, theme }) => (
  <button
    onClick={() => onChange(!checked)}
    className="w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none flex-shrink-0"
    style={{
      backgroundColor: checked ? theme.colors.accent : theme.colors.border,
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
    }}
  >
    <motion.div
      className="w-4.5 h-4.5 bg-white rounded-full shadow-sm absolute top-[3px] left-[3px]"
      style={{ width: 18, height: 18 }}
      animate={{ x: checked ? 18 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </button>
);

// Compact Select for inline use
const CompactSelect = ({ value, onChange, options, theme }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (!open) return;
      if (triggerRef.current?.contains(e.target)) return;
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
        className="px-3 py-2 rounded-xl flex items-center gap-1.5 text-sm transition-all duration-200"
        style={{
          backgroundColor: theme.colors.surface,
          border: `1px solid ${open ? theme.colors.accent : theme.colors.border}`,
          color: theme.colors.textPrimary,
        }}
      >
        <span className="font-medium">{currentLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
      </button>
      {open && rect && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: rect.bottom + 4,
              left: rect.left,
              minWidth: rect.width,
              zIndex: 99999
            }}
          >
            <div
              className="py-1 overflow-hidden backdrop-blur-xl"
              style={{
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 12,
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
              }}
            >
              {options.map(o => (
                <button
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors hover:bg-black/5"
                  style={{
                    color: o.value === value ? theme.colors.accent : theme.colors.textPrimary,
                    fontWeight: o.value === value ? 600 : 400
                  }}
                >
                  {o.label}
                  {o.value === value && <Check className="w-3.5 h-3.5" />}
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
const [homeAddress, setHomeAddress] = useState('5445 N Deerwood Lake Rd, Jasper, IN 47546');
const [shirtSize, setShirtSize] = useState('L');
const [profileImage, setProfileImage] = useState(null);
const fileInputRef = useRef(null);
const [notif, setNotif] = useState({
  newOrder: true,
  orderUpdate: true,
  samplesShipped: true,
  sampleDelivery: true,
  leadTimeChange: true,
  productDiscontinuation: true,
  productLaunch: true,
  replacementApproved: true
});
  
// Lead time series notification settings
const [leadTimeNotifyAll, setLeadTimeNotifyAll] = useState(true);
const [leadTimeSelectedSeries, setLeadTimeSelectedSeries] = useState(new Set());
const [showLeadTimeSeriesSelector, setShowLeadTimeSeriesSelector] = useState(false);
  
// Get unique series from lead times data
const allSeries = useMemo(() => {
  const seriesSet = new Set(LEAD_TIMES_DATA.map(item => item.series));
  return Array.from(seriesSet).sort();
}, []);
  
const toggleLeadTimeSeries = (series) => {
  setLeadTimeSelectedSeries(prev => {
    const newSet = new Set(prev);
    if (newSet.has(series)) {
      newSet.delete(series);
    } else {
      newSet.add(series);
    }
    return newSet;
  });
};
  
// Notification delivery schedule
const [notifSchedule, setNotifSchedule] = useState('realtime'); // 'realtime', 'daily', 'weekly'
const [notifTime, setNotifTime] = useState('09:00');
const [notifDay, setNotifDay] = useState('monday');
const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  
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

  const handleNavReorder = (newOrder) => {
    setSelectedNavItems(newOrder);
    onUpdateNavItems?.(newOrder);
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const notifLabels = {
    newOrder: 'New order placed',
    orderUpdate: 'Order status update',
    samplesShipped: 'Samples shipped',
    sampleDelivery: 'Sample delivery confirmed',
    leadTimeChange: 'Lead time change',
    productDiscontinuation: 'Product discontinuation',
    productLaunch: 'New product launch',
    replacementApproved: 'Replacement approved'
  };

  const scheduleOptions = [
    { value: 'realtime', label: 'Real-time (Instant)' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Summary' }
  ];

  const timeOptions = [
    { value: '07:00', label: '7:00 AM' },
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '17:00', label: '5:00 PM' },
    { value: '18:00', label: '6:00 PM' }
  ];

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' }
  ];

  const header = (
    <div className="flex items-center gap-4 pt-6 pb-2">
      <button
        onClick={handleProfileImageClick}
        className="relative w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-lg ring-2 ring-white/20 overflow-hidden group cursor-pointer transition-transform hover:scale-105"
        style={{ backgroundColor: profileImage ? 'transparent' : theme.colors.accent, color: JSI_COLORS.white }}
      >
        {profileImage ? (
          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          `${firstName[0]}${lastName[0]}`
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-5 h-5 text-white" />
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
          Settings
        </h1>
        <p className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
          MyJSI Preferences
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
      <div className="space-y-5 max-w-2xl mx-auto">
        {/* Account Settings - Condensed */}
        <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
          <div className="px-5 py-3.5 border-b flex items-center gap-2.5" style={{ borderColor: theme.colors.subtle }}>
            <div className="p-1.5 rounded-full bg-black/5 dark:bg-white/10">
              <User className="w-4 h-4" style={{ color: theme.colors.textPrimary }} />
            </div>
            <h2 className="text-base font-bold" style={{ color: theme.colors.textPrimary }}>Account Details</h2>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider pl-0.5" style={{ color: theme.colors.textSecondary }}>First Name</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-shadow focus:ring-2 focus:ring-opacity-50 outline-none"
                  style={{ ...getInputStyles(theme), boxShadow: 'none' }}
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider pl-0.5" style={{ color: theme.colors.textSecondary }}>Last Name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-shadow focus:ring-2 focus:ring-opacity-50 outline-none"
                  style={{ ...getInputStyles(theme), boxShadow: 'none' }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider pl-0.5" style={{ color: theme.colors.textSecondary }}>T-Shirt</label>
                <CompactSelect
                  value={shirtSize}
                  onChange={setShirtSize}
                  options={['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(s => ({ value: s, label: s }))}
                  theme={theme}
                />
              </div>
            </div>
            {/* Address field */}
            <div className="mt-4 space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider pl-0.5" style={{ color: theme.colors.textSecondary }}>Home Address</label>
              <input
                value={homeAddress}
                onChange={e => setHomeAddress(e.target.value)}
                placeholder="Street Address, City, State ZIP"
                className="w-full px-3 py-2 rounded-lg text-sm transition-shadow focus:ring-2 focus:ring-opacity-50 outline-none"
                style={{ ...getInputStyles(theme), boxShadow: 'none' }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Notifications - Condensed with Schedule Options */}
        <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: theme.colors.subtle }}>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-full bg-black/5 dark:bg-white/10">
                <Bell className="w-4 h-4" style={{ color: theme.colors.textPrimary }} />
              </div>
              <h2 className="text-base font-bold" style={{ color: theme.colors.textPrimary }}>Notifications</h2>
            </div>
            <button
              onClick={() => setShowScheduleOptions(!showScheduleOptions)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-black/5"
              style={{ color: theme.colors.textSecondary }}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{scheduleOptions.find(o => o.value === notifSchedule)?.label}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showScheduleOptions ? 'rotate-90' : ''}`} />
            </button>
          </div>
          
          {/* Schedule Options - Collapsible */}
          <AnimatePresence>
            {showScheduleOptions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b"
                style={{ borderColor: theme.colors.subtle }}
              >
                <div className="p-4 space-y-3" style={{ backgroundColor: theme.colors.subtle + '50' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>Delivery:</span>
                    {scheduleOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setNotifSchedule(opt.value)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{
                          backgroundColor: notifSchedule === opt.value ? theme.colors.accent : theme.colors.surface,
                          color: notifSchedule === opt.value ? '#fff' : theme.colors.textSecondary,
                          border: `1px solid ${notifSchedule === opt.value ? theme.colors.accent : theme.colors.border}`
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {notifSchedule !== 'realtime' && (
                    <div className="flex items-center gap-3">
                      {notifSchedule === 'weekly' && (
                        <CompactSelect
                          value={notifDay}
                          onChange={setNotifDay}
                          options={dayOptions}
                          theme={theme}
                        />
                      )}
                      <CompactSelect
                        value={notifTime}
                        onChange={setNotifTime}
                        options={timeOptions}
                        theme={theme}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="divide-y" style={{ borderColor: theme.colors.subtle }}>
            {Object.keys(notif).map((key) => (
              <div key={key} className="flex items-center justify-between px-5 py-3 hover:bg-black/[0.02] transition-colors">
                <span className="text-sm" style={{ color: theme.colors.textPrimary }}>
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

        {/* Lead Time Alerts - Series Selection */}
        {notif.leadTimeChange && (
          <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
            <button
              onClick={() => setShowLeadTimeSeriesSelector(!showLeadTimeSeriesSelector)}
              className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-black/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-full" style={{ backgroundColor: `${theme.colors.accent}10` }}>
                  <Timer className="w-4 h-4" style={{ color: theme.colors.accent }} />
                </div>
                <div className="text-left">
                  <h2 className="text-base font-bold" style={{ color: theme.colors.textPrimary }}>Lead Time Alerts</h2>
                  <p className="text-[10px] font-medium" style={{ color: theme.colors.textSecondary }}>
                    {leadTimeNotifyAll 
                      ? 'All series' 
                      : leadTimeSelectedSeries.size === 0 
                        ? 'No series selected'
                        : `${leadTimeSelectedSeries.size} series selected`
                    }
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${showLeadTimeSeriesSelector ? 'rotate-90' : ''}`} style={{ color: theme.colors.textSecondary }} />
            </button>
            
            <AnimatePresence>
              {showLeadTimeSeriesSelector && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t"
                  style={{ borderColor: theme.colors.subtle }}
                >
                  <div className="p-4 space-y-3">
                    {/* All series toggle */}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                        Notify for all lead time changes
                      </span>
                      <Toggle
                        checked={leadTimeNotifyAll}
                        onChange={(v) => {
                          setLeadTimeNotifyAll(v);
                          if (v) setLeadTimeSelectedSeries(new Set());
                        }}
                        theme={theme}
                      />
                    </div>
                    
                    {/* Series selection - only show if not "all" */}
                    {!leadTimeNotifyAll && (
                      <div className="pt-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: theme.colors.textSecondary }}>
                          Select specific series
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                          {allSeries.map(series => {
                            const isSelected = leadTimeSelectedSeries.has(series);
                            return (
                              <button
                                key={series}
                                onClick={() => toggleLeadTimeSeries(series)}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                                style={{
                                  backgroundColor: isSelected ? theme.colors.accent : theme.colors.subtle,
                                  color: isSelected ? '#fff' : theme.colors.textSecondary,
                                  border: `1px solid ${isSelected ? theme.colors.accent : theme.colors.border}`
                                }}
                              >
                                {series}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        )}

        {/* Navigation - With Drag to Reorder */}
        <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
          <div className="px-5 py-3.5 border-b flex items-center gap-2.5" style={{ borderColor: theme.colors.subtle }}>
            <div className="p-1.5 rounded-full" style={{ backgroundColor: `${theme.colors.accent}10` }}>
              <Navigation className="w-4 h-4" style={{ color: theme.colors.accent }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: theme.colors.textPrimary }}>Bottom Navigation</h2>
              <p className="text-[10px] font-medium" style={{ color: theme.colors.textSecondary }}>
                Select up to 5 • Drag to reorder
              </p>
            </div>
          </div>
          <div className="p-4">
            {/* Selected Items - Reorderable */}
            {selectedNavItems.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: theme.colors.textSecondary }}>
                  Active ({selectedNavItems.length}/5)
                </p>
                <Reorder.Group axis="y" values={selectedNavItems} onReorder={handleNavReorder} className="space-y-1.5">
                  {selectedNavItems.map((itemId) => {
                    const option = ALL_NAV_ITEMS.find(item => item.id === itemId);
                    if (!option) return null;
                    const Icon = option.icon;
                    return (
                      <Reorder.Item
                        key={itemId}
                        value={itemId}
                        className="flex items-center justify-between p-3 rounded-xl cursor-grab active:cursor-grabbing"
                        style={{
                          backgroundColor: theme.colors.surface,
                          border: `1.5px solid ${theme.colors.accent}`,
                          boxShadow: DESIGN_TOKENS.shadows.sm
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <GripVertical className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${theme.colors.accent}15` }}
                          >
                            {Icon && <Icon className="w-4 h-4" style={{ color: theme.colors.accent }} />}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {option.label}
                          </span>
                        </div>
                        <button
                          onClick={() => handleNavItemToggle(itemId)}
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: theme.colors.accent }}
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </button>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              </div>
            )}
            
            {/* Available Items */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: theme.colors.textSecondary }}>
                Available
              </p>
              <div className="space-y-1.5">
                {ALL_NAV_ITEMS.filter(option => !selectedNavItems.includes(option.id)).map((option) => {
                  const isDisabled = selectedNavItems.length >= 5;
                  const Icon = option.icon;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => !isDisabled && handleNavItemToggle(option.id)}
                      disabled={isDisabled}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                        isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-black/[0.02]'
                      }`}
                      style={{
                        backgroundColor: theme.colors.subtle,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${theme.colors.accent}08` }}
                        >
                          {Icon && <Icon className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />}
                        </div>
                        <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Appearance */}
        <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
          <div className="px-5 py-3.5 border-b flex items-center gap-2.5" style={{ borderColor: theme.colors.subtle }}>
            <div className="p-1.5 rounded-full bg-black/5 dark:bg-white/10">
              <Palette className="w-4 h-4" style={{ color: theme.colors.textPrimary }} />
            </div>
            <h2 className="text-base font-bold" style={{ color: theme.colors.textPrimary }}>Appearance</h2>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <span className="text-sm" style={{ color: theme.colors.textPrimary }}>Dark Mode</span>
            <Toggle checked={isDarkMode} onChange={onToggleTheme} theme={theme} />
          </div>
        </GlassCard>

        <div className="pt-2 pb-8 flex flex-col items-center justify-center space-y-1.5 opacity-50">
          <Shield className="w-5 h-5 mb-0.5" style={{ color: theme.colors.textSecondary }} />
          <p className="text-[10px] font-medium" style={{ color: theme.colors.textSecondary }}>
            Version 0.9.4 (Build 2024.12)
          </p>
          <p className="text-[9px]" style={{ color: theme.colors.textSecondary }}>
            © 2024 JSI Furniture. All rights reserved.
          </p>
        </div>
      </div>
    </ScreenLayout>
  );
};
