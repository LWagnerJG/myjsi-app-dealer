// HomeScreen with responsive dealer dashboard
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { allApps, QUICK_ACCESS_APPS, DEFAULT_QUICK_ACCESS_IDS } from '../../data.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../components/common/SearchInput.jsx';
import { DropdownPortal } from '../../DropdownPortal.jsx';
import { Briefcase, Package, ArrowRight, Settings, X, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { useIsDesktop } from '../../hooks/useResponsive.js';
import { 
    Button, 
    SectionHeader, 
    SkeletonQuickAccess, 
    SkeletonStat, 
    SkeletonList,
    DESIGN_TOKENS 
} from '../../design-system/index.js';

// Constants
const MAX_QUICK_ACCESS_APPS = 9;

// Dashboard Stats Component - Desktop only with clickable cards
const DashboardStats = ({ theme, opportunities = [], orders = [], onNavigate, isDesktop }) => {
    const stats = useMemo(() => {
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);
        
        const ytdSales = orders
            .filter(o => {
                const status = (o.status || '').toLowerCase();
                const isShipped = status.includes('ship') || status === 'shipping';
                if (!isShipped || !o.date) return false;
                return new Date(o.date) >= yearStart;
            })
            .reduce((sum, o) => sum + (o.net || 0), 0);

        const activeProjects = opportunities.filter(o => o.stage !== 'Won' && o.stage !== 'Lost').length;
        const wonProjects = opportunities.filter(o => o.stage === 'Won').length;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentOrders = orders.filter(o => {
            if (!o.date) return false;
            return new Date(o.date) >= thirtyDaysAgo;
        }).length;

        const ytdTrend = 12;

        return { ytdSales, activeProjects, wonProjects, recentOrders, ytdTrend };
    }, [opportunities, orders]);

    if (!isDesktop) return null;

    const statCards = [
        { label: 'YTD Sales', value: `$${stats.ytdSales.toLocaleString()}`, accent: true, trend: stats.ytdTrend, route: 'orders', subtitle: 'Shipped orders' },
        { label: 'Active Projects', value: stats.activeProjects, route: 'projects', subtitle: 'In pipeline' },
        { label: 'Won Projects', value: stats.wonProjects, route: 'projects', subtitle: 'This year' },
        { label: 'Recent Orders', value: stats.recentOrders, route: 'orders', subtitle: 'Last 30 days' }
    ];

    return (
        <div className="grid grid-cols-4 gap-3 mb-4">
            {statCards.map(stat => (
                <button key={stat.label} onClick={() => onNavigate(stat.route)} className="text-left transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <GlassCard theme={theme} className="p-4 h-full" variant="elevated">
                        <div className="flex items-start justify-between">
                            <p className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>{stat.label}</p>
                            {stat.trend && (
                                <div className="flex items-center gap-0.5">
                                    {stat.trend > 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                                    <span className={`text-[10px] font-semibold ${stat.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>{stat.trend > 0 ? '+' : ''}{stat.trend}%</span>
                                </div>
                            )}
                        </div>
                        <p className="text-2xl font-bold mt-1" style={{ color: stat.accent ? theme.colors.accent : theme.colors.textPrimary }}>{stat.value}</p>
                        {stat.subtitle && <p className="text-[10px] mt-0.5" style={{ color: theme.colors.textSecondary }}>{stat.subtitle}</p>}
                    </GlassCard>
                </button>
            ))}
        </div>
    );
};

// Quick Access Grid Component
const QuickAccessGrid = ({ theme, onNavigate, activeAppIds, onCustomize }) => {
    const activeApps = useMemo(() => {
        return QUICK_ACCESS_APPS.filter(app => activeAppIds.includes(app.id)).slice(0, MAX_QUICK_ACCESS_APPS);
    }, [activeAppIds]);

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-sm" style={{ color: theme.colors.textSecondary }}>Quick Access</h3>
                <button onClick={onCustomize} className="p-1.5 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ color: theme.colors.textSecondary }} title="Customize">
                    <Settings className="w-4 h-4" />
                </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {activeApps.map(app => (
                    <button key={app.id} onClick={() => onNavigate(app.route)} className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: theme.colors.surface, boxShadow: `0 2px 8px ${theme.colors.shadow}`, border: `1px solid ${theme.colors.border}` }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${theme.colors.accent}12` }}>
                            <app.icon className="w-5 h-5" style={{ color: theme.colors.accent }} />
                        </div>
                        <span className="text-xs font-medium text-center leading-tight" style={{ color: theme.colors.textPrimary }}>{app.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Customize Home Modal Component
const CustomizeHomeModal = ({ theme, isOpen, onClose, activeAppIds, onSave }) => {
    const [selectedIds, setSelectedIds] = useState(activeAppIds);

    useEffect(() => {
        if (isOpen) setSelectedIds(activeAppIds);
    }, [activeAppIds, isOpen]);

    const allAppsForSelection = QUICK_ACCESS_APPS;
    const selectedCount = selectedIds.length;
    const canAddMore = selectedCount < MAX_QUICK_ACCESS_APPS;

    const toggleApp = (appId) => {
        setSelectedIds(prev => {
            const isSelected = prev.includes(appId);
            if (isSelected) {
                if (prev.length <= 1) return prev;
                return prev.filter(id => id !== appId);
            } else {
                if (prev.length >= MAX_QUICK_ACCESS_APPS) return prev;
                return [...prev, appId];
            }
        });
    };

    // Auto-save and close when clicking backdrop
    const handleBackdropClick = () => { onSave(selectedIds); onClose(); };
    const handleReset = () => { setSelectedIds(DEFAULT_QUICK_ACCESS_IDS); };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleBackdropClick}>
            <div className="w-full max-w-lg rounded-t-3xl max-h-[70vh] overflow-hidden flex flex-col mb-0" style={{ backgroundColor: theme.colors.background, paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.colors.border }}>
                    <div>
                        <h2 className="text-base font-bold" style={{ color: theme.colors.textPrimary }}>Customize Quick Access</h2>
                        <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{selectedCount} of {MAX_QUICK_ACCESS_APPS} apps selected</p>
                    </div>
                    <button onClick={handleBackdropClick} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
                        <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 pb-6">
                    <div className="grid grid-cols-3 gap-2.5">
                        {allAppsForSelection.map(app => {
                            const isActive = selectedIds.includes(app.id);
                            const isDisabled = !isActive && !canAddMore;
                            return (
                                <button key={app.id} onClick={() => !isDisabled && toggleApp(app.id)} disabled={isDisabled} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all relative" style={{ backgroundColor: isActive ? `${theme.colors.accent}10` : theme.colors.surface, border: `1.5px solid ${isActive ? theme.colors.accent : theme.colors.border}`, opacity: isDisabled ? 0.4 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}>
                                    {isActive && <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.accent }}><Check className="w-2.5 h-2.5 text-white" /></div>}
                                    <app.icon className="w-5 h-5" style={{ color: isActive ? theme.colors.accent : theme.colors.textSecondary }} />
                                    <span className="text-[10px] font-medium text-center leading-tight" style={{ color: isActive ? theme.colors.accent : theme.colors.textPrimary }}>{app.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="p-4 border-t flex gap-3" style={{ borderColor: theme.colors.border }}>
                    <button onClick={handleReset} className="flex-1 py-3 rounded-full font-semibold text-sm transition-all active:scale-[0.98]" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary }}>Reset</button>
                    <button onClick={handleBackdropClick} className="flex-1 py-3 rounded-full font-bold text-sm transition-all active:scale-[0.98]" style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}>Done</button>
                </div>
            </div>
        </div>
    );
};

// Recent Activity Feed Component
const RecentActivityFeed = ({ theme, opportunities = [], orders = [], onNavigate }) => {
    const activities = useMemo(() => {
        const items = [];
        opportunities.slice(0, 3).forEach(opp => {
            items.push({ type: 'project', title: opp.name || opp.project || 'Untitled Project', subtitle: `${opp.customer || opp.company || 'Unknown'} • ${opp.stage || 'Discovery'}`, value: opp.value || '$0', action: () => onNavigate('projects'), icon: Briefcase, color: theme.colors.accent });
        });
        const sortedOrders = [...orders].filter(o => o.date && o.net).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 2);
        sortedOrders.forEach(order => {
            items.push({ type: 'order', title: `PO #${order.po || order.orderNumber}`, subtitle: order.details || order.company || 'Order', value: `$${(order.net || 0).toLocaleString()}`, action: () => onNavigate(`orders/${order.orderNumber || order.po}`), icon: Package, color: '#10B981' });
        });
        return items.slice(0, 5);
    }, [opportunities, orders, theme.colors.accent, onNavigate]);

    if (activities.length === 0) return null;

    return (
        <GlassCard theme={theme} className="p-4 mb-4" variant="elevated">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm" style={{ color: theme.colors.textSecondary }}>Recent Activity</h3>
                <button onClick={() => onNavigate('projects')} className="text-xs font-medium flex items-center gap-1" style={{ color: theme.colors.accent }}>View All<ArrowRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-2">
                {activities.map((activity, i) => (
                    <button key={i} onClick={activity.action} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${activity.color}15` }}><activity.icon className="w-4 h-4" style={{ color: activity.color }} /></div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" style={{ color: theme.colors.textPrimary }}>{activity.title}</p>
                            <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>{activity.subtitle}</p>
                        </div>
                        <p className="font-semibold text-sm flex-shrink-0" style={{ color: activity.color }}>{activity.value}</p>
                    </button>
                ))}
            </div>
        </GlassCard>
    );
};

// Smart Search Component
const SmartSearch = ({ theme, onNavigate, onAskAI, onVoiceActivate }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const anchorRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

    const filtered = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return allApps.filter(app => app.name.toLowerCase().includes(q) || (app.keywords || []).some(k => k.toLowerCase().includes(q))).slice(0, 6);
    }, [query]);

    const submit = useCallback((q) => { if (q.trim()) { onAskAI(q); setQuery(''); } }, [onAskAI]);

    const updatePos = useCallback(() => {
        if (!anchorRef.current) return;
        const rect = anchorRef.current.getBoundingClientRect();
        setPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    }, []);

    useEffect(() => {
        if (!isFocused) return;
        updatePos();
        window.addEventListener('resize', updatePos);
        return () => window.removeEventListener('resize', updatePos);
    }, [isFocused, updatePos]);

    return (
        <div ref={anchorRef} className="relative mb-4">
            <GlassCard theme={theme} variant="elevated" className="w-full px-4" style={{ borderRadius: 9999, paddingTop: 0, paddingBottom: 0 }}>
                <HomeSearchInput onSubmit={submit} value={query} onChange={setQuery} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} onVoiceClick={() => onVoiceActivate('Voice Activated')} theme={theme} className="w-full" />
            </GlassCard>
            {isFocused && filtered.length > 0 && (
                <DropdownPortal>
                    <div className="absolute" style={{ top: pos.top, left: pos.left, width: pos.width, zIndex: 10000 }}>
                        <GlassCard theme={theme} className="p-1" variant="elevated">
                            <ul className="max-h-64 overflow-y-auto scrollbar-hide">
                                {filtered.map((app) => (
                                    <li key={app.route} onMouseDown={() => { onNavigate(app.route); setQuery(''); setIsFocused(false); }} className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.99]" style={{ color: theme.colors.textPrimary }}>
                                        <app.icon className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                        <span className="text-sm">{app.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    </div>
                </DropdownPortal>
            )}
        </div>
    );
};

// Main HomeScreen Component
export const HomeScreen = ({ theme, onNavigate, onAskAI, onVoiceActivate, opportunities = [], orders = [], customerDirectory = [] }) => {
    const isDesktop = useIsDesktop();
    
    const [activeAppIds, setActiveAppIds] = useState(() => {
        try {
            const saved = localStorage.getItem('quickAccessApps');
            return saved ? JSON.parse(saved) : DEFAULT_QUICK_ACCESS_IDS;
        } catch {
            return DEFAULT_QUICK_ACCESS_IDS;
        }
    });
    
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('quickAccessApps', JSON.stringify(activeAppIds));
    }, [activeAppIds]);

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 pt-4 pb-8">
                {isDesktop && (
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>Dashboard</h1>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                )}

                <SmartSearch theme={theme} onNavigate={onNavigate} onAskAI={onAskAI} onVoiceActivate={onVoiceActivate} />

                <QuickAccessGrid theme={theme} onNavigate={onNavigate} activeAppIds={activeAppIds} onCustomize={() => setIsCustomizeOpen(true)} />

                <DashboardStats theme={theme} opportunities={opportunities} orders={orders} onNavigate={onNavigate} isDesktop={isDesktop} />

                <RecentActivityFeed theme={theme} opportunities={opportunities} orders={orders} onNavigate={onNavigate} />
            </div>

            <CustomizeHomeModal theme={theme} isOpen={isCustomizeOpen} onClose={() => setIsCustomizeOpen(false)} activeAppIds={activeAppIds} onSave={setActiveAppIds} />
        </div>
    );
};
