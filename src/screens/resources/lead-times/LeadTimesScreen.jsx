import React, { useState, useMemo } from 'react';
import { Zap, Timer } from 'lucide-react';
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
    }
});

// Quickship threshold (4 weeks or less)
const QUICKSHIP_THRESHOLD = 4;

export const LeadTimesScreen = ({ theme = {} }) => {
    const safeTheme = ensureTheme(theme);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortFastest, setSortFastest] = useState(false);

    const rows = useMemo(() => {
        const map = {};
        LEAD_TIMES_DATA.forEach(({ series, type, weeks, image }) => {
            if (!map[series]) map[series] = { types: {}, minWeeks: weeks, hasQuickship: weeks <= QUICKSHIP_THRESHOLD };
            map[series].types[type] = { weeks, image };
            if (weeks < map[series].minWeeks) map[series].minWeeks = weeks;
            if (weeks <= QUICKSHIP_THRESHOLD) map[series].hasQuickship = true;
        });
        
        let list = Object.entries(map).map(([series, data]) => ({ 
            series, 
            types: data.types, 
            minWeeks: data.minWeeks,
            hasQuickship: data.hasQuickship 
        }));

        // Search filter
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(r => r.series.toLowerCase().includes(q));
        }

        // Sort
        if (sortFastest) {
            list.sort((a, b) => a.minWeeks - b.minWeeks);
        } else {
            list.sort((a, b) => a.series.localeCompare(b.series));
        }
        return list;
    }, [searchTerm, sortFastest]);

    const header = (
        <div className="py-3 space-y-3">
            <div className="flex items-center gap-2">
                <StandardSearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search series..."
                    theme={safeTheme}
                    className="flex-1"
                />
                <button
                    onClick={() => setSortFastest(!sortFastest)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex-shrink-0"
                    style={{
                        backgroundColor: sortFastest ? safeTheme.colors.accent : safeTheme.colors.surface,
                        color: sortFastest ? '#fff' : safeTheme.colors.textSecondary,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                    }}
                >
                    <Timer className="w-4 h-4" />
                    {sortFastest ? 'Fastest' : 'A-Z'}
                </button>
            </div>
        </div>
    );

    return (
        <ScreenLayout
            theme={safeTheme}
            header={header}
            maxWidth="default"
            padding={true}
            paddingBottom="7rem"
        >
            {/* Simple row list */}
            <div 
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: safeTheme.colors.surface }}
            >
                {rows.map(({ series, types, minWeeks, hasQuickship }, index) => {
                    const typeEntries = Object.entries(types);
                    const primaryImage = typeEntries[0][1].image;
                    
                    return (
                        <div 
                            key={series}
                            className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-black/[0.02]"
                            style={{ 
                                borderBottom: index < rows.length - 1 ? `1px solid ${safeTheme.colors.border}20` : 'none'
                            }}
                        >
                            {/* Product image */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                                <img 
                                    src={primaryImage} 
                                    alt={series} 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            
                            {/* Series name + quickship indicator */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-[15px] truncate" style={{ color: safeTheme.colors.textPrimary }}>
                                        {series}
                                    </h3>
                                    {hasQuickship && (
                                        <div 
                                            className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: '#10B98120' }}
                                        >
                                            <Zap className="w-3 h-3" style={{ color: '#10B981' }} />
                                            <span className="text-[10px] font-bold" style={{ color: '#10B981' }}>QUICK</span>
                                        </div>
                                    )}
                                </div>
                                {typeEntries.length > 1 && (
                                    <p className="text-xs mt-0.5" style={{ color: safeTheme.colors.textSecondary }}>
                                        {typeEntries.map(([t, d]) => `${t} ${d.weeks}wk`).join(' · ')}
                                    </p>
                                )}
                            </div>
                            
                            {/* Lead time - prominent */}
                            <div className="text-right flex-shrink-0">
                                <span className="text-2xl font-bold" style={{ color: safeTheme.colors.textPrimary }}>
                                    {minWeeks}
                                </span>
                                <span className="text-xs font-medium ml-0.5" style={{ color: safeTheme.colors.textSecondary }}>
                                    wk
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {rows.length === 0 && (
                <div 
                    className="text-center py-16 rounded-2xl"
                    style={{ backgroundColor: safeTheme.colors.subtle }}
                >
                    <p className="text-sm font-medium" style={{ color: safeTheme.colors.textPrimary }}>
                        No series found
                    </p>
                </div>
            )}
        </ScreenLayout>
    );
};