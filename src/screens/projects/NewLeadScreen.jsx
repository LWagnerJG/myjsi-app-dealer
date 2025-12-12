import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Plus, Check } from 'lucide-react';
import { FormInput } from '../../components/forms/FormInput.jsx';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect.jsx';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch.jsx';
import { ProbabilitySlider } from '../../components/forms/ProbabilitySlider.jsx';
import { ToggleButtonGroup } from '../../components/common/ToggleButtonGroup.jsx';
import { FormSection, SettingsRow } from '../../components/forms/FormSections.jsx';
import { SpotlightMultiSelect } from '../../components/common/SpotlightMultiSelect.jsx';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';

// Import data from proper feature-based sources
import { 
    STAGES, 
    VERTICALS, 
    COMPETITORS, 
    DISCOUNT_OPTIONS, 
    PO_TIMEFRAMES 
} from './data.js';
import { LEAD_TIMES_DATA } from '../resources/lead-times/data.js';
import { JSI_LAMINATES, JSI_VENEERS, JSI_SERIES } from '../products/data.js';
import { FINISH_SAMPLES } from '../samples'; // re-exported by screens/samples/index.js
import { CONTRACTS_DATA } from '../resources/contracts/data.js';
import { CUSTOMER_DIRECTORY_DATA } from '../resources/customer-directory/data.js';
import { VisionOptions, KnoxOptions, WinkHoopzOptions } from './product-options.jsx';

