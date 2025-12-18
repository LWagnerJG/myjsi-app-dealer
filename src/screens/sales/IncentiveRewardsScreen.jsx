import { useMemo, useState, useCallback } from 'react';
import { GlassCard, ScreenLayout } from '../../design-system/index.js';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect';
import { INCENTIVE_REWARDS_DATA } from './data.js';
import { DollarSign, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { JSI_COLORS } from '../../design-system/tokens.js';

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

    const totalSalesRewards = sortedSales.reduce((sum, p) => sum + p.amount, 0);
    const totalDesignerRewards = sortedDesigners.reduce((sum, p) => sum + p.amount, 0);

    const RewardRow = ({ person, index, total }) => {
        const pct = total > 0 ? (person.amount / total) * 100 : 0;
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl transition-all hover:bg-black/[0.02]"
            >
                <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                    style={{ 
                        backgroundColor: index === 0 ? `${JSI_COLORS.gold}20` : theme.colors.subtle,
                        color: index === 0 ? JSI_COLORS.gold : theme.colors.textSecondary,
                    }}
                >
                    {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-[12px] truncate" style={{ color: theme.colors.textPrimary }}>
                        {person.name}
                    </p>
                    <div className="mt-0.5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.subtle }}>
                        <motion.div 
                            className="h-full rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.35, delay: index * 0.02 }}
                            style={{ backgroundColor: theme.colors.accent }} 
                        />
                    </div>
                </div>
                
                <span className="font-semibold text-[12px] tabular-nums flex-shrink-0" style={{ color: theme.colors.accent }}>
                    ${person.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            </motion.div>
        );
    };

    const EmptyState = ({ type }) => (
        <div className="py-6 text-center">
            <p className="text-[12px]" style={{ color: theme.colors.textSecondary }}>
                No {type} rewards for this period
            </p>
        </div>
    );

    return (
        <ScreenLayout
            theme={theme}
            maxWidth="content"
            padding={true}
            paddingBottom="8rem"
            gap="0.75rem"
        >
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="w-32">
                    <PortalNativeSelect
                        value={selectedPeriod}
                        onChange={e => setSelectedPeriod(e.target.value)}
                        options={timePeriods}
                        theme={theme}
                    />
                </div>
                
                <div 
                    className="flex items-center rounded-full p-0.5" 
                    style={{ backgroundColor: theme.colors.subtle }}
                >
                    <button
                        onClick={() => setViewFilter('all')}
                        className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all"
                        style={{
                            backgroundColor: viewFilter === 'all' ? '#FFF' : 'transparent',
                            color: viewFilter === 'all' ? theme.colors.textPrimary : theme.colors.textSecondary,
                            boxShadow: viewFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setViewFilter('sales')}
                        className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all"
                        style={{
                            backgroundColor: viewFilter === 'sales' ? '#FFF' : 'transparent',
                            color: viewFilter === 'sales' ? theme.colors.textPrimary : theme.colors.textSecondary,
                            boxShadow: viewFilter === 'sales' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        Sales
                    </button>
                    <button
                        onClick={() => setViewFilter('designers')}
                        className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all"
                        style={{
                            backgroundColor: viewFilter === 'designers' ? '#FFF' : 'transparent',
                            color: viewFilter === 'designers' ? theme.colors.textPrimary : theme.colors.textSecondary,
                            boxShadow: viewFilter === 'designers' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        Design
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-2.5">
                <GlassCard theme={theme} className="p-2.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <DollarSign className="w-3 h-3" style={{ color: theme.colors.accent }} />
                        <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>
                            Sales
                        </span>
                    </div>
                    <p className="text-base font-bold tabular-nums" style={{ color: theme.colors.accent }}>
                        ${totalSalesRewards.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </GlassCard>
                
                <GlassCard theme={theme} className="p-2.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Users className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />
                        <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>
                            Design
                        </span>
                    </div>
                    <p className="text-base font-bold tabular-nums" style={{ color: theme.colors.textPrimary }}>
                        ${totalDesignerRewards.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </GlassCard>
            </div>

            {/* Sales Rewards */}
            {(viewFilter === 'all' || viewFilter === 'sales') && (
                <GlassCard theme={theme} className="p-2.5" variant="elevated">
                    <div className="flex items-center gap-2 px-1.5 mb-1.5">
                        <DollarSign className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} />
                        <h3 className="font-semibold text-[13px]" style={{ color: theme.colors.textPrimary }}>
                            Sales Rewards
                        </h3>
                        <span className="text-[10px] ml-auto" style={{ color: theme.colors.textSecondary }}>
                            {sortedSales.length} {sortedSales.length === 1 ? 'person' : 'people'}
                        </span>
                    </div>
                    
                    {sortedSales.length > 0 
                        ? sortedSales.map((person, i) => (
                            <RewardRow key={person.name} person={person} index={i} total={totalSalesRewards} />
                        ))
                        : <EmptyState type="sales" />
                    }
                </GlassCard>
            )}

            {/* Designer Rewards */}
            {(viewFilter === 'all' || viewFilter === 'designers') && (
                <GlassCard theme={theme} className="p-2.5" variant="elevated">
                    <div className="flex items-center gap-2 px-1.5 mb-1.5">
                        <Users className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                        <h3 className="font-semibold text-[13px]" style={{ color: theme.colors.textPrimary }}>
                            Designer Rewards
                        </h3>
                        <span className="text-[10px] ml-auto" style={{ color: theme.colors.textSecondary }}>
                            {sortedDesigners.length} {sortedDesigners.length === 1 ? 'person' : 'people'}
                        </span>
                    </div>
                    
                    {sortedDesigners.length > 0 
                        ? sortedDesigners.map((person, i) => (
                            <RewardRow key={person.name} person={person} index={i} total={totalDesignerRewards} />
                        ))
                        : <EmptyState type="designer" />
                    }
                </GlassCard>
            )}
        </ScreenLayout>
    );
};
