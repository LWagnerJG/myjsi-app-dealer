import React, { useState, useMemo, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Briefcase, ArrowRight, Users, Building2, MapPin, Shield, Package, X, Search, ChevronRight, Plus, FileText, Send, CheckCircle } from 'lucide-react';
import { STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS, PO_TIMEFRAMES, INITIAL_DESIGN_FIRMS } from './data.js';
import { ProbabilitySlider } from '../../components/forms/ProbabilitySlider.jsx';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch.jsx';
import { TabToggle, FilterChips } from '../../design-system/SegmentedToggle.jsx';
import { JSI_SERIES } from '../products/data.js';
import { useIsDesktop } from '../../hooks/useResponsive.js';
import { MOCK_CUSTOMERS, STATUS_COLORS, CUSTOMER_FILTER_OPTIONS } from '../../data/mockCustomers.js';

// currency util
const fmtCurrency = (v) => typeof v === 'string' ? (v.startsWith('$')? v : '$'+v) : (v ?? 0).toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});

// Suggest input pill (inline tag adder w/ suggestions)
const SuggestInputPill = ({ placeholder, suggestions, onAdd, theme }) => {
  const [q,setQ]=useState(''); const [open,setOpen]=useState(false); const ref=useRef(null); const menu=useRef(null);
  const filtered = useMemo(()=> suggestions.filter(s=> s.toLowerCase().includes(q.toLowerCase()) && s.toLowerCase()!==q.toLowerCase()).slice(0,12),[q,suggestions]);
  useEffect(()=>{ if(!open) return; const close=e=>{ if(ref.current && !ref.current.contains(e.target) && menu.current && !menu.current.contains(e.target)) setOpen(false); }; window.addEventListener('mousedown',close); return ()=>window.removeEventListener('mousedown',close); },[open]);
  const commit = (val)=>{ if(val){ onAdd(val); setQ(''); } setOpen(false); };
  return <div className="relative" ref={ref} style={{ minWidth:140 }}>
    <input value={q} onChange={e=>{ setQ(e.target.value); setOpen(true); }} onFocus={()=>setOpen(true)} onKeyDown={e=>{ if(e.key==='Enter'){ commit(q.trim()); } if(e.key==='Escape'){ setOpen(false);} }} placeholder={placeholder} className="h-8 px-3 rounded-full text-xs font-medium outline-none border w-full" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }} />
    {open && filtered.length>0 && (
      <div ref={menu} className="absolute z-50 mt-1 rounded-xl border shadow-lg overflow-hidden" style={{ background: theme.colors.surface, borderColor: theme.colors.border, maxHeight:220, width:'100%' }}>
        <div className="overflow-y-auto" style={{ maxHeight:220 }}>
          {filtered.map(s=> <button key={s} onClick={()=>commit(s)} className="w-full text-left px-3 py-2 text-xs hover:bg-black/5" style={{ color: theme.colors.textPrimary }}>{s}</button>)}
        </div>
      </div>
    )}
  </div>;
};

// Helper label / inputs
const SoftLabel = ({ children, theme }) => <span className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: theme.colors.textSecondary }}>{children}</span>;
const InlineTextInput = ({ value, onChange, theme, placeholder, className='' }) => (
  <input value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className={`bg-transparent outline-none border-b border-transparent focus:border-[currentColor] transition-colors ${className}`} style={{ color: theme.colors.textPrimary }} />
);
const CurrencyInput = ({ value, onChange, theme }) => {
  const raw = (''+(value||'')).replace(/[^0-9]/g,'');
  return <input inputMode="numeric" value={raw} onChange={e=>{ const val=e.target.value.replace(/[^0-9]/g,''); onChange(val? ('$'+parseInt(val,10).toLocaleString()):''); }} className="bg-transparent outline-none px-0 py-1 text-sm font-semibold border-b border-transparent focus:border-[currentColor] w-32" style={{ color: theme.colors.textPrimary }} />;
};

// Opportunity Detail
const OpportunityDetail = ({ opp, theme, onBack, onUpdate }) => {
  const [draft,setDraft]=useState(opp); const dirty=useRef(false); const saveRef=useRef(null);
  useEffect(()=>{ setDraft(opp); },[opp.id]);
  const update=(k,v)=> setDraft(p=>{ const n={...p,[k]:v}; dirty.current= true; return n; });
  useEffect(()=>{ if(!dirty.current) return; clearTimeout(saveRef.current); saveRef.current=setTimeout(()=>{ onUpdate(draft); dirty.current=false; },500); return ()=>clearTimeout(saveRef.current); },[draft,onUpdate]);

  const [discountOpen,setDiscountOpen]=useState(false); const discBtn=useRef(null); const discMenu=useRef(null); const [discPos,setDiscPos]=useState({top:0,left:0,width:0});
  const openDiscount=()=>{ if(discBtn.current){ const r=discBtn.current.getBoundingClientRect(); setDiscPos({ top:r.bottom+8+window.scrollY, left:r.left+window.scrollX, width:r.width }); } setDiscountOpen(true); };
  useEffect(()=>{ if(!discountOpen) return; const handler=e=>{ if(discMenu.current && !discMenu.current.contains(e.target) && !discBtn.current.contains(e.target)) setDiscountOpen(false); }; window.addEventListener('mousedown',handler); window.addEventListener('resize',()=>setDiscountOpen(false)); return ()=>window.removeEventListener('mousedown',handler); },[discountOpen]);

  const removeFrom=(key,val)=> update(key,(draft[key]||[]).filter(x=>x!==val));
  const addUnique=(key,val)=>{ if(!val) return; const list=draft[key]||[]; if(!list.includes(val)) update(key,[...list,val]); };
  const addProductSeries = (series)=>{ if(!series) return; const list=draft.products||[]; if(!list.some(p=>p.series===series)) update('products',[...list,{series}]); };
  const removeProductSeries = (series)=> update('products',(draft.products||[]).filter(p=>p.series!==series));

  return (
    <div className="flex flex-col h-full" style={{ background: theme.colors.background }}>
      <div className="px-4 pt-5 pb-40 overflow-y-auto scrollbar-hide">
        <GlassCard theme={theme} className="p-6 rounded-3xl space-y-8" variant="elevated">
          <div className="space-y-1">
            <InlineTextInput value={draft.project||draft.name} onChange={v=>update('project',v)} theme={theme} className="text-[20px] leading-tight" />
            <InlineTextInput value={draft.company} onChange={v=>update('company',v)} theme={theme} placeholder="Company" className="text-sm font-medium opacity-80" />
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <SoftLabel theme={theme}>Stage</SoftLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {STAGES.map(s=>{ const active=s===draft.stage; return <button key={s} onClick={()=>update('stage',s)} className="px-3 h-8 rounded-full text-[11px] font-medium border transition-colors" style={{ backgroundColor: active? theme.colors.accent: theme.colors.surface, color: active? '#fff': theme.colors.textPrimary, borderColor: active? theme.colors.accent: theme.colors.border }}>{s}</button>; })}
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-8">
              <div className="flex flex-col gap-2">
                <SoftLabel theme={theme}>Discount</SoftLabel>
                <button ref={discBtn} onClick={()=>discountOpen? setDiscountOpen(false):openDiscount()} className="px-4 h-9 rounded-full text-xs font-semibold border shadow-sm flex items-center gap-2" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary, borderColor: theme.colors.border }}>{draft.discount || 'Undecided'} <span className={`transition-transform ${discountOpen?'rotate-180':''}`}>?</span></button>
              </div>
              <div className="flex flex-col gap-2 min-w-[220px]">
                <SoftLabel theme={theme}>Vertical</SoftLabel>
                <div className="flex flex-wrap gap-2 max-w-[380px]">
                  {VERTICALS.map(v=>{ const a=v===draft.vertical; return <button key={v} onClick={()=>update('vertical',v)} className="px-3 h-8 rounded-full text-[11px] font-medium border transition-colors" style={{ backgroundColor:a? theme.colors.accent:theme.colors.surface, color:a? '#fff': theme.colors.textPrimary, borderColor:a? theme.colors.accent: theme.colors.border }}>{v}</button>; })}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <SoftLabel theme={theme}>PO Timeframe</SoftLabel>
                <div className="flex flex-wrap gap-2 max-w-[360px]">
                  {PO_TIMEFRAMES.map(t=>{ const a=t===draft.poTimeframe; return <button key={t} onClick={()=>update('poTimeframe',t)} className="px-3 h-8 rounded-full text-[11px] font-medium border transition-colors" style={{ backgroundColor:a? theme.colors.accent:theme.colors.surface, color:a? '#fff': theme.colors.textPrimary, borderColor:a? theme.colors.accent: theme.colors.border }}>{t}</button>; })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="px-3 h-8 flex items-center gap-1 rounded-full border text-[11px] font-semibold" style={{ background: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>$ {draft.value?.toString().replace(/[^0-9]/g,'') || '0'}</div>
            <div className="px-3 h-8 flex items-center gap-1 rounded-full border text-[11px] font-semibold" style={{ background: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>Win {draft.winProbability||0}%</div>
            <div className="px-3 h-8 flex items-center gap-1 rounded-full border text-[11px] font-semibold" style={{ background: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>{draft.discount||'Undecided'}</div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <SoftLabel theme={theme}>Win Probability</SoftLabel>
                <ProbabilitySlider value={draft.winProbability||0} onChange={v=>update('winProbability',v)} theme={theme} />
              </div>
              <div className="flex items-center gap-4">
                <SoftLabel theme={theme}>Competition?</SoftLabel>
                <ToggleSwitch checked={!!draft.competitionPresent} onChange={v=>update('competitionPresent',v)} theme={theme} />
              </div>
              {draft.competitionPresent && (
                <div className="pt-2">
                  <SoftLabel theme={theme}>Competitors</SoftLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COMPETITORS.filter(c=>c!=='None').map(c=>{ const on=(draft.competitors||[]).includes(c); return (
                      <button key={c} onClick={()=>{ const list=draft.competitors||[]; update('competitors', on? list.filter(x=>x!==c): [...list,c]); }} className="px-3 h-8 rounded-full text-[11px] font-medium border transition-colors" style={{ backgroundColor:on? theme.colors.accent: theme.colors.surface, color:on? '#fff': theme.colors.textPrimary, borderColor:on? theme.colors.accent: theme.colors.border }}>{c}</button>
                    );})}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-1"><SoftLabel theme={theme}>Contact</SoftLabel><InlineTextInput value={draft.contact} onChange={v=>update('contact',v)} theme={theme} placeholder="Contact" /></div>
                <div className="flex flex-col gap-1"><SoftLabel theme={theme}>Value</SoftLabel><CurrencyInput value={draft.value} onChange={v=>update('value',v)} theme={theme} /></div>
              </div>
              <div>
                <SoftLabel theme={theme}>Products</SoftLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(draft.products||[]).map(p=> <button key={p.series} onClick={()=>removeProductSeries(p.series)} className="px-3 h-8 rounded-full text-[11px] font-medium flex items-center gap-1 border" style={{ background: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>{p.series}<span className="opacity-60">×</span></button>)}
                  <SuggestInputPill placeholder="Add series" suggestions={JSI_SERIES} onAdd={addProductSeries} theme={theme} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <SoftLabel theme={theme}>Design Firms</SoftLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(draft.designFirms||[]).map(f=> <button key={f} onClick={()=>removeFrom('designFirms',f)} className="px-3 h-8 rounded-full text-[11px] font-medium flex items-center gap-1 border" style={{ background: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>{f}<span className="opacity-60">×</span></button>)}
                    <SuggestInputPill placeholder="Add firm" suggestions={INITIAL_DESIGN_FIRMS} onAdd={v=>addUnique('designFirms',v)} theme={theme} />
                  </div>
                </div>
                <div>
                  <SoftLabel theme={theme}>Customer</SoftLabel>
                  <div className="flex flex-col gap-1">
                    <InlineTextInput value={draft.customer||draft.company} onChange={v=>{ update('customer',v); update('company',v); }} theme={theme} placeholder="Customer name" className="text-sm font-medium" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SoftLabel theme={theme}>Notes</SoftLabel>
            <textarea value={draft.notes||''} onChange={e=>update('notes',e.target.value)} rows={4} className="w-full mt-2 resize-none rounded-xl p-3 text-sm outline-none border" style={{ background: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }} placeholder="Add project notes..." />
            {Array.isArray(draft.quotes)&&draft.quotes.length>0 && (
              <div className="mt-4 space-y-2">
                <SoftLabel theme={theme}>Quotes</SoftLabel>
                <div className="flex flex-col gap-2">
                  {draft.quotes.map(q=> <a key={q.id} href={q.url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg text-xs font-medium border hover:bg-black/5 transition-colors" style={{ color: theme.colors.textPrimary, borderColor: theme.colors.border }}>{q.fileName}</a>)}
                </div>
              </div>
            )}
          </div>
          <p className="text-[11px] italic opacity-70" style={{ color: theme.colors.textSecondary }}>Autosaved</p>
        </GlassCard>
      </div>
      {discountOpen && (
        <div ref={discMenu} className="fixed z-[9999] rounded-2xl border shadow-2xl overflow-hidden" style={{ top:discPos.top, left:discPos.left, width:discPos.width, background:theme.colors.surface, borderColor:theme.colors.border }}>
          <div className="max-h-[360px] overflow-y-auto custom-scroll-hide py-1">
            {DISCOUNT_OPTIONS.map(opt=> <button key={opt} onClick={()=>{ update('discount',opt); setDiscountOpen(false); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-black/5 ${opt===draft.discount?'font-semibold':''}`} style={{ color: theme.colors.textPrimary }}>{opt}</button>)}
          </div>
        </div>
      )}
    </div>
  );
};

// Project card component
const ProjectCard = ({ opp, theme, onClick }) => {
  const discountPct = typeof opp.discount === 'string' ? opp.discount : typeof opp.discount === 'number' ? opp.discount+'%' : null;
  let displayValue = opp.value;
  if (displayValue != null) {
    if (typeof displayValue === 'number') displayValue = '$' + displayValue.toLocaleString();
    else if (typeof displayValue === 'string' && !displayValue.trim().startsWith('$')) {
      const num = parseFloat(displayValue.replace(/[^0-9.]/g,'')); if(!isNaN(num)) displayValue = '$'+num.toLocaleString();
    }
  }
  return (
    <button onClick={onClick} className="w-full text-left group" style={{ WebkitTapHighlightColor:'transparent' }}>
      <GlassCard theme={theme} className="p-5 transition-all duration-200 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0" variant="elevated">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-[15px] leading-snug truncate" style={{ color: theme.colors.textPrimary }}>{opp.name}</p>
            <p className="mt-1 text-[13px] font-medium leading-tight truncate" style={{ color: theme.colors.textSecondary }}>{opp.company||'Unknown'}</p>
          </div>
          {discountPct && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary, border:`1px solid ${theme.colors.border}` }}>{discountPct}</span>}
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
      <div className="px-4 pt-6 pb-32 space-y-4 overflow-y-auto scrollbar-hide">
        <GlassCard theme={theme} className="p-5 space-y-4" variant="elevated">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-xl truncate" style={{ color: theme.colors.textPrimary }}>{project.name}</p>
              <p className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>{project.location}</p>
            </div>
            <button type="button" onClick={()=>fileRef.current?.click()} className="px-4 py-2 rounded-full text-xs font-semibold" style={{ backgroundColor: theme.colors.accent, color:'#fff' }}>Add Photos</button>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e=>onAddPhotoFiles(e.target.files)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(project.photos || [project.image]).map((img,i)=>(
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg"><img src={typeof img==='string'?img:URL.createObjectURL(img)} alt={project.name+'-photo-'+i} className="w-full h-full object-cover" /></div>
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
const NewActionModal = ({ isOpen, onClose, theme, onNavigate, customers }) => {
  const [mode, setMode] = useState(null); // null, 'project', 'customer'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectVertical, setProjectVertical] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setMode(null);
      setSubmitted(false);
      setCustomerName('');
      setCustomerCity('');
      setCustomerState('');
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

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => { onClose(); resetModal(); }}>
      <div 
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: theme.colors.background }}
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
        <div className="flex-1 overflow-y-auto p-4">
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
                />
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
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
                        color: projectVertical === v ? '#fff' : theme.colors.textSecondary,
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
                className="w-full py-3 rounded-full font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                style={{ backgroundColor: theme.colors.accent }}
              >
                <Plus className="w-4 h-4" />
                Create Project
              </button>
            </div>
          )}

          {/* Customer Request Flow */}
          {mode === 'customer' && (
            submitted ? (
              <div className="py-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#059669' }} />
                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>Request Sent!</p>
                <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>Your JSI rep team will review your request.</p>
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
                  <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>Notes</label>
                  <textarea
                    value={customerNotes}
                    onChange={e => setCustomerNotes(e.target.value)}
                    placeholder="Any additional information..."
                    rows={3}
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
                  <Send className="w-4 h-4" />
                  Submit Request
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
      </div>
    </div>
  );
};

// Main ProjectsScreen
export const ProjectsScreen = forwardRef(({ onNavigate, theme, opportunities, setOpportunities, myProjects, setMyProjects, projectsInitialTab, clearProjectsInitialTab }, ref) => {
  const initial = projectsInitialTab || 'pipeline';
  const [projectsTab, setProjectsTab] = useState(initial);
  const isDesktop = useIsDesktop();
  useEffect(()=>{ if(projectsInitialTab) clearProjectsInitialTab && clearProjectsInitialTab(); },[projectsInitialTab, clearProjectsInitialTab]);
  const [selectedPipelineStage,setSelectedPipelineStage] = useState('Discovery');
  const [selectedOpportunity,setSelectedOpportunity] = useState(null);
  const [selectedInstall,setSelectedInstall] = useState(null);
  const scrollContainerRef = useRef(null);
  const [isScrolled,setIsScrolled]=useState(false);
  const [customerFilter, setCustomerFilter] = useState('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  useImperativeHandle(ref,()=>({ clearSelection:()=>{ let cleared=false; if(selectedOpportunity){ setSelectedOpportunity(null); cleared=true;} if(selectedInstall){ setSelectedInstall(null); cleared=true;} return cleared; } }));
  const handleScroll = useCallback(()=>{ if(scrollContainerRef.current) setIsScrolled(scrollContainerRef.current.scrollTop>10); },[]);

  const filteredOpportunities = useMemo(()=> (opportunities||[]).filter(o=>o.stage===selectedPipelineStage),[selectedPipelineStage, opportunities]);
  const stageTotals = useMemo(()=>{ const totalValue = filteredOpportunities.reduce((sum,o)=>{ const raw= typeof o.value==='string'? o.value.replace(/[^0-9.]/g,''): o.value; const num=parseFloat(raw)||0; return sum+num; },0); return { totalValue }; },[filteredOpportunities]);
  const updateOpportunity = updated => setOpportunities(prev=> prev.map(o=> o.id===updated.id? updated:o));
  const addInstallPhotos = files => { if(!files||!selectedInstall) return; const arr=Array.from(files); setMyProjects(prev=> prev.map(p=> p.id===selectedInstall.id? {...p, photos:[...(p.photos||[]), ...arr]}:p)); setSelectedInstall(prev=> prev? {...prev, photos:[...(prev.photos||[]), ...arr]}: prev); };
  
  // Filter customers
  const filteredCustomers = useMemo(() => {
    let result = MOCK_CUSTOMERS;
    
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
  }, [customerSearch, customerFilter]);
  
  // Desktop: center content, account for sidebar
  const contentMaxWidth = isDesktop ? 'max-w-4xl mx-auto w-full lg:pl-20' : '';
  
  const projectTabOptions = [
    { key: 'pipeline', label: 'Active Projects' },
    { key: 'customers', label: 'Customers' },
  ];
  
  const stageOptions = STAGES.map(stage => ({ key: stage, label: stage }));
  
  if(selectedOpportunity) return <OpportunityDetail opp={selectedOpportunity} theme={theme} onBack={()=>setSelectedOpportunity(null)} onUpdate={u=>{ updateOpportunity(u); setSelectedOpportunity(u); }} />;
  if(selectedInstall) return <InstallationDetail project={selectedInstall} theme={theme} onAddPhotoFiles={addInstallPhotos} />;
  
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
      {/* Premium Header */}
      <div className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`} style={{ backgroundColor: isScrolled ? `${theme.colors.background}f5` : theme.colors.background, backdropFilter: isScrolled ? 'blur(16px)' : 'none', WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none' }}>
        <div className={`px-4 lg:px-6 pt-4 lg:pt-6 pb-3 ${contentMaxWidth}`}>
          {/* Top row: Toggle + New Button */}
          <div className="flex items-center gap-3">
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
            
            {/* Premium + New Button - Opens modal for Customers, direct nav for Projects */}
            <button 
              onClick={() => {
                if (projectsTab === 'customers') {
                  setShowNewModal(true);
                } else {
                  onNavigate('new-lead');
                }
              }} 
              className="h-11 px-6 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2"
              style={{ 
                backgroundColor: theme.colors.accent, 
                color: '#fff',
              }}
            >
              <span className="text-lg leading-none">+</span>
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
          
          {/* Stage Pipeline Filter for Projects */}
          {projectsTab === 'pipeline' && (
            <div className="mt-4">
              <FilterChips
                options={stageOptions}
                value={selectedPipelineStage}
                onChange={setSelectedPipelineStage}
                theme={theme}
                showArrows={true}
              />
            </div>
          )}
          
          {/* Search and Filters for Customers */}
          {projectsTab === 'customers' && (
            <div className="mt-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                <input
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  placeholder="Search customers..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm outline-none"
                  style={{ backgroundColor: theme.colors.surface, border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                />
              </div>
              <FilterChips
                options={CUSTOMER_FILTER_OPTIONS}
                value={customerFilter}
                onChange={setCustomerFilter}
                theme={theme}
                showArrows={false}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Content Area */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-hide">
        <div className={`px-4 lg:px-6 pt-4 space-y-3 ${contentMaxWidth}`} style={{ paddingBottom: projectsTab === 'pipeline' ? '180px' : '120px' }}>
          {projectsTab==='pipeline' && (
            filteredOpportunities.length ? (
              <div className={isDesktop ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
                {filteredOpportunities.map(opp=> <ProjectCard key={opp.id} opp={opp} theme={theme} onClick={()=>setSelectedOpportunity(opp)} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Briefcase className="w-14 h-14 mb-4" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                <p className="text-center text-base font-semibold" style={{ color: theme.colors.textSecondary }}>No projects in {selectedPipelineStage}</p>
                <p className="text-center text-sm mt-1" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>Add a new project to get started</p>
              </div>
            )
          )}
          {projectsTab==='customers' && (
            filteredCustomers.length ? (
              <div className={isDesktop ? 'grid grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
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
        </div>
      </div>
      
      {/* Total Footer - Only for pipeline tab */}
      {projectsTab==='pipeline' && (
        <div 
          className={`${isDesktop ? 'absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full shadow-2xl max-w-md w-[calc(100%-3rem)]' : 'fixed bottom-20 left-4 right-4 rounded-full shadow-2xl'}`}
          style={{ 
            background: 'linear-gradient(135deg, rgba(53,53,53,0.95) 0%, rgba(74,69,67,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 25,
          }}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white/70">
                {selectedPipelineStage} Total
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              {fmtCurrency(stageTotals.totalValue)}
            </div>
          </div>
        </div>
      )}
      
      {/* New Action Modal for Customers tab */}
      <NewActionModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        theme={theme}
        onNavigate={onNavigate}
        customers={MOCK_CUSTOMERS}
      />
    </div>
  );
});