// Enhanced Product Spotlight with debounced typeahead search
const ProductSpotlight = ({ selectedSeries, onAdd, available, theme }) => {
  const [open, setOpen] = useState(false); 
  const [q, setQ] = useState(''); 
  const [highlightIdx, setHighlightIdx] = useState(0);
  const anchorRef = useRef(null); 
  const menuRef = useRef(null); 
  const inputRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, ready: false });
  const [debouncedQ, setDebouncedQ] = useState('');
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 150);
    return () => clearTimeout(timer);
  }, [q]);
  
  const norm = s => s.toLowerCase();
  
  // Filter with fuzzy matching and highlight
  const filtered = useMemo(() => {
    if (!debouncedQ.trim()) return available.slice(0, 30);
    const searchTerm = norm(debouncedQ);
    return available
      .filter(s => norm(s).includes(searchTerm))
      .slice(0, 30);
  }, [available, debouncedQ]);
  
  // Reset highlight when results change
  useEffect(() => {
    setHighlightIdx(0);
  }, [filtered.length]);
  
  const computePos = useCallback(() => { 
    if (anchorRef.current) { 
      const r = anchorRef.current.getBoundingClientRect(); 
      setPos({ top: r.bottom + window.scrollY + 8, left: r.left + window.scrollX, width: r.width, ready: true }); 
    } 
  }, []);
  
  const openMenu = useCallback(() => { 
    computePos(); 
    setOpen(true); 
    setHighlightIdx(0);
  }, [computePos]);
  
  useEffect(() => { 
    if (open) computePos(); 
  }, [open, computePos]);
  
  // Close on outside click/scroll
  useEffect(() => { 
    const close = e => { 
      if (!anchorRef.current || !menuRef.current) return; 
      if (!anchorRef.current.contains(e.target) && !menuRef.current.contains(e.target)) setOpen(false); 
    }; 
    if (open) { 
      document.addEventListener('mousedown', close); 
      document.addEventListener('scroll', close, true); 
      window.addEventListener('resize', close);
    } 
    return () => { 
      document.removeEventListener('mousedown', close); 
      document.removeEventListener('scroll', close, true); 
      window.removeEventListener('resize', close); 
    }; 
  }, [open]);
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIdx(i => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIdx(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[highlightIdx]) {
          onAdd(filtered[highlightIdx]);
          setQ('');
          setOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
    }
  }, [open, filtered, highlightIdx, onAdd, openMenu]);
  
  // Highlight matched substring
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-bold" style={{ color: theme.colors.accent }}>{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  };
  
  return (
    <div className="w-full" ref={anchorRef}>
      <div 
        onClick={openMenu} 
        className="flex items-center gap-2 px-4 cursor-text" 
        style={{ height: 46, borderRadius: 24, background: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
      >
        <Search className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
        <input 
          ref={inputRef}
          value={q} 
          onChange={e => { setQ(e.target.value); if (!open) openMenu(); }} 
          onFocus={openMenu}
          onKeyDown={handleKeyDown}
          placeholder="Search products..." 
          className="flex-1 bg-transparent outline-none text-[14px]" 
          style={{ color: theme.colors.textPrimary }} 
        />
      </div>
      {open && createPortal(
        <div 
          ref={menuRef} 
          className="fixed rounded-2xl border shadow-2xl overflow-hidden" 
          style={{ 
            top: pos.top, 
            left: pos.left, 
            width: pos.width, 
            maxHeight: 360, 
            background: theme.colors.surface, 
            borderColor: theme.colors.border, 
            zIndex: DESIGN_TOKENS.zIndex.popover, 
            opacity: pos.ready ? 1 : 0 
          }}
        >
          <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: 360 }}>
            {filtered.length > 0 ? (
              filtered.map((s, idx) => {
                const isSelected = selectedSeries.includes(s);
                const isHighlighted = idx === highlightIdx;
                return (
                  <button 
                    key={s} 
                    type="button" 
                    onMouseDown={e => { 
                      e.preventDefault(); 
                      if (!isSelected) {
                        onAdd(s); 
                        setQ(''); 
                        setOpen(false); 
                      }
                    }}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition-colors ${isHighlighted ? 'bg-black/5' : ''}`}
                    style={{ 
                      color: isSelected ? theme.colors.textSecondary : theme.colors.textPrimary,
                      opacity: isSelected ? 0.6 : 1
                    }}
                    disabled={isSelected}
                  >
                    <span>{highlightMatch(s, debouncedQ)}</span>
                    {isSelected && <Check className="w-4 h-4" style={{ color: theme.colors.accent }} />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-sm text-center" style={{ color: theme.colors.textSecondary }}>
                No products found matching "{q}"
              </div>
            )}
          </div>
        </div>, 
        document.body
      )}
    </div>
  );
};

// Add global style for hidden scrollbar once
if(typeof document!=='undefined' && !document.getElementById('custom-scroll-hide-style')){ const st=document.createElement('style'); st.id='custom-scroll-hide-style'; st.innerHTML=`.custom-scroll-hide{scrollbar-width:none;} .custom-scroll-hide::-webkit-scrollbar{display:none;}`; document.head.appendChild(st);} 

export const NewLeadScreen = ({
    theme,
    onSuccess,
    designFirms,
    setDesignFirms,
    customerDirectory,
    newLeadData = {},
    onNewLeadChange,
    onNavigate,
}) => {
    // Get customer options from directory
    const customerOptions = useMemo(() => {
        return (customerDirectory || CUSTOMER_DIRECTORY_DATA || []).map(c => c.name);
    }, [customerDirectory]);

    // Get selected customer data to auto-populate vertical
    const selectedCustomerData = useMemo(() => {
        if (!newLeadData.customer) return null;
        return (customerDirectory || CUSTOMER_DIRECTORY_DATA || []).find(c => c.name === newLeadData.customer);
    }, [newLeadData.customer, customerDirectory]);

    const updateField = (field, value) => {
        // Auto-populate vertical from customer type when customer is selected
        if (field === 'customer' && value) {
            const customer = (customerDirectory || CUSTOMER_DIRECTORY_DATA || []).find(c => c.name === value);
            if (customer?.type && !newLeadData.vertical) {
                onNewLeadChange({ customer: value, vertical: customer.type });
                return;
            }
        }
        // Clear otherVertical when vertical changes away from "Other"
        if (field === 'vertical' && value !== 'Other (Please specify)') {
            onNewLeadChange({ [field]: value, otherVertical: '' });
        } else {
            onNewLeadChange({ [field]: value });
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newLeadData.projectStatus) {
            alert('Please select a Project Stage before submitting.');
            return;
        }
        if (!newLeadData.customer) {
            alert('Please select a Customer before submitting.');
            return;
        }
        onSuccess(newLeadData);
    };
    
    const toggleCompetitor = (c) => {
        const list = newLeadData.competitors || [];
        const next = list.includes(c) ? list.filter(x => x !== c) : [...list, c];
        updateField('competitors', next);
    };
    
    const addProduct = (series) => {
        if (!series) return;
        if ((newLeadData.products||[]).some(p=>p.series===series)) return;
        const newProducts = [...(newLeadData.products || []), { series, hasGlassDoors:false, materials:[], hasWoodBack:false, polyColor:'' }];
        updateField('products', newProducts);
    };
    
    const removeProduct = (idx) => {
        const newProducts = (newLeadData.products || []).filter((_, i) => i !== idx);
        updateField('products', newProducts);
    };
    
    const updateProductOption = (pi, key, value) => {
        const newProducts = (newLeadData.products || []).map((p, i) => i === pi ? { ...p, [key]: value } : p);
        updateField('products', newProducts);
    };
    
    const addDesignFirm = (firm) => {
        const currentFirms = newLeadData.designFirms || [];
        if (!currentFirms.includes(firm)) {
            updateField('designFirms', [...currentFirms, firm]);
        }
    };
    
    const removeDesignFirm = (firm) => {
        const currentFirms = newLeadData.designFirms || [];
        updateField('designFirms', currentFirms.filter(f => f !== firm));
    };
    
    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 lg:px-6 pt-4 space-y-6 max-w-3xl mx-auto w-full">
                <FormSection title="Project Details" theme={theme}>
                    <div>
                        <SettingsRow label="Project Name" isFirst={true} theme={theme}>
                            <div className="w-7/12">
                                <FormInput
                                    label=""
                                    required
                                    value={newLeadData.project || ''}
                                    onChange={e => updateField('project', e.target.value)}
                                    placeholder="Required"
                                    theme={theme}
                                    size="sm"
                                    surfaceBg={true}
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Customer" theme={theme}>
                            <div className="w-7/12 flex flex-col gap-2">
                                <PortalNativeSelect
                                    label=""
                                    required
                                    value={newLeadData.customer || ''}
                                    onChange={e => updateField('customer', e.target.value)}
                                    options={customerOptions.map(c => ({ label: c, value: c }))}
                                    placeholder="Select customer..."
                                    theme={theme}
                                />
                                <button
                                    type="button"
                                    onClick={() => onNavigate('resources/customer-directory')}
                                    className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full self-start transition-colors hover:bg-black/5"
                                    style={{ color: theme.colors.accent }}
                                >
                                    <Plus className="w-3 h-3" />
                                    Add New Customer
                                </button>
                                {selectedCustomerData && (
                                    <div className="p-2 rounded-lg text-xs animate-fade-in" style={{ backgroundColor: theme.colors.subtle }}>
                                        <div className="flex items-center gap-2">
                                            {selectedCustomerData.type && (
                                                <span className="px-2 py-0.5 rounded-full font-semibold text-[10px]" style={{ backgroundColor: `${theme.colors.accent}20`, color: theme.colors.accent }}>
                                                    {selectedCustomerData.type}
                                                </span>
                                            )}
                                            <span style={{ color: theme.colors.textSecondary }}>{selectedCustomerData.address}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Project Stage" theme={theme}>
                            <div className="w-7/12">
                                <PortalNativeSelect
                                    label=""
                                    required
                                    value={newLeadData.projectStatus || ''}
                                    onChange={e => updateField('projectStatus', e.target.value)}
                                    options={STAGES.map(s => ({ label: s, value: s }))}
                                    placeholder="Select..."
                                    theme={theme}
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Vertical" theme={theme}>
                            <div className="w-7/12 relative">
                                {newLeadData.vertical === 'Other (Please specify)' ? (
                                    <div className="flex items-center space-x-3 transition-all duration-300 ease-in-out">
                                        <div className="flex items-center space-x-2 animate-slide-in-left">
                                            <span
                                                className="text-sm font-medium px-3 py-2 rounded-lg border transition-all duration-300"
                                                style={{
                                                    backgroundColor: theme.colors.subtle,
                                                    borderColor: theme.colors.border,
                                                    color: theme.colors.textPrimary
                                                }}
                                            >
                                                Other
                                            </span>
                                        </div>
                                        <div className="flex-1 animate-fade-in">
                                            <FormInput
                                                label=""
                                                required
                                                value={newLeadData.otherVertical || ''}
                                                onChange={e => updateField('otherVertical', e.target.value)}
                                                placeholder="Specify other vertical..."
                                                theme={theme}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="transition-all duration-300 ease-in-out">
                                        <PortalNativeSelect
                                            label=""
                                            required
                                            value={newLeadData.vertical || ''}
                                            onChange={e => updateField('vertical', e.target.value)}
                                            options={VERTICALS.map(v => ({ label: v, value: v }))}
                                            placeholder="Select..."
                                            theme={theme}
                                        />
                                    </div>
                                )}
                            </div>
                        </SettingsRow>
                    </div>
                </FormSection>
                
                <FormSection title="Stakeholders" theme={theme}>
                    <div>
                        <SettingsRow label="A&D Firm" isFirst={true} theme={theme}>
                            <div className="w-7/12">
                                <SpotlightMultiSelect
                                    selectedItems={newLeadData.designFirms || []}
                                    onAddItem={addDesignFirm}
                                    onRemoveItem={removeDesignFirm}
                                    options={designFirms || []}
                                    onAddNew={(f) => setDesignFirms((p) => [...new Set([f, ...p])])}
                                    placeholder="Search..."
                                    theme={theme}
                                />
                            </div>
                        </SettingsRow>
                    </div>
                </FormSection>
                
                <FormSection title="Competition & Products" theme={theme}>
                    <div>
                        <SettingsRow label="Bid?" isFirst={true} theme={theme}>
                            <ToggleSwitch
                                checked={!!newLeadData.isBid}
                                onChange={e => updateField('isBid', e.target.checked)}
                                theme={theme}
                            />
                        </SettingsRow>
                        <SettingsRow label="Competition?" theme={theme}>
                            <div className="w-full flex justify-end">
                                <div className="w-7/12 h-10 flex items-center justify-end">
                                    <ToggleSwitch
                                        checked={!!newLeadData.competitionPresent}
                                        onChange={(e) => updateField('competitionPresent', e.target.checked)}
                                        theme={theme}
                                    />
                                </div>
                            </div>
                        </SettingsRow>

                        <div className="-mx-4">
                            <div className="px-4">
                                <div className={`rounded-2xl transition-all duration-400 ease-out overflow-hidden ${newLeadData.competitionPresent? 'p-3 opacity-100 max-h-[600px] translate-y-0':'p-0 opacity-0 max-h-0 -translate-y-1 pointer-events-none'}`} style={{ backgroundColor: theme.colors.subtle }}>
                                    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))' }}>
                                        {COMPETITORS.filter(c=>c!=='None').map(c=>{ const on=(newLeadData.competitors||[]).includes(c); return (
                                            <button key={c} type="button" onClick={()=>toggleCompetitor(c)} className="px-3 py-1.5 text-[13px] rounded-full font-medium transition-colors border text-center whitespace-nowrap" style={{ backgroundColor: on? theme.colors.accent: theme.colors.surface, color: on? theme.colors.surface: theme.colors.textPrimary, borderColor: on? theme.colors.accent: theme.colors.border }}>{c}</button>
                                        );})}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6" />
                    <SettingsRow label="Products" theme={theme}>
                        <div className="w-7/12">
                            <ProductSpotlight
                              selectedSeries={(newLeadData.products||[]).map(p=>p.series)}
                              onAdd={addProduct}
                              available={JSI_SERIES}
                              theme={theme}
                            />
                        </div>
                    </SettingsRow>
                    {(newLeadData.products || []).length > 0 && (
                        <div className="space-y-3 pt-2">
                            {(newLeadData.products || []).map((p, idx) => {
                                const hasOptions = ['Vision', 'Knox', 'Wink', 'Hoopz'].includes(p.series);
                                const itemStyle = hasOptions ? 'p-3 border rounded-2xl' : 'p-2 pl-4 border rounded-full';
                                return (
                                    <div key={idx} className={`${itemStyle} space-y-2`} style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{p.series}</span>
                                            <button type="button" onClick={()=>removeProduct(idx)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors hover:bg-red-500/10 border" style={{ borderColor: theme.colors.border, color:'#dc2626' }}>
                                                <X className="w-4 h-4" /> Remove
                                            </button>
                                        </div>
                                        {hasOptions && (
                                            <div className="animate-fade-in pr-2">
                                                {p.series === 'Vision' && (<VisionOptions theme={theme} product={p} productIndex={idx} onUpdate={updateProductOption} />)}
                                                {p.series === 'Knox' && (<KnoxOptions theme={theme} product={p} productIndex={idx} onUpdate={updateProductOption} />)}
                                                {(p.series === 'Wink' || p.series === 'Hoopz') && (<WinkHoopzOptions theme={theme} product={p} productIndex={idx} onUpdate={updateProductOption} />)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </FormSection>
                
                <FormSection title="Financials & Timeline" theme={theme}>
                    <div>
                        <SettingsRow label="Estimated List" isFirst={true} theme={theme}>
                            <div className="w-7/12">
                                <FormInput
                                    label=""
                                    required
                                    type="currency"
                                    surfaceBg={true}
                                    value={newLeadData.estimatedList || ''}
                                    onChange={e => updateField('estimatedList', e.target.value)}
                                    placeholder="$0"
                                    theme={theme}
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Win Probability" theme={theme}>
                            <div className="w-7/12">
                                <ProbabilitySlider
                                    showLabel={false}
                                    value={newLeadData.winProbability || 50}
                                    onChange={v => updateField('winProbability', v)}
                                    theme={theme}
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Discount" theme={theme}>
                            <div className="w-7/12">
                                <PortalNativeSelect
                                    label=""
                                    value={newLeadData.discount || '50/20 (60.00%)'}
                                    onChange={e => updateField('discount', e.target.value)}
                                    options={DISCOUNT_OPTIONS.map(d => ({ label: d, value: d }))}
                                    placeholder="Select..."
                                    theme={theme}
                                    mutedValues={["Undecided"]}
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="PO Timeframe" theme={theme}>
                            <div className="w-7/12 relative">
                                <PortalNativeSelect
                                    label=""
                                    required
                                    value={newLeadData.poTimeframe || ''}
                                    onChange={e => updateField('poTimeframe', e.target.value)}
                                    options={PO_TIMEFRAMES.map(t => ({ label: t, value: t }))}
                                    placeholder="Select..."
                                    theme={theme}
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Contract?" theme={theme}>
                            <div className="w-7/12 relative">
                                <PortalNativeSelect
                                    label=""
                                    value={newLeadData.contractType || ''}
                                    onChange={e => updateField('contractType', e.target.value)}
                                    options={[

                                        { label: 'None', value: '' },
                                        ...Object.keys(CONTRACTS_DATA).map(key => ({ label: CONTRACTS_DATA[key].name, value: key }))
                                    ]}
                                    placeholder="Select..."
                                    theme={theme}
                                    mutedValues={["", "None"]}
                                />
                            </div>
                        </SettingsRow>
                    </div>
                </FormSection>

                <FormSection title="Notes" theme={theme}>
                    <div className="pt-2">
                        <FormInput
                            label=""
                            type="textarea"
                            surfaceBg={true}
                            value={newLeadData.notes || ''}
                            onChange={e => updateField('notes', e.target.value)}
                            placeholder="Enter any further details..."
                            theme={theme}
                        />
                    </div>
                </FormSection>
                {/* Submit Button - Inline at bottom of form */}
                <div className="pt-4 pb-32 lg:pb-8">
                    <button
                        type="submit"
                        className="w-full text-white font-bold py-3.5 rounded-full shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        Submit Lead
                    </button>
                </div>
            </div>
        </form>
    );
};