import { useMemo, useState } from 'react';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect';
import { formatCurrency } from '../../utils/format.js';
import { MY_REWARDS_DATA } from './data.js';
import { CURRENT_USER } from '../../constants/currentUser.js';
import { isDarkTheme } from '../../design-system/tokens.js';

const parseQuarterKey = (key = '') => {
    const match = key.match(/^(\d{4})-Q(\d)$/);
    if (!match) return { year: 0, quarter: 0 };
    return { year: Number(match[1]), quarter: Number(match[2]) };
};

const buildTimePeriods = (rewardData) => {
    const quarterKeys = Object.keys(rewardData || {}).filter((key) => /^\d{4}-Q\d$/.test(key));
    const years = [...new Set(quarterKeys.map((key) => parseQuarterKey(key).year))].sort((a, b) => b - a);
    return years.flatMap((year) => {
        const quarters = quarterKeys
            .filter((key) => parseQuarterKey(key).year === year)
            .sort((a, b) => parseQuarterKey(b).quarter - parseQuarterKey(a).quarter)
            .map((key) => ({ value: key, label: `Q${parseQuarterKey(key).quarter} ${year}` }));
        return [...quarters, { value: String(year), label: `${year} Annual` }];
    });
};

// Collect the dealer user's own reward line items for the selected period.
const collectRewards = (data, period) => {
    if (!period) return [];
    if (period.includes('Q')) return data[period] || [];
    // Annual: flatten every quarter in that year.
    return Object.entries(data)
        .filter(([key]) => key.startsWith(`${period}-Q`))
        .flatMap(([, list]) => list || []);
};

const RewardRow = ({ entry, theme, borderColor }) => (
    <div className="flex items-center justify-between py-3" style={{ borderColor }}>
        <div className="min-w-0 pr-3">
            <p className="text-sm font-medium truncate" style={{ color: theme.colors.textPrimary }}>{entry.project}</p>
            <p className="text-xs tabular-nums" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                {entry.orderNumber} · {formatCurrency(entry.net)} net
            </p>
        </div>
        <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: theme.colors.textPrimary }}>
            {formatCurrency(entry.amount)}
        </span>
    </div>
);

export const IncentiveRewardsScreen = ({ theme }) => {
    const isDark = isDarkTheme(theme);
    const bdr = isDark ? 'rgba(255,255,255,0.065)' : 'rgba(0,0,0,0.06)';
    const timePeriods = useMemo(() => buildTimePeriods(MY_REWARDS_DATA), []);
    const [selectedPeriod, setSelectedPeriod] = useState(timePeriods[0]?.value || '');

    const entries = useMemo(
        () => collectRewards(MY_REWARDS_DATA, selectedPeriod),
        [selectedPeriod],
    );
    const sortedEntries = useMemo(
        () => [...entries].sort((a, b) => (b.amount || 0) - (a.amount || 0)),
        [entries],
    );
    const periodTotal = useMemo(
        () => entries.reduce((s, e) => s + (e.amount || 0), 0),
        [entries],
    );

    const rateLabel = `${(CURRENT_USER.rewardRate * 100).toFixed(0)}% of net`;

    return (
        <div className="min-h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-6 max-w-content mx-auto w-full space-y-4">
                <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>My Rewards</p>
                    <div className="w-40 ml-auto">
                        <PortalNativeSelect
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            options={timePeriods}
                            theme={theme}
                            size="sm"
                            align="right"
                        />
                    </div>
                </div>

                {/* Earned total */}
                <div className="rounded-[22px] p-5" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${bdr}` }}>
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.07em] opacity-55" style={{ color: theme.colors.textSecondary }}>
                            Earned This Period
                        </p>
                        <span
                            className="text-[0.625rem] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ color: theme.colors.textSecondary, backgroundColor: isDark ? 'rgba(255,255,255,0.085)' : theme.colors.border }}
                        >
                            {CURRENT_USER.roleLabel} · {rateLabel}
                        </span>
                    </div>
                    <p className="text-3xl font-black tabular-nums mt-1" style={{ color: theme.colors.textPrimary }}>
                        {formatCurrency(periodTotal)}
                    </p>
                </div>

                {/* Contributing orders */}
                <div className="rounded-[22px] p-5" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${bdr}` }}>
                    <p className="text-[0.6875rem] font-bold uppercase tracking-[0.07em] opacity-55 mb-1" style={{ color: theme.colors.textSecondary }}>
                        Contributing Orders
                    </p>
                    {sortedEntries.length > 0 ? (
                        <div className="divide-y" style={{ borderColor: bdr }}>
                            {sortedEntries.map((entry) => (
                                <RewardRow key={entry.orderNumber} entry={entry} theme={theme} borderColor={bdr} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm py-3" style={{ color: theme.colors.textSecondary }}>No rewards earned this period.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
