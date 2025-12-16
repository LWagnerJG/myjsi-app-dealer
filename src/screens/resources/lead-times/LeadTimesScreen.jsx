import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Timer, ListOrdered, Filter, Check } from 'lucide-react';
import { LEAD_TIMES_DATA } from './data.js';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';

// Fallback colors if theme tokens missing
const ensureTheme = (theme) => ({
    colors: {
        background: theme?.colors?.background || '#FFFFFF',
        surface: theme?.colors?.surface || 'rgba(255,255,255,0.85)',
        subtle: theme?.colors?.subtle || 'rgba(0,0,0,0.06)',
        border: theme?.colors?.border || 'rgba(0,0,0,0.12)',
        textPrimary: theme?.colors?.textPrimary || '#1F1F1F',
        textSecondary: theme?.colors?.textSecondary || '#555555',
        accent: theme?.colors?.accent || '#8B5E3C',
        shadow: theme?.colors?.shadow || 'rgba(0,0,0,0.08)'
    }
});

const CATEGORY_DEFS = [
    { key: 'upholstered', label: 'Upholstered', match: (r) => r.types.Upholstery != null },
    { key: 'wood', label: 'Wood Seating', match: (r) => r.types['Wood Seating'] != null },
    { key: 'casegoods', label: 'Casegoods', match: (r) => (r.types.Casegoods || r.types.Laminate || r.types.Veneer || r.types.Tables) != null }
];

export const LeadTimesScreen = ({ theme = {} }) => {
    const safeTheme = ensureTheme(theme);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortFastest, setSortFastest] = useState(false);
    const [selectedCats, setSelectedCats] = useState(() => new Set());
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const filterButtonRef = useRef(null);
    const filterMenuRef = useRef(null);

    // Close filter menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showFilterMenu && 
                filterMenuRef.current && 
                !filterMenuRef.current.contains(event.target) &&
                filterButtonRef.current &&
                !filterButtonRef.current.contains(event.target)) {
                setShowFilterMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFilterMenu]);

    const toggleCategory = (key) => {
        setSelectedCats(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const clearFilters = () => {
        setSelectedCats(new Set());
        setSortFastest(false);
    };

    const hasActiveFilters = selectedCats.size > 0 || sortFastest;

    const rows = useMemo(() => {
        const map = {};
        LEAD_TIMES_DATA.forEach(({ series, type, weeks, image }) => {
            if (!map[series]) map[series] = { types: {} };
            map[series].types[type] = { weeks, image };
        });
        let list = Object.entries(map).map(([series, data]) => ({ series, types: data.types }));

        if (selectedCats.size > 0) {
            list = list.filter(r => {
                for (const cat of selectedCats) {
                    const def = CATEGORY_DEFS.find(c => c.key === cat);
                    if (def && def.match(r)) return true;
                }
                return false;
            });
        }

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(r => r.series.toLowerCase().includes(q));
        }

        if (sortFastest) {
            list.sort((a, b) => {
                const aMin = Math.min(...Object.values(a.types).map(t => t.weeks));
                const bMin = Math.min(...Object.values(b.types).map(t => t.weeks));
                return aMin - bMin;
            });
        } else {
            list.sort((a, b) => a.series.localeCompare(b.series));
        }
        return list;
    }, [searchTerm, selectedCats, sortFastest]);

    const LVLabel = ({ label }) => (
        <span className="text-[10px] font-bold" style={{ color: safeTheme.colors.textSecondary }}>{label}</span>
    );

    const LeadTimeInfo = ({ typeData }) => (
        <div className="relative w-14 h-14">
            <img src={typeData.image} alt="" className="w-full h-full object-contain" />
            <div className="absolute bottom-0 right-0 h-5 w-5 flex items-center justify-center rounded-full shadow-md" style={{ backgroundColor: safeTheme.colors.subtle }}>
                <span className="text-[11px] font-bold" style={{ color: safeTheme.colors.textSecondary }}>{typeData.weeks}</span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: safeTheme.colors.background }}>
            {/* Top banner - Search + Filter button */}
            <div className="px-4 pt-3 pb-2">
                <div className="flex items-center gap-2">
                    <StandardSearchBar
                        className="flex-grow"
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search series..."
                        theme={safeTheme}
                        aria-label="Search series"
                    />
                    <div className="relative">
                        <button
                            ref={filterButtonRef}
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className="p-4 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 relative"
                            aria-label="Filter options"
                            title="Filter options"
                            style={{
                                backgroundColor: hasActiveFilters ? safeTheme.colors.accent : '#ffffff',
                                color: hasActiveFilters ? '#ffffff' : safeTheme.colors.textPrimary,
                                borderColor: hasActiveFilters ? safeTheme.colors.accent : 'rgba(0,0,0,0.10)'
                            }}
                        >
                            <Filter className="w-5 h-5" />
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {selectedCats.size + (sortFastest ? 1 : 0)}
                                </span>
                            )}
                        </button>

                        {/* Filter dropdown menu */}
                        {showFilterMenu && (
                            <div 
                                ref={filterMenuRef}
                                className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-lg z-50 overflow-hidden"
                                style={{ backgroundColor: safeTheme.colors.surface, border: `1px solid ${safeTheme.colors.border}` }}
                            >
                                <div className="p-3 border-b" style={{ borderColor: safeTheme.colors.border }}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold" style={{ color: safeTheme.colors.textPrimary }}>Filters</span>
                                        {hasActiveFilters && (
                                            <button 
                                                onClick={clearFilters}
                                                className="text-xs font-medium px-2 py-1 rounded-full"
                                                style={{ color: safeTheme.colors.accent, backgroundColor: safeTheme.colors.subtle }}
                                            >
                                                Clear all
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Category filters */}
                                <div className="p-2">
                                    <p className="text-xs font-medium px-2 py-1" style={{ color: safeTheme.colors.textSecondary }}>Categories</p>
                                    {CATEGORY_DEFS.map(def => {
                                        const active = selectedCats.has(def.key);
                                        return (
                                            <button
                                                key={def.key}
                                                onClick={() => toggleCategory(def.key)}
                                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors"
                                                style={{ 
                                                    backgroundColor: active ? safeTheme.colors.accent + '15' : 'transparent',
                                                }}
                                            >
                                                <span className="text-sm" style={{ color: active ? safeTheme.colors.accent : safeTheme.colors.textPrimary }}>
                                                    {def.label}
                                                </span>
                                                {active && <Check className="w-4 h-4" style={{ color: safeTheme.colors.accent }} />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Sort option */}
                                <div className="p-2 border-t" style={{ borderColor: safeTheme.colors.border }}>
                                    <p className="text-xs font-medium px-2 py-1" style={{ color: safeTheme.colors.textSecondary }}>Sort by</p>
                                    <button
                                        onClick={() => setSortFastest(false)}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors"
                                        style={{ 
                                            backgroundColor: !sortFastest ? safeTheme.colors.accent + '15' : 'transparent',
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ListOrdered className="w-4 h-4" style={{ color: !sortFastest ? safeTheme.colors.accent : safeTheme.colors.textSecondary }} />
                                            <span className="text-sm" style={{ color: !sortFastest ? safeTheme.colors.accent : safeTheme.colors.textPrimary }}>
                                                Alphabetical
                                            </span>
                                        </div>
                                        {!sortFastest && <Check className="w-4 h-4" style={{ color: safeTheme.colors.accent }} />}
                                    </button>
                                    <button
                                        onClick={() => setSortFastest(true)}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors"
                                        style={{ 
                                            backgroundColor: sortFastest ? safeTheme.colors.accent + '15' : 'transparent',
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Timer className="w-4 h-4" style={{ color: sortFastest ? safeTheme.colors.accent : safeTheme.colors.textSecondary }} />
                                            <span className="text-sm" style={{ color: sortFastest ? safeTheme.colors.accent : safeTheme.colors.textPrimary }}>
                                                Fastest first
                                            </span>
                                        </div>
                                        {sortFastest && <Check className="w-4 h-4" style={{ color: safeTheme.colors.accent }} />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Vertical list of cards with proper spacing and nav bar buffer */}
            <div className="flex-1 overflow-y-auto px-4 pb-24 pt-1 scrollbar-hide">
                <div className="space-y-2">
                    {rows.map(({ series, types }) => (
                        <GlassCard key={series} theme={safeTheme} className="px-4 py-2 flex items-center justify-between rounded-2xl">
                            <h3 className="text-base font-bold tracking-tight" style={{ color: safeTheme.colors.textPrimary }}>
                                {series}
                            </h3>
                            <div className="flex items-center justify-end gap-2">
                                {types['Upholstery'] && <LeadTimeInfo typeData={types['Upholstery']} />}
                                {types['Seating'] && <LeadTimeInfo typeData={types['Seating']} />}
                                {types['Wood Seating'] && <LeadTimeInfo typeData={types['Wood Seating']} />}
                                {types['Casegoods'] && <LeadTimeInfo typeData={types['Casegoods']} />}
                                {types['Tables'] && <LeadTimeInfo typeData={types['Tables']} />}
                                {types['Laminate'] && (
                                    <div className="relative w-14 h-14 text-center">
                                        <LVLabel label="Laminate" />
                                        <img src={types['Laminate'].image} alt="Laminate" className="w-full h-full object-contain" />
                                        <div className="absolute bottom-0 right-0 h-5 w-5 flex items-center justify-center rounded-full shadow-md" style={{ backgroundColor: safeTheme.colors.subtle }}>
                                            <span className="text-[11px] font-bold" style={{ color: safeTheme.colors.textSecondary }}>
                                                {types['Laminate'].weeks}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {types['Veneer'] && (
                                    <div className="relative w-14 h-14 text-center">
                                        <LVLabel label="Veneer" />
                                        <img src={types['Veneer'].image} alt="Veneer" className="w-full h-full object-contain" />
                                        <div className="absolute bottom-0 right-0 h-5 w-5 flex items-center justify-center rounded-full shadow-md" style={{ backgroundColor: safeTheme.colors.subtle }}>
                                            <span className="text-[11px] font-bold" style={{ color: safeTheme.colors.textSecondary }}>
                                                {types['Veneer'].weeks}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    ))}
                    {rows.length === 0 && (
                        <GlassCard theme={safeTheme} className="p-8 flex flex-col items-center justify-center text-center gap-2 rounded-2xl">
                            <p className="text-sm font-medium" style={{ color: safeTheme.colors.textPrimary }}>No series match your filters.</p>
                            <p className="text-xs" style={{ color: safeTheme.colors.textSecondary }}>Adjust category, search, or sorting to see results.</p>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
};