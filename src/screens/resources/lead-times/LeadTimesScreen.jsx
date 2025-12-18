import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Zap, Timer, Filter, Check, X } from 'lucide-react';
import { LEAD_TIMES_DATA } from './data.js';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { ScreenLayout } from '../../../design-system/ScreenLayout.jsx';

const ensureTheme = (theme) => ({
    colors: {
        background: theme?.colors?.background || '#FFFFFF',
        surface: theme?.colors?.surface || 'rgba(255,255,255,0.85)',
        subtle: theme?.colors?.subtle || 'rgba(0,0,0,0.06)',
        border: theme?.colors?.border || 'rgba(0,0,0,0.12)',
        textPrimary: theme?.colors?.textPrimary || '#1F1F1F',
        textSecondary: theme?.colors?.textSecondary || '#555555',
        accent: theme?.colors?.accent || '#8B5E3C',
    }
});

const QUICKSHIP_THRESHOLD = 4;

const CATEGORY_FILTERS = [
    { key: 'all', label: 'All Types' },
    { key: 'wood', label: 'Wood Seating', match: (type) => type === 'Wood Seating' },
    { key: 'upholstery', label: 'Upholstered', match: (type) => type === 'Upholstery' || type === 'Seating' },
    { key: 'casegoods', label: 'Casegoods', match: (type) => type === 'Casegoods' || type === 'Laminate' || type === 'Veneer' || type === 'Tables' },
];

const TypeCard = ({ type, weeks, image, isQuickship, theme, onQuickshipClick }) => (
    <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden">
            <img src={image} alt={type} className="w-full h-full object-contain" />
            {isQuickship && (
                <button
                    onClick={(e) => { e.stopPropagation(); onQuickshipClick(); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: '#10B981' }}
                >
                    <Zap className="w-3 h-3 text-white" />
                </button>
            )}
        </div>
        <div className="mt-1.5 text-center">
            <span className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>{weeks}</span>
            <span className="text-[10px] font-medium ml-0.5" style={{ color: theme.colors.textSecondary }}>wk</span>
        </div>
        <span className="text-[10px] font-medium" style={{ color: theme.colors.textSecondary }}>
            {type.replace('Wood Seating', 'Wood').replace('Upholstery', 'Uph')}
        </span>
    </div>
);

