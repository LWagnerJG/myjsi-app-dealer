import { useMemo, useState, useCallback } from 'react';
import { GlassCard, ScreenLayout } from '../../design-system/index.js';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect';
import { INCENTIVE_REWARDS_DATA } from './data.js';
import { ChevronLeft, Award, Users, DollarSign, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { DESIGN_TOKENS, JSI_COLORS } from '../../design-system/tokens.js';

export const IncentiveRewardsScreen = ({ theme, onNavigate }) => {
    const generateTimePeriods = useCallback(() => {
        const periods = [];
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

        for (let year = currentYear; year >= currentYear - 2; year--) {
            const isCurrentYear = year === currentYear;
            const quartersInYear = isCurrentYear ? currentQuarter : 4;

            for (let q = quartersInYear; q >= 1; q--) {
                periods.push({ value: `${year}-Q${q}`, label: `Q${q} ${year}` });
            }
            periods.push({ value: `${year}`, label: `${year} Annual` });
        }
        return periods;
    }, []);

    const timePeriods = useMemo(generateTimePeriods, [generateTimePeriods]);
    const [selectedPeriod, setSelectedPeriod] = useState(timePeriods[0]?.value || new Date().getFullYear().toString());
    const [viewFilter, setViewFilter] = useState('all');

    const rewardsData = useMemo(() => {
        if (!selectedPeriod) return { sales: [], designers: [] };

        const isAnnual = !selectedPeriod.includes('Q');
        if (isAnnual) {
            const year = selectedPeriod;
            const salesMap = new Map();
            const designersMap = new Map();

            for (let q = 1; q <= 4; q++) {
                const periodKey = `${year}-Q${q}`;
                const periodData = INCENTIVE_REWARDS_DATA[periodKey];
                if (periodData) {
                    periodData.sales?.forEach(person => {
                        salesMap.set(person.name, (salesMap.get(person.name) || 0) + person.amount);
                    });
                    periodData.designers?.forEach(person => {
                        designersMap.set(person.name, (designersMap.get(person.name) || 0) + person.amount);
                    });
                }
            }
            const cumulativeData = { sales: [], designers: [] };
            salesMap.forEach((amount, name) => cumulativeData.sales.push({ name, amount }));
            designersMap.forEach((amount, name) => cumulativeData.designers.push({ name, amount }));
            return cumulativeData;
        }
        return INCENTIVE_REWARDS_DATA[selectedPeriod] || { sales: [], designers: [] };
    }, [selectedPeriod]);

    const sortedSales = useMemo(() => [...(rewardsData.sales || [])].sort((a, b) => b.amount - a.amount), [rewardsData.sales]);
    const sortedDesigners = useMemo(() => [...(rewardsData.designers || [])].sort((a, b) => b.amount - a.amount), [rewardsData.designers]);

    // Calculate totals
    const totalSalesRewards = sortedSales.reduce((sum, p) => sum + p.amount, 0);
    const totalDesignerRewards = sortedDesigners.reduce((sum, p) => sum + p.amount, 0);

    const header = () => (
        <div className="flex items-center gap-3 py-4">
            <button
                onClick={() => onNavigate('sales')}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-95"
                style={{ 
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    boxShadow: DESIGN_TOKENS.shadows.sm
                }}
            >
                <ChevronLeft className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
            </button>
            <h1 className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
                Sales Rewards
            </h1>
        </div>
    );

    const RewardRow = ({ person, index, total }) => {
        const pct = total > 0 ? (person.amount / total) * 100 : 0;
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04, ease: [0.4, 0, 0.2, 1] }}
                className="flex items-center gap-4 py-3 px-4 rounded-xl transition-all hover:bg-black/[0.02]"
                style={{ borderBottom: `1px solid ${theme.colors.border}15` }}
            >
                <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ 
                        backgroundColor: index === 0 ? `${JSI_COLORS.gold}20` : theme.colors.subtle,
                        color: index === 0 ? JSI_COLORS.gold : theme.colors.textSecondary,
                        border: index === 0 ? `1px solid ${JSI_COLORS.gold}40` : `1px solid ${theme.colors.border}`
                    }}
                >
                    {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                        {person.name}
                    </p>
                    <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.subtle }}>
                        <motion.div 
                            className="h-full rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, delay: index * 0.04, ease: [0.4, 0, 0.2, 1] }}
                            style={{ backgroundColor: theme.colors.accent }} 
                        />
                    </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                    <span className="font-bold text-sm" style={{ color: theme.colors.accent }}>
                        ${person.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </motion.div>
        );
    };

    const EmptyState = ({ type }) => (
        <div className="py-12 text-center">
            <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: theme.colors.subtle }}
            >
                {type === 'sales' 
                    ? <DollarSign className="w-8 h-8" style={{ color: theme.colors.textSecondary }} />
                    : <Users className="w-8 h-8" style={{ color: theme.colors.textSecondary }} />
                }
            </div>
            <p className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                No {type} rewards for this period
            </p>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                Try selecting a different time period
            </p>
        </div>
    );

    const hasAnyData = sortedSales.length > 0 || sortedDesigners.length > 0;

    return (
        <ScreenLayout
            theme={theme}
            header={header}
            maxWidth="content"
            padding={true}
            paddingBottom="8rem"
        >
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="w-44">
                    <PortalNativeSelect
                        value={selectedPeriod}
                        onChange={e => setSelectedPeriod(e.target.value)}
                        options={timePeriods}
                        theme={theme}
                    />
                </div>
                
                <div 
                    className="flex items-center rounded-full p-1 gap-1" 
                    style={{ 
                        backgroundColor: theme.colors.surface, 
                        border: `1px solid ${theme.colors.border}`,
                        boxShadow: DESIGN_TOKENS.shadows.sm
                    }}
                >
                    <button
                        onClick={() => setViewFilter('all')}
                        className="px-4 py-2 rounded-full text-[12px] font-semibold transition-all"
                        style={{
                            backgroundColor: viewFilter === 'all' ? theme.colors.accent : 'transparent',
                            color: viewFilter === 'all' ? 'white' : theme.colors.textSecondary,
                            boxShadow: viewFilter === 'all' ? DESIGN_TOKENS.shadows.sm : 'none'
                        }}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setViewFilter('sales')}
                        className="px-4 py-2 rounded-full text-[12px] font-semibold transition-all"
                        style={{
                            backgroundColor: viewFilter === 'sales' ? theme.colors.accent : 'transparent',
                            color: viewFilter === 'sales' ? 'white' : theme.colors.textSecondary,
                            boxShadow: viewFilter === 'sales' ? DESIGN_TOKENS.shadows.sm : 'none'
                        }}
                    >
                        Sales
                    </button>
                    <button
                        onClick={() => setViewFilter('designers')}
                        className="px-4 py-2 rounded-full text-[12px] font-semibold transition-all"
                        style={{
                            backgroundColor: viewFilter === 'designers' ? theme.colors.accent : 'transparent',
                            color: viewFilter === 'designers' ? 'white' : theme.colors.textSecondary,
                            boxShadow: viewFilter === 'designers' ? DESIGN_TOKENS.shadows.sm : 'none'
                        }}
                    >
                        Designers
                    </button>
                </div>
            </div>

            {/* Summary Cards - only show if we have data */}
            {hasAnyData && (
                <div className="grid grid-cols-2 gap-3">
                    <div 
                        className="p-4 rounded-2xl"
                        style={{ 
                            backgroundColor: `${theme.colors.accent}08`,
                            border: `1px solid ${theme.colors.accent}15`
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4" style={{ color: theme.colors.accent }} />
                            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>
                                Sales Rewards
                            </span>
                        </div>
                        <p className="text-xl font-bold" style={{ color: theme.colors.accent }}>
                            ${totalSalesRewards.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] mt-1" style={{ color: theme.colors.textSecondary }}>
                            {sortedSales.length} recipient{sortedSales.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    
                    <div 
                        className="p-4 rounded-2xl"
                        style={{ 
                            backgroundColor: theme.colors.surface,
                            border: `1px solid ${theme.colors.border}`
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>
                                Designer Rewards
                            </span>
                        </div>
                        <p className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                            ${totalDesignerRewards.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] mt-1" style={{ color: theme.colors.textSecondary }}>
                            {sortedDesigners.length} recipient{sortedDesigners.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}

            {/* Sales Rewards Section */}
            {(viewFilter === 'all' || viewFilter === 'sales') && (
                <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
                    <div 
                        className="flex items-center gap-3 px-5 py-4"
                        style={{ borderBottom: `1px solid ${theme.colors.border}30` }}
                    >
                        <div 
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${theme.colors.accent}12` }}
                        >
                            <DollarSign className="w-5 h-5" style={{ color: theme.colors.accent }} />
                        </div>
                        <div>
                            <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>
                                Sales Rewards
                            </h3>
                            <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                                {sortedSales.length} team member{sortedSales.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    
                    <div className="py-1">
                        {sortedSales.length > 0 
                            ? sortedSales.map((person, i) => (
                                <RewardRow key={person.name} person={person} index={i} total={totalSalesRewards} />
                            ))
                            : <EmptyState type="sales" />
                        }
                    </div>
                </GlassCard>
            )}

            {/* Designer Rewards Section */}
            {(viewFilter === 'all' || viewFilter === 'designers') && (
                <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
                    <div 
                        className="flex items-center gap-3 px-5 py-4"
                        style={{ borderBottom: `1px solid ${theme.colors.border}30` }}
                    >
                        <div 
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${theme.colors.subtle}` }}
                        >
                            <Users className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                        </div>
                        <div>
                            <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>
                                Designer Rewards
                            </h3>
                            <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                                {sortedDesigners.length} team member{sortedDesigners.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    
                    <div className="py-1">
                        {sortedDesigners.length > 0 
                            ? sortedDesigners.map((person, i) => (
                                <RewardRow key={person.name} person={person} index={i} total={totalDesignerRewards} />
                            ))
                            : <EmptyState type="designer" />
                        }
                    </div>
                </GlassCard>
            )}
        </ScreenLayout>
    );
};
