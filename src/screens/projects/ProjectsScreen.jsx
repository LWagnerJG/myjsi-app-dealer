import React, { useState, useMemo, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Briefcase, ArrowRight, Users, Building2, MapPin, Shield, Package, X, Search, ChevronRight, Plus, FileText, Send, CheckCircle } from 'lucide-react';
import { STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS, PO_TIMEFRAMES, INITIAL_DESIGN_FIRMS } from './data.js';
import { ProbabilitySlider } from '../../components/forms/ProbabilitySlider.jsx';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch.jsx';
import { TabToggle, FilterChips, ScreenLayout } from '../../design-system/index.js';
import { JSI_SERIES } from '../products/data.js';
import { useIsDesktop } from '../../hooks/useResponsive.js';
import { MOCK_CUSTOMERS, STATUS_COLORS, CUSTOMER_FILTER_OPTIONS } from '../../data/mockCustomers.js';
import { DESIGN_TOKENS, JSI_COLORS, getToggleButtonStyles } from '../../design-system/tokens.js';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { useModalState } from '../../hooks/useModalState.js';

// currency util
const fmtCurrency = (v) => typeof v === 'string' ? (v.startsWith('$') ? v : '$' + v) : (v ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// Suggest input pill (inline tag adder w/ suggestions) - allows adding custom values
const SuggestInputPill = ({ placeholder, suggestions, onAdd, theme, onAddNew }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menu = useRef(null);
  
  const filtered = useMemo(() => 
    suggestions.filter(s => s.toLowerCase().includes(q.toLowerCase()) && s.toLowerCase() !== q.toLowerCase()).slice(0, 8), 
    [q, suggestions]
  );
  
  // Check if typed value is custom (not in suggestions)
  const isCustomValue = q.trim() && !suggestions.some(s => s.toLowerCase() === q.trim().toLowerCase());
  
  useEffect(() => { 
    if (!open) return; 
    const close = e => { 
      if (ref.current && !ref.current.contains(e.target) && menu.current && !menu.current.contains(e.target)) 
        setOpen(false); 
    }; 
    window.addEventListener('mousedown', close); 
    return () => window.removeEventListener('mousedown', close); 
  }, [open]);
  
  const commit = (val) => { 
    if (val) { 
      onAdd(val);
      // If it's a custom value, also call onAddNew to persist to backend data
      if (onAddNew && !suggestions.some(s => s.toLowerCase() === val.toLowerCase())) {
        onAddNew(val);
      }
      setQ(''); 
    } 
    setOpen(false); 
  };
  
  const showDropdown = open && (filtered.length > 0 || isCustomValue);
  
  return (
    <div className="relative" ref={ref} style={{ minWidth: 140 }}>
      <input 
        value={q} 
        onChange={e => { setQ(e.target.value); setOpen(true); }} 
        onFocus={() => setOpen(true)} 
        onKeyDown={e => { 
          if (e.key === 'Enter') { commit(q.trim()); } 
          if (e.key === 'Escape') { setOpen(false); } 
        }} 
        placeholder={placeholder} 
        className="h-8 px-3 rounded-lg text-xs font-medium outline-none border w-full" 
        style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }} 
      />
      {showDropdown && (
        <div ref={menu} className="absolute z-50 mt-1 rounded-xl border shadow-lg overflow-hidden" style={{ background: theme.colors.surface, borderColor: theme.colors.border, maxHeight: 220, minWidth: '100%' }}>
          <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
            {/* Show "Add new" option for custom values */}
            {isCustomValue && (
              <button 
                onClick={() => commit(q.trim())} 
                className="w-full text-left px-3 py-2.5 text-xs font-semibold hover:bg-black/5 flex items-center gap-2"
                style={{ color: theme.colors.accent }}
              >
                <Plus className="w-3 h-3" />
                Add "{q.trim()}"
              </button>
            )}
            {filtered.map(s => (
              <button 
                key={s} 
                onClick={() => commit(s)} 
                className="w-full text-left px-3 py-2 text-xs hover:bg-black/5" 
                style={{ color: theme.colors.textPrimary }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper label / inputs
const SoftLabel = ({ children, theme }) => <span className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: theme.colors.textSecondary }}>{children}</span>;
const InlineTextInput = ({ value, onChange, theme, placeholder, className = '' }) => (
  <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`bg-transparent outline-none border-b border-transparent focus:border-[currentColor] transition-colors ${className}`} style={{ color: theme.colors.textPrimary }} />
);
const CurrencyInput = ({ value, onChange, theme }) => {
  const raw = ('' + (value || '')).replace(/[^0-9]/g, '');
  return <input inputMode="numeric" value={raw} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); onChange(val ? ('$' + parseInt(val, 10).toLocaleString()) : ''); }} className="bg-transparent outline-none px-0 py-1 text-sm font-semibold border-b border-transparent focus:border-[currentColor] w-32" style={{ color: theme.colors.textPrimary }} />;
};

// Simple Section Card for OpportunityDetail - not collapsible, cleaner look
const SectionCard = ({ title, icon: Icon, children, theme, className = '' }) => {
  return (
    <div className={`rounded-2xl overflow-hidden ${className}`} style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
      {title && (
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" style={{ color: theme.colors.accent }} />}
          <span className="text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>{title}</span>
        </div>
      )}
      <div className="px-4 pb-4">
        {children}
      </div>
    </div>
  );
};

// Stage Timeline - Visual pipeline progress
const StageTimeline = ({ stages, currentStage, onStageChange, theme }) => {
  const currentIndex = stages.indexOf(currentStage);
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {stages.map((stage, i) => {
        const isActive = stage === currentStage;
        const isPast = i < currentIndex;
        const isWon = stage === 'Won';
        const isLost = stage === 'Lost';
        
        return (
          <button
            key={stage}
            onClick={() => onStageChange(stage)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 ${
              isActive ? 'scale-105 shadow-md' : 'hover:scale-102'
            }`}
            style={{
              backgroundColor: isActive 
                ? (isWon ? '#4A7C59' : isLost ? '#B85C5C' : theme.colors.accent)
                : isPast 
                  ? `${theme.colors.accent}20`
                  : theme.colors.subtle,
              color: isActive 
                ? '#fff' 
                : isPast 
                  ? theme.colors.accent 
                  : theme.colors.textSecondary,
              border: `1px solid ${isActive ? 'transparent' : theme.colors.border}`,
            }}
          >
            {stage}
          </button>
        );
      })}
    </div>
  );
};

// Opportunity Detail - Redesigned with proper categorization
const OpportunityDetail = ({ opp, theme, onBack, onUpdate, customDesignFirms = [], onAddCustomDesignFirm }) => {
  const [draft, setDraft] = useState(opp);
  const dirty = useRef(false);
  const saveRef = useRef(null);
  const isDesktop = useIsDesktop();
  
  // Combine default design firms with custom ones
  const allDesignFirms = useMemo(() => {
    const combined = [...INITIAL_DESIGN_FIRMS, ...customDesignFirms];
    return [...new Set(combined)]; // Remove duplicates
  }, [customDesignFirms]);
  
  useEffect(() => { setDraft(opp); }, [opp.id]);
  
  const update = (k, v) => setDraft(p => { 
    const n = { ...p, [k]: v }; 
    dirty.current = true; 
    return n; 
  });
  
  useEffect(() => { 
    if (!dirty.current) return; 
    clearTimeout(saveRef.current); 
    saveRef.current = setTimeout(() => { 
      onUpdate(draft); 
      dirty.current = false; 
    }, 500); 
    return () => clearTimeout(saveRef.current); 
  }, [draft, onUpdate]);

  // Discount dropdown state
  const [discountOpen, setDiscountOpen] = useState(false);
  const discBtn = useRef(null);
  const discMenu = useRef(null);
  const [discPos, setDiscPos] = useState({ top: 0, left: 0, width: 0 });
  
  const openDiscount = () => { 
    if (discBtn.current) { 
      const r = discBtn.current.getBoundingClientRect(); 
      setDiscPos({ top: r.bottom + 8 + window.scrollY, left: r.left + window.scrollX, width: Math.max(r.width, 200) }); 
    } 
    setDiscountOpen(true); 
  };
  
  useEffect(() => { 
    if (!discountOpen) return; 
    const handler = e => { 
      if (discMenu.current && !discMenu.current.contains(e.target) && !discBtn.current.contains(e.target)) 
        setDiscountOpen(false); 
    }; 
    window.addEventListener('mousedown', handler); 
    window.addEventListener('resize', () => setDiscountOpen(false)); 
    return () => window.removeEventListener('mousedown', handler); 
  }, [discountOpen]);

  // Helper functions
  const removeFrom = (key, val) => update(key, (draft[key] || []).filter(x => x !== val));
  const addUnique = (key, val) => { 
    if (!val) return; 
    const list = draft[key] || []; 
    if (!list.includes(val)) update(key, [...list, val]); 
  };
  const addProductSeries = (series) => { 
    if (!series) return; 
    const list = draft.products || []; 
    if (!list.some(p => p.series === series)) update('products', [...list, { series }]); 
  };
  const removeProductSeries = (series) => update('products', (draft.products || []).filter(p => p.series !== series));
  const toggleCompetitor = (c) => {
    const list = draft.competitors || [];
    update('competitors', list.includes(c) ? list.filter(x => x !== c) : [...list, c]);
  };

  // Format value for display
  const displayValue = draft.value?.toString().replace(/[^0-9]/g, '') || '0';
  const formattedValue = parseInt(displayValue).toLocaleString();

  return (
    <ScreenLayout
      theme={theme}
      maxWidth="default"
      padding={true}
      paddingBottom="8rem"
      gap="0.75rem"
    >
      {/* Hero Header - Clean, no decorative elements */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
        {/* Project Name & Customer */}
        <div className="mb-4">
          <input
            value={draft.project || draft.name || ''}
            onChange={e => update('project', e.target.value)}
            className="text-xl font-bold bg-transparent outline-none w-full"
            style={{ color: theme.colors.textPrimary }}
            placeholder="Project Name"
          />
          <input
            value={draft.company || ''}
            onChange={e => update('company', e.target.value)}
            className="text-sm font-medium bg-transparent outline-none w-full mt-1"
            style={{ color: theme.colors.textSecondary }}
            placeholder="Customer"
          />
        </div>

        {/* Key Metrics Row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${theme.colors.accent}15` }}>
            <span className="text-lg font-bold" style={{ color: theme.colors.accent }}>${formattedValue}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
            <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{draft.winProbability || 0}% Win</span>
          </div>
          <button
            ref={discBtn}
            onClick={() => discountOpen ? setDiscountOpen(false) : openDiscount()}
            className="px-3 py-1.5 rounded-lg transition-colors hover:bg-black/5"
            style={{ backgroundColor: theme.colors.subtle }}
          >
            <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
              {draft.discount || 'Set Discount'}
            </span>
          </button>
        </div>
      </div>

      {/* Pipeline Progress */}
      <SectionCard title="Pipeline Stage" icon={ArrowRight} theme={theme}>
        <StageTimeline 
          stages={STAGES} 
          currentStage={draft.stage} 
          onStageChange={s => update('stage', s)} 
          theme={theme} 
        />
      </SectionCard>

      {/* Opportunity Details */}
      <SectionCard title="Opportunity Details" icon={Briefcase} theme={theme}>
        <div className="space-y-4">
          {/* Vertical */}
          <div>
            <SoftLabel theme={theme}>Industry Vertical</SoftLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {VERTICALS.map(v => {
                const isActive = v === draft.vertical;
                return (
                  <button
                    key={v}
                    onClick={() => update('vertical', v)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
                    style={{
                      backgroundColor: isActive ? theme.colors.accent : 'transparent',
                      color: isActive ? '#fff' : theme.colors.textPrimary,
                      border: `1px solid ${isActive ? theme.colors.accent : theme.colors.border}`,
                    }}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* PO Timeframe */}
          <div>
            <SoftLabel theme={theme}>Expected PO Timeframe</SoftLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {PO_TIMEFRAMES.map(t => {
                const isActive = t === draft.poTimeframe;
                return (
                  <button
                    key={t}
                    onClick={() => update('poTimeframe', t)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
                    style={{
                      backgroundColor: isActive ? theme.colors.accent : 'transparent',
                      color: isActive ? '#fff' : theme.colors.textPrimary,
                      border: `1px solid ${isActive ? theme.colors.accent : theme.colors.border}`,
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Contact & Value Row */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <SoftLabel theme={theme}>Primary Contact</SoftLabel>
              <input
                value={draft.contact || ''}
                onChange={e => update('contact', e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-lg text-sm outline-none"
                style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                placeholder="Contact name"
              />
            </div>
            <div>
              <SoftLabel theme={theme}>Estimated Value</SoftLabel>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: theme.colors.textSecondary }}>$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayValue}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    update('value', val ? '$' + parseInt(val).toLocaleString() : '');
                  }}
                  className="w-full pl-7 pr-3 py-2 rounded-lg text-sm font-semibold outline-none"
                  style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Win Probability */}
      <SectionCard title="Win Probability" icon={Shield} theme={theme}>
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Likelihood to close</span>
            <span className="text-lg font-bold" style={{ color: theme.colors.accent }}>{draft.winProbability || 0}%</span>
          </div>
          <ProbabilitySlider 
            value={draft.winProbability || 0} 
            onChange={v => update('winProbability', v)} 
            theme={theme} 
          />
        </div>
      </SectionCard>

      {/* Competition Analysis */}
      <SectionCard title="Competition" icon={Users} theme={theme}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: theme.colors.textSecondary }}>Competing against other manufacturers?</span>
            <ToggleSwitch 
              checked={!!draft.competitionPresent} 
              onChange={v => update('competitionPresent', v)} 
              theme={theme} 
            />
          </div>
          
          {draft.competitionPresent && (
            <div className="pt-2">
              <SoftLabel theme={theme}>Select Competitors</SoftLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {COMPETITORS.filter(c => c !== 'None').map(c => {
                  const isSelected = (draft.competitors || []).includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleCompetitor(c)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
                      style={{
                        backgroundColor: isSelected ? theme.colors.accent : 'transparent',
                        color: isSelected ? '#fff' : theme.colors.textPrimary,
                        border: `1px solid ${isSelected ? theme.colors.accent : theme.colors.border}`,
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Products & Partners */}
      <SectionCard title="Products & Partners" icon={Package} theme={theme}>
        <div className="space-y-5">
          {/* JSI Products */}
          <div>
            <SoftLabel theme={theme}>JSI Product Series</SoftLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {(draft.products || []).map(p => (
                <button 
                  key={p.series} 
                  onClick={() => removeProductSeries(p.series)} 
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors hover:opacity-80"
                  style={{ backgroundColor: `${theme.colors.accent}15`, color: theme.colors.accent, border: `1px solid ${theme.colors.accent}30` }}
                >
                  {p.series}
                  <X className="w-3 h-3" />
                </button>
              ))}
              <SuggestInputPill placeholder="Add series" suggestions={JSI_SERIES} onAdd={addProductSeries} theme={theme} />
            </div>
          </div>
          
          {/* Design Firms */}
          <div>
            <SoftLabel theme={theme}>Design Firms</SoftLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {(draft.designFirms || []).map(f => (
                <button 
                  key={f} 
                  onClick={() => removeFrom('designFirms', f)} 
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors hover:opacity-80"
                  style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                >
                  {f}
                  <X className="w-3 h-3 opacity-60" />
                </button>
              ))}
              <SuggestInputPill 
                placeholder="Add firm" 
                suggestions={allDesignFirms} 
                onAdd={v => addUnique('designFirms', v)} 
                onAddNew={onAddCustomDesignFirm}
                theme={theme} 
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Notes & Documents */}
      <SectionCard title="Notes & Documents" icon={FileText} theme={theme}>
        <div className="space-y-4">
          <div>
            <textarea
              value={draft.notes || ''}
              onChange={e => update('notes', e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl p-3 text-sm outline-none transition-colors"
              style={{ 
                backgroundColor: theme.colors.subtle, 
                color: theme.colors.textPrimary, 
                border: `1px solid ${theme.colors.border}` 
              }}
              placeholder="Add project notes, key details, next steps..."
            />
          </div>
          
          {Array.isArray(draft.quotes) && draft.quotes.length > 0 && (
            <div>
              <SoftLabel theme={theme}>Attached Quotes</SoftLabel>
              <div className="flex flex-col gap-2 mt-2">
                {draft.quotes.map(q => (
                  <a 
                    key={q.id} 
                    href={q.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors hover:bg-black/5"
                    style={{ color: theme.colors.textPrimary, backgroundColor: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}
                  >
                    <FileText className="w-4 h-4" style={{ color: theme.colors.accent }} />
                    {q.fileName}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Autosave indicator */}
      <div className="flex items-center justify-center gap-2 py-2">
        <CheckCircle className="w-3.5 h-3.5" style={{ color: '#4A7C59' }} />
        <span className="text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>Changes saved automatically</span>
      </div>

      {/* Discount Dropdown Portal */}
      {discountOpen && createPortal(
        <div 
          ref={discMenu} 
          className="fixed z-[9999] rounded-2xl shadow-2xl overflow-hidden"
          style={{ 
            top: discPos.top, 
            left: discPos.left, 
            width: discPos.width, 
            background: theme.colors.surface, 
            border: `1px solid ${theme.colors.border}` 
          }}
        >
          <div className="max-h-[320px] overflow-y-auto py-1">
            {DISCOUNT_OPTIONS.map(opt => (
              <button 
                key={opt} 
                onClick={() => { update('discount', opt); setDiscountOpen(false); }} 
                className={`w-full text-left px-4 py-2.5 text-xs hover:bg-black/5 transition-colors ${opt === draft.discount ? 'font-bold' : ''}`} 
                style={{ 
                  color: opt === draft.discount ? theme.colors.accent : theme.colors.textPrimary,
                  backgroundColor: opt === draft.discount ? `${theme.colors.accent}10` : 'transparent'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </ScreenLayout>
  );
};

// Project card component
const ProjectCard = ({ opp, theme, onClick }) => {
  const discountPct = typeof opp.discount === 'string' ? opp.discount : typeof opp.discount === 'number' ? opp.discount + '%' : null;
  let displayValue = opp.value;
  if (displayValue != null) {
    if (typeof displayValue === 'number') displayValue = '$' + displayValue.toLocaleString();
    else if (typeof displayValue === 'string' && !displayValue.trim().startsWith('$')) {
      const num = parseFloat(displayValue.replace(/[^0-9.]/g, '')); if (!isNaN(num)) displayValue = '$' + num.toLocaleString();
    }
  }
  return (
    <button onClick={onClick} className="w-full text-left group" style={{ WebkitTapHighlightColor: 'transparent' }}>
      <GlassCard theme={theme} className="p-5 transition-all duration-200 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0" variant="elevated">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-[15px] leading-snug truncate" style={{ color: theme.colors.textPrimary }}>{opp.name}</p>
            <p className="mt-1 text-[13px] font-medium leading-tight truncate" style={{ color: theme.colors.textSecondary }}>{opp.company || 'Unknown'}</p>
          </div>
          {discountPct && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary, border: `1px solid ${theme.colors.border}` }}>{discountPct}</span>}
        </div>
        <div className="mt-3 mb-3 h-px" style={{ backgroundColor: theme.colors.subtle }} />
        <div className="flex items-end justify-end">
          <p className="font-extrabold text-2xl tracking-tight" style={{ color: theme.colors.accent }}>{displayValue}</p>
        </div>
      </GlassCard>
    </button>
  );
};

// InstallationDetail
const InstallationDetail = ({ project, theme, onAddPhotoFiles }) => {
  const fileRef = useRef(null);
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
      <div className="px-4 pt-6 pb-mobile-nav-safe space-y-4 overflow-y-auto scrollbar-hide">
        <GlassCard theme={theme} className="p-5 space-y-4" variant="elevated">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-xl truncate" style={{ color: theme.colors.textPrimary }}>{project.name}</p>
              <p className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>{project.location}</p>
            </div>
            <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-full text-xs font-semibold" style={{ backgroundColor: theme.colors.accent, color: '#fff' }}>Add Photos</button>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => onAddPhotoFiles(e.target.files)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(project.photos || [project.image]).map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg"><img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt={project.name + '-photo-' + i} className="w-full h-full object-cover" /></div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// Customer Card Component for Customers tab
const CustomerCard = ({ customer, theme, onClick }) => {
  const activeStandards = customer.standardsPrograms?.filter(p => p.status === 'Active').length || 0;
  const currentOrders = customer.orders?.current?.length || 0;

  return (
    <button onClick={onClick} className="w-full text-left group" style={{ WebkitTapHighlightColor: 'transparent' }}>
      <GlassCard theme={theme} className="p-0 overflow-hidden transition-all duration-200 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0" variant="elevated">
        <div className="relative aspect-video w-full">
          <img src={customer.image} alt={customer.name} className="absolute h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white tracking-tight mb-1">{customer.name}</h3>
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{customer.location.city}, {customer.location.state}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {activeStandards > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                  {activeStandards} Active
                </span>
              )}
              {currentOrders > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>
                  {currentOrders} Orders
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                {customer.vertical}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </button>
  );
};

// New Project/Customer Modal Component
const NewActionModal = ({ isOpen, onClose, theme, onNavigate, customers, onAddCustomer }) => {
  const { openModal, closeModal } = useModalState();
  const isDesktop = useIsDesktop();
  const isMobile = !isDesktop;

  useEffect(() => {
    if (isOpen) {
      openModal();
    } else {
      closeModal();
    }
    return () => closeModal();
  }, [isOpen, openModal, closeModal]);

  const [mode, setMode] = useState(null); // null, 'project', 'customer'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectVertical, setProjectVertical] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerStreet, setCustomerStreet] = useState('');
  const [customerVertical, setCustomerVertical] = useState('Corporate');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
        resetModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.location.city.toLowerCase().includes(q)
    );
  }, [customerSearch, customers]);

  const handleSubmitProject = () => {
    // In real app, create project and navigate
    onClose();
    onNavigate('new-lead');
  };

  const handleSubmitCustomerRequest = () => {
    // Create new customer and add to local data
    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: customerName.trim(),
      location: { city: customerCity.trim(), state: customerState.trim() },
      vertical: customerVertical,
      activeProjectIds: [],
      image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg',
      standardsPrograms: [],
      approvedMaterials: { laminates: [], metals: [], upholstery: [], woods: [], paintPlastic: [] },
      orders: { current: [], history: [] },
      installs: [],
      documents: [],
      contacts: []
    };

    // Callback to add customer to parent state
    if (onAddCustomer) {
      onAddCustomer(newCustomer);
    }

    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setMode(null);
      setSubmitted(false);
      setCustomerName('');
      setCustomerCity('');
      setCustomerState('');
      setCustomerStreet('');
      setCustomerVertical('Corporate');
      setCustomerNotes('');
    }, 1500);
  };

  const resetModal = () => {
    setMode(null);
    setSelectedCustomer(null);
    setCustomerSearch('');
    setProjectName('');
    setProjectVertical('');
  };

  if (!isOpen) return null;

  // Use portal to render at document body level for proper stacking
  return createPortal(
    <>
      {/* Full-screen dimming backdrop - COVERS HEADER (top: 0) */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity duration-300 pointer-events-auto backdrop-blur-[2px]"
        style={{
          zIndex: DESIGN_TOKENS.zIndex.overlay + 10,
          top: 0,
        }}
        onClick={() => { onClose(); resetModal(); }}
      />

      {/* Modal Container - Floating Island Style */}
      <div
        className="fixed inset-x-0 flex items-end sm:items-center justify-center pointer-events-none"
        style={{
          top: 0,
          bottom: 0,
          zIndex: DESIGN_TOKENS.zIndex.modal + 10,
          padding: !isDesktop ? '1rem' : '1.5rem',
          paddingBottom: !isDesktop ? 'calc(80px + env(safe-area-inset-bottom, 0px) + 16px)' : '1.5rem',
        }}
        onClick={() => { onClose(); resetModal(); }}
      >
        <div
          className="w-full sm:max-w-lg sm:mx-4 rounded-3xl overflow-hidden flex flex-col shadow-2xl pointer-events-auto transition-all duration-300 transform scale-100"
          style={{
            backgroundColor: theme.colors.background,
            maxHeight: !isDesktop
              ? 'calc(100vh - (80px + env(safe-area-inset-bottom, 0px) + 48px))'
              : '85vh',
            boxShadow: DESIGN_TOKENS.shadows.modal
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.colors.border }}>
            <div>
              <h2 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                {mode === null && '+ New'}
                {mode === 'project' && (selectedCustomer ? 'New Project' : 'Select Customer')}
                {mode === 'customer' && 'Request New Customer'}
              </h2>
              {mode === 'project' && selectedCustomer && (
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>for {selectedCustomer.name}</p>
              )}
            </div>
            <button onClick={() => { onClose(); resetModal(); }} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
              <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            {/* Initial Choice */}
            {mode === null && (
              <div className="space-y-3">
                <button
                  onClick={() => setMode('project')}
                  className="w-full p-4 rounded-2xl text-left flex items-center gap-4 transition-all hover:shadow-md"
                  style={{ backgroundColor: theme.colors.subtle }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.colors.accent + '20' }}>
                    <Briefcase className="w-6 h-6" style={{ color: theme.colors.accent }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>Create New Project</p>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>For an existing customer</p>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                </button>
                <button
                  onClick={() => setMode('customer')}
                  className="w-full p-4 rounded-2xl text-left flex items-center gap-4 transition-all hover:shadow-md"
                  style={{ backgroundColor: theme.colors.subtle }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.colors.accent + '20' }}>
                    <Building2 className="w-6 h-6" style={{ color: theme.colors.accent }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>Request New Customer</p>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Submit request to JSI rep team</p>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                </button>
              </div>
            )}

            {/* Project Flow - Step 1: Select Customer */}
            {mode === 'project' && !selectedCustomer && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                  <input
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Search customers..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: theme.colors.surface, border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                    autoFocus
                  />
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                  {filteredCustomers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className="w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all hover:shadow-sm"
                      style={{ backgroundColor: theme.colors.subtle }}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>{c.name}</p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{c.location.city}, {c.location.state}</p>
                      </div>
                      <ChevronRight className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                    </button>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No customers found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Project Flow - Step 2: Project Details */}
            {mode === 'project' && selectedCustomer && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>Project Name *</label>
                  <input
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="e.g., Lobby Refresh Phase 2"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: theme.colors.surface, border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>Vertical (Optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {VERTICALS.map(v => (
                      <button
                        key={v}
                        onClick={() => setProjectVertical(projectVertical === v ? '' : v)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{
                          backgroundColor: projectVertical === v ? theme.colors.accent : theme.colors.subtle,
                          color: projectVertical === v ? JSI_COLORS.white : theme.colors.textSecondary,
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleSubmitProject}
                  disabled={!projectName.trim()}
                  className="w-full py-3 rounded-full font-bold disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  style={{ backgroundColor: theme.colors.accent, color: JSI_COLORS.white }}
                >
                  <Plus className="w-4 h-4" />
                  Create Project
                </button>
              </div>
            )}

            {/* Customer Request Flow - Now adds directly to dataset */}
            {mode === 'customer' && (
              submitted ? (
                <div className="py-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#059669' }} />
                  <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>Customer Added!</p>
                  <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>You can now create projects for this customer.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>Customer Name *</label>
                    <input
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g., Acme Corporation"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: theme.colors.surface, border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>Street Address</label>
                    <input
                      value={customerStreet}
                      onChange={e => setCustomerStreet(e.target.value)}
                      placeholder="123 Main St"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: theme.colors.surface, border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>City</label>
                      <input
                        value={customerCity}
                        onChange={e => setCustomerCity(e.target.value)}
                        placeholder="City"
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: theme.colors.surface, border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>State</label>
                      <input
                        value={customerState}
                        onChange={e => setCustomerState(e.target.value)}
                        placeholder="State"
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: theme.colors.surface, border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>Vertical</label>
                    <div className="flex flex-wrap gap-2">
                      {['Corporate', 'Healthcare', 'HigherEd', 'Government', 'Hospitality', 'Other'].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setCustomerVertical(v)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                          style={{
                            backgroundColor: customerVertical === v ? theme.colors.accent : theme.colors.subtle,
                            color: customerVertical === v ? '#fff' : theme.colors.textSecondary,
                          }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>Notes</label>
                    <textarea
                      value={customerNotes}
                      onChange={e => setCustomerNotes(e.target.value)}
                      placeholder="Any additional information..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                      style={{ backgroundColor: theme.colors.surface, border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                    />
                  </div>
                  <button
                    onClick={handleSubmitCustomerRequest}
                    disabled={!customerName.trim()}
                    className="w-full py-3 rounded-full font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ backgroundColor: theme.colors.accent }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Customer
                  </button>
                </div>
              )
            )}
          </div>

          {/* Back button for sub-flows */}
          {mode !== null && !submitted && (
            <div className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
              <button
                onClick={() => {
                  if (mode === 'project' && selectedCustomer) {
                    setSelectedCustomer(null);
                  } else {
                    setMode(null);
                  }
                }}
                className="w-full py-2.5 rounded-full font-medium text-sm"
                style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary }}
              >
                Back
              </button>
            </div>
          )}

          {/* Safe area padding for iOS */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </>,
    document.body
  );
};

// Main ProjectsScreen
export const ProjectsScreen = forwardRef(({ onNavigate, theme, opportunities, setOpportunities, myProjects, setMyProjects, projectsInitialTab, clearProjectsInitialTab, projectsInitialProjectId, clearProjectsInitialProjectId }, ref) => {
  const initial = projectsInitialTab || 'pipeline';
  const [projectsTab, setProjectsTab] = useState(initial);
  const isDesktop = useIsDesktop();
  useEffect(() => { if (projectsInitialTab) clearProjectsInitialTab && clearProjectsInitialTab(); }, [projectsInitialTab, clearProjectsInitialTab]);
  const [selectedPipelineStage, setSelectedPipelineStage] = useState('Discovery');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  
  // Auto-select project if initial project ID is provided
  useEffect(() => {
    if (projectsInitialProjectId && opportunities && opportunities.length > 0) {
      const project = opportunities.find(opp => opp.id === projectsInitialProjectId);
      if (project && !selectedOpportunity) {
        setSelectedOpportunity(project);
        setProjectsTab('pipeline');
        // Set the pipeline stage to match the project's stage
        if (project.stage) {
          setSelectedPipelineStage(project.stage);
        }
        if (clearProjectsInitialProjectId) clearProjectsInitialProjectId();
      }
    }
  }, [projectsInitialProjectId, opportunities, selectedOpportunity, clearProjectsInitialProjectId]);
  const [selectedInstall, setSelectedInstall] = useState(null);
  const scrollContainerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [customerFilter, setCustomerFilter] = useState('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [localCustomers, setLocalCustomers] = useState(MOCK_CUSTOMERS);
  const [customDesignFirms, setCustomDesignFirms] = useState([]); // Track custom design firms added by user

  // Handler to add new customer
  const handleAddCustomer = useCallback((newCustomer) => {
    setLocalCustomers(prev => [newCustomer, ...prev]);
  }, []);

  // Handler to add new custom design firm to the suggestions list
  const handleAddCustomDesignFirm = useCallback((firmName) => {
    setCustomDesignFirms(prev => {
      if (prev.includes(firmName)) return prev;
      return [...prev, firmName];
    });
  }, []);

  useImperativeHandle(ref, () => ({ clearSelection: () => { let cleared = false; if (selectedOpportunity) { setSelectedOpportunity(null); cleared = true; } if (selectedInstall) { setSelectedInstall(null); cleared = true; } return cleared; } }));
  const handleScroll = useCallback(() => { if (scrollContainerRef.current) setIsScrolled(scrollContainerRef.current.scrollTop > 10); }, []);

  const filteredOpportunities = useMemo(() => (opportunities || []).filter(o => o.stage === selectedPipelineStage), [selectedPipelineStage, opportunities]);
  const stageTotals = useMemo(() => { const totalValue = filteredOpportunities.reduce((sum, o) => { const raw = typeof o.value === 'string' ? o.value.replace(/[^0-9.]/g, '') : o.value; const num = parseFloat(raw) || 0; return sum + num; }, 0); return { totalValue }; }, [filteredOpportunities]);
  const updateOpportunity = updated => setOpportunities(prev => prev.map(o => o.id === updated.id ? updated : o));
  const addInstallPhotos = files => { if (!files || !selectedInstall) return; const arr = Array.from(files); setMyProjects(prev => prev.map(p => p.id === selectedInstall.id ? { ...p, photos: [...(p.photos || []), ...arr] } : p)); setSelectedInstall(prev => prev ? { ...prev, photos: [...(prev.photos || []), ...arr] } : prev); };

  // Filter customers
  const filteredCustomers = useMemo(() => {
    let result = localCustomers;

    // Apply search
    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.location.city.toLowerCase().includes(q) ||
        c.location.state.toLowerCase().includes(q)
      );
    }

    // Apply filter
    if (customerFilter === 'active-standards') {
      result = result.filter(c => c.standardsPrograms?.some(p => p.status === 'Active'));
    } else if (customerFilter === 'current-orders') {
      result = result.filter(c => c.orders?.current?.length > 0);
    } else if (customerFilter === 'recently-installed') {
      result = result.filter(c => c.installs?.length > 0);
    }

    return result;
  }, [customerSearch, customerFilter, localCustomers]);

  // Desktop: center content, account for sidebar
  const contentMaxWidth = isDesktop ? 'max-w-4xl mx-auto w-full lg:pl-20' : '';

  const projectTabOptions = [
    { key: 'pipeline', label: 'Active Projects' },
    { key: 'customers', label: 'Customers' },
  ];

  const stageOptions = STAGES.map(stage => ({ key: stage, label: stage }));

  if (selectedOpportunity) return (
    <OpportunityDetail 
      opp={selectedOpportunity} 
      theme={theme} 
      onBack={() => setSelectedOpportunity(null)} 
      onUpdate={u => { updateOpportunity(u); setSelectedOpportunity(u); }}
      customDesignFirms={customDesignFirms}
      onAddCustomDesignFirm={handleAddCustomDesignFirm}
    />
  );
  if (selectedInstall) return <InstallationDetail project={selectedInstall} theme={theme} onAddPhotoFiles={addInstallPhotos} />;

  const header = (
    <div className="pt-4 lg:pt-6 pb-3 w-full">
      {/* Top row: Toggle + New Button - Improved layout */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {/* Premium Pill Tab Toggle - Inset style */}
        <div className="flex-1 max-w-md">
          <div className="inline-flex rounded-full p-1 shadow-inner" style={{ backgroundColor: theme.colors.stone || '#E3E0D8' }}>
            {projectTabOptions.map(opt => {
              const isActive = opt.key === projectsTab;
              return (
                <button
                  key={opt.key}
                  onClick={() => setProjectsTab(opt.key)}
                  className={`px-5 lg:px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${isActive ? 'shadow-md' : ''}`}
                  style={{
                    backgroundColor: isActive ? '#fff' : 'transparent',
                    color: isActive ? theme.colors.accent : theme.colors.textSecondary,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Premium + New Button - Better positioned */}
        <button
          onClick={() => {
            if (projectsTab === 'customers') {
              setShowNewModal(true);
            } else {
              onNavigate('new-lead');
            }
          }}
          className="h-11 px-5 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 flex-shrink-0"
          style={{
            backgroundColor: theme.colors.accent,
            color: '#fff',
            minWidth: '44px',
          }}
          aria-label={projectsTab === 'customers' ? 'Add new customer' : 'Create new project'}
        >
          <span className="text-lg leading-none">+</span>
          <span className="hidden sm:inline text-sm">New</span>
        </button>
      </div>

      {/* Stage Pipeline Filter for Projects */}
      {projectsTab === 'pipeline' && (
        <div className="mt-4 space-y-2">
          <FilterChips
            options={stageOptions}
            value={selectedPipelineStage}
            onChange={setSelectedPipelineStage}
            theme={theme}
            showArrows={false}
          />
          {/* Total display - discrete, underneath filter */}
          {filteredOpportunities.length > 0 && (
            <div className="flex items-center justify-end px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
                  {selectedPipelineStage} Total:
                </span>
                <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                  {fmtCurrency(stageTotals.totalValue)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search for Customers - Using StandardSearchBar, filters removed */}
      {projectsTab === 'customers' && (
        <div className="mt-4">
          <StandardSearchBar
            value={customerSearch}
            onChange={setCustomerSearch}
            placeholder="Search customers..."
            theme={theme}
            className="w-full"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScreenLayout
        theme={theme}
        header={header}
        maxWidth="wide"
        padding={true}
        paddingBottom="8rem"
      >
        {projectsTab === 'pipeline' && (
          filteredOpportunities.length ? (
            <div className={isDesktop ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
              {filteredOpportunities.map(opp => <ProjectCard key={opp.id} opp={opp} theme={theme} onClick={() => setSelectedOpportunity(opp)} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Briefcase className="w-14 h-14 mb-4" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
              <p className="text-center text-base font-semibold" style={{ color: theme.colors.textSecondary }}>No projects in {selectedPipelineStage}</p>
              <p className="text-center text-sm mt-1" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>Add a new project to get started</p>
            </div>
          )
        )}
        {projectsTab === 'customers' && (
          filteredCustomers.length ? (
            <div className={isDesktop ? 'grid grid-cols-2 gap-5' : 'space-y-3'}>
              {filteredCustomers.map(customer => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  theme={theme}
                  onClick={() => onNavigate(`customers/${customer.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="w-14 h-14 mb-4" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
              <p className="text-center text-base font-semibold" style={{ color: theme.colors.textSecondary }}>No customers found</p>
              <p className="text-center text-sm mt-1" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>Try a different search or filter</p>
            </div>
          )
        )}
      </ScreenLayout>

      {/* New Action Modal for Customers tab */}
      <NewActionModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        theme={theme}
        onNavigate={onNavigate}
        customers={localCustomers}
        onAddCustomer={handleAddCustomer}
      />
    </div>
  );
});