export const LeadTimesScreen = ({ theme = {} }) => {
    const safeTheme = ensureTheme(theme);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortFastest, setSortFastest] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showQuickshipHint, setShowQuickshipHint] = useState(false);
    const filterBtnRef = useRef(null);
    const [filterPos, setFilterPos] = useState({ top: 0, right: 0 });

    useEffect(() => {
        if (showFilterMenu && filterBtnRef.current) {
            const rect = filterBtnRef.current.getBoundingClientRect();
            setFilterPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
        }
    }, [showFilterMenu]);

    useEffect(() => {
        if (!showFilterMenu) return;
        const handleClick = (e) => {
            if (!filterBtnRef.current?.contains(e.target)) setShowFilterMenu(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showFilterMenu]);

    const rows = useMemo(() => {
        const map = {};
        LEAD_TIMES_DATA.forEach(({ series, type, weeks, image }) => {
            if (!map[series]) map[series] = { types: [] };
            map[series].types.push({ type, weeks, image, isQuickship: weeks <= QUICKSHIP_THRESHOLD });
        });
        
        let list = Object.entries(map).map(([series, data]) => {
            const sortedTypes = [...data.types].sort((a, b) => a.weeks - b.weeks);
            return { series, types: sortedTypes, minWeeks: Math.min(...sortedTypes.map(t => t.weeks)) };
        });

        if (categoryFilter !== 'all') {
            const filterDef = CATEGORY_FILTERS.find(f => f.key === categoryFilter);
            if (filterDef?.match) {
                list = list.map(row => ({
                    ...row,
                    types: row.types.filter(t => filterDef.match(t.type))
                })).filter(row => row.types.length > 0);
            }
        }

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(r => r.series.toLowerCase().includes(q));
        }

        if (sortFastest) {
            list.sort((a, b) => a.minWeeks - b.minWeeks);
        } else {
            list.sort((a, b) => a.series.localeCompare(b.series));
        }
        return list;
    }, [searchTerm, sortFastest, categoryFilter]);

    const activeFilterLabel = CATEGORY_FILTERS.find(f => f.key === categoryFilter)?.label;

    const header = (
        <div className="py-3 space-y-3">
            <div className="flex items-center gap-2">
                <StandardSearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search series..." theme={safeTheme} className="flex-1" />
                <button ref={filterBtnRef} onClick={() => setShowFilterMenu(!showFilterMenu)} className="flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-semibold transition-all flex-shrink-0" style={{ backgroundColor: categoryFilter !== 'all' ? safeTheme.colors.accent : safeTheme.colors.surface, color: categoryFilter !== 'all' ? '#fff' : safeTheme.colors.textSecondary, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    <Filter className="w-4 h-4" />
                </button>
                <button onClick={() => setSortFastest(!sortFastest)} className="flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-semibold transition-all flex-shrink-0" style={{ backgroundColor: sortFastest ? safeTheme.colors.accent : safeTheme.colors.surface, color: sortFastest ? '#fff' : safeTheme.colors.textSecondary, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    <Timer className="w-4 h-4" />
                </button>
            </div>
            {categoryFilter !== 'all' && (
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: safeTheme.colors.accent + '15', color: safeTheme.colors.accent }}>
                        {activeFilterLabel}
                        <button onClick={() => setCategoryFilter('all')} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                    </span>
                </div>
            )}
        </div>
    );

    return (
        <ScreenLayout theme={safeTheme} header={header} maxWidth="default" padding={true} paddingBottom="7rem">
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: safeTheme.colors.surface }}>
                {rows.map(({ series, types }, index) => (
                    <div key={series} className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-black/[0.02]" style={{ borderBottom: index < rows.length - 1 ? '1px solid ' + safeTheme.colors.border + '15' : 'none' }}>
                        <div className="w-24 flex-shrink-0">
                            <h3 className="font-semibold text-sm leading-tight" style={{ color: safeTheme.colors.textPrimary }}>{series}</h3>
                        </div>
                        <div className="flex-1 flex items-center justify-end gap-4">
                            {types.map((t, i) => (<TypeCard key={i} {...t} theme={safeTheme} onQuickshipClick={() => setShowQuickshipHint(true)} />))}
                        </div>
                    </div>
                ))}
            </div>
            {rows.length === 0 && (<div className="text-center py-16 rounded-2xl" style={{ backgroundColor: safeTheme.colors.subtle }}><p className="text-sm font-medium" style={{ color: safeTheme.colors.textPrimary }}>No series found</p></div>)}
            {showFilterMenu && createPortal(<div className="fixed rounded-2xl shadow-xl overflow-hidden py-2" style={{ top: filterPos.top, right: filterPos.right, backgroundColor: safeTheme.colors.surface, border: '1px solid ' + safeTheme.colors.border, zIndex: 100000, minWidth: 180 }}>{CATEGORY_FILTERS.map(f => { const isActive = categoryFilter === f.key; return (<button key={f.key} onClick={() => { setCategoryFilter(f.key); setShowFilterMenu(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors hover:bg-black/5" style={{ color: isActive ? safeTheme.colors.accent : safeTheme.colors.textPrimary }}>{f.label}{isActive && <Check className="w-4 h-4" />}</button>); })}</div>, document.body)}
            {showQuickshipHint && createPortal(<div className="fixed inset-0 flex items-center justify-center z-[100001]" onClick={() => setShowQuickshipHint(false)}><div className="absolute inset-0 bg-black/30" /><div className="relative rounded-2xl p-6 mx-4 max-w-sm text-center shadow-2xl" style={{ backgroundColor: safeTheme.colors.surface }} onClick={e => e.stopPropagation()}><div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#10B98120' }}><Zap className="w-6 h-6" style={{ color: '#10B981' }} /></div><h3 className="font-bold text-lg mb-2" style={{ color: safeTheme.colors.textPrimary }}>QuickShip Available</h3><p className="text-sm" style={{ color: safeTheme.colors.textSecondary }}>This configuration ships in <strong>12 business days</strong> or less when ordered with qualifying options.</p><button onClick={() => setShowQuickshipHint(false)} className="mt-4 px-6 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: safeTheme.colors.accent, color: '#fff' }}>Got it</button></div></div>, document.body)}
        </ScreenLayout>
    );
};