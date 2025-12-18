import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Timer, ListOrdered, Filter, Check, Clock } from 'lucide-react';
import { LEAD_TIMES_DATA } from './data.js';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { ScreenLayout } from '../../../design-system/ScreenLayout.jsx';

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
    { key: 'all', label: 'All' },
    { key: 'upholstered', label: 'Upholstered', match: (r) => r.types.Upholstery != null },
    { key: 'wood', label: 'Wood', match: (r) => r.types['Wood Seating'] != null },
    { key: 'casegoods', label: 'Casegoods', match: (r) => (r.types.Casegoods || r.types.Laminate || r.types.Veneer || r.types.Tables) != null }
];

// Clean product card with lead time
const ProductCard = ({ series, types, theme }) => {
    // Get the primary image and minimum lead time
    const typeEntries = Object.entries(types);
    const primaryType = typeEntries[0];
    const minWeeks = Math.min(...typeEntries.map(([, data]) => data.weeks));
    const hasMultipleTypes = typeEntries.length > 1;
    
    return (
        <div 
            className="group rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg"
            style={{ backgroundColor: theme.colors.surface }}
        >
            {/* Image container */}
            <div className="relative aspect-square p-4 flex items-center justify-center">
                <img 
                    src={primaryType[1].image} 
                    alt={series} 
                    className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105" 
                />
                
                {/* Lead time badge - prominent position */}
                <div 
                    className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: theme.colors.surface, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                >
                    <Clock className="w-3 h-3" style={{ color: theme.colors.accent }} />
                    <span className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>
                        {minWeeks}
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: theme.colors.textSecondary }}>wk</span>
                </div>
            </div>
            
            {/* Series name and type info */}
            <div className="px-4 pb-4 pt-1">
                <h3 className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                    {series}
                </h3>
                {hasMultipleTypes && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {typeEntries.map(([typeName, data]) => (
                            <span 
                                key={typeName}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary }}
                            >
                                {typeName.replace('Upholstery', 'Uph').replace('Wood Seating', 'Wood')} {data.weeks}w
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const LeadTimesScreen = ({ theme = {} }) => {
    const safeTheme = ensureTheme(theme);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortFastest, setSortFastest] = useState(false);
    const [selectedCat, setSelectedCat] = useState('all');

    const rows = useMemo(() => {
        const map = {};
        LEAD_TIMES_DATA.forEach(({ series, type, weeks, image }) => {
            if (!map[series]) map[series] = { types: {} };
            map[series].types[type] = { weeks, image };
        });
        let list = Object.entries(map).map(([series, data]) => ({ series, types: data.types }));

        // Category filter
        if (selectedCat !== 'all') {
            const def = CATEGORY_DEFS.find(c => c.key === selectedCat);
            if (def?.match) {
                list = list.filter(r => def.match(r));
            }
        }

        // Search filter
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(r => r.series.toLowerCase().includes(q));
        }

        // Sort
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
    }, [searchTerm, selectedCat, sortFastest]);

    const header = (
        <div className="py-3 space-y-3">
            {/* Search bar */}
            <StandardSearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search series..."
                theme={safeTheme}
            />
            
            {/* Category pills + sort toggle */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
                    {CATEGORY_DEFS.map(def => {
                        const isActive = selectedCat === def.key;
                        return (
                            <button
                                key={def.key}
                                onClick={() => setSelectedCat(def.key)}
                                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                style={{
                                    backgroundColor: isActive ? safeTheme.colors.accent : safeTheme.colors.subtle,
                                    color: isActive ? '#fff' : safeTheme.colors.textSecondary,
                                }}
                            >
                                {def.label}
                            </button>
                        );
                    })}
                </div>
                
                {/* Sort toggle */}
                <button
                    onClick={() => setSortFastest(!sortFastest)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0"
                    style={{
                        backgroundColor: sortFastest ? `${safeTheme.colors.accent}15` : safeTheme.colors.subtle,
                        color: sortFastest ? safeTheme.colors.accent : safeTheme.colors.textSecondary,
                    }}
                >
                    <Timer className="w-3.5 h-3.5" />
                    {sortFastest ? 'Fastest' : 'A-Z'}
                </button>
            </div>
        </div>
    );

    return (
        <ScreenLayout
            theme={safeTheme}
            header={header}
            maxWidth="wide"
            padding={true}
            paddingBottom="7rem"
        >
            {/* Grid of product cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {rows.map(({ series, types }) => (
                    <ProductCard 
                        key={series} 
                        series={series} 
                        types={types} 
                        theme={safeTheme} 
                    />
                ))}
            </div>
            
            {rows.length === 0 && (
                <div 
                    className="text-center py-16 rounded-2xl"
                    style={{ backgroundColor: safeTheme.colors.subtle }}
                >
                    <p className="text-sm font-medium" style={{ color: safeTheme.colors.textPrimary }}>
                        No series match your filters
                    </p>
                    <p className="text-xs mt-1" style={{ color: safeTheme.colors.textSecondary }}>
                        Try adjusting your search or category
                    </p>
                </div>
            )}
        </ScreenLayout>
    );
};