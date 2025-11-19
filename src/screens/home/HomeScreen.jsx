// HomeScreen with dealer dashboard improvements
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { MENU_ITEMS, allApps, DEFAULT_HOME_APPS } from '../../data.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../components/common/SearchInput.jsx';
import { DropdownPortal } from '../../DropdownPortal.jsx';
import { Plus, Briefcase, Package, Users, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';

// Dashboard Stats Component
const DashboardStats = ({ theme, opportunities = [], orders = [], customerDirectory = [] }) => {
    const stats = useMemo(() => {
        const pipelineValue = opportunities
            .filter(o => o.stage !== 'Won' && o.stage !== 'Lost')
            .reduce((sum, o) => {
                const val = typeof o.value === 'string' 
                    ? parseFloat(o.value.replace(/[^0-9.]/g, '')) || 0
                    : o.value || 0;
                return sum + val;
            }, 0);

        const activeProjects = opportunities.filter(o => 
            o.stage !== 'Won' && o.stage !== 'Lost'
        ).length;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentOrders = orders.filter(o => {
            if (!o.date) return false;
            const date = new Date(o.date);
            return date >= thirtyDaysAgo;
        }).length;

        const activeCustomers = customerDirectory.filter(c => 
            (c.projects?.length || 0) > 0
        ).length;

        return { pipelineValue, activeProjects, recentOrders, activeCustomers };
    }, [opportunities, orders, customerDirectory]);

    return (
        <div className="grid grid-cols-2 gap-3 mb-4">
            <GlassCard theme={theme} className="p-4" variant="elevated">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>
                    Pipeline Value
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.colors.accent }}>
                    ${stats.pipelineValue.toLocaleString()}
                </p>
            </GlassCard>
            
            <GlassCard theme={theme} className="p-4" variant="elevated">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>
                    Active Projects
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                    {stats.activeProjects}
                </p>
            </GlassCard>
            
            <GlassCard theme={theme} className="p-4" variant="elevated">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>
                    Orders (30d)
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                    {stats.recentOrders}
                </p>
            </GlassCard>
            
            <GlassCard theme={theme} className="p-4" variant="elevated">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>
                    Active Customers
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                    {stats.activeCustomers}
                </p>
            </GlassCard>
        </div>
    );
};

// Quick Actions Component
const QuickActions = ({ theme, onNavigate }) => {
    const actions = [
        { label: 'New Project', route: 'new-lead', icon: Plus, color: theme.colors.accent },
        { label: 'View Customers', route: 'resources/customer-directory', icon: Users, color: '#10B981' },
        { label: 'Check Orders', route: 'orders', icon: Package, color: '#F59E0B' },
        { label: 'Request Samples', route: 'samples', icon: Package, color: '#8B5CF6' },
    ];

    return (
        <div className="mb-4">
            <h3 className="font-bold text-base mb-3 px-1" style={{ color: theme.colors.textPrimary }}>
                Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map(action => (
                    <button
                        key={action.route}
                        onClick={() => onNavigate(action.route)}
                        className="p-4 rounded-2xl flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                        style={{ 
                            backgroundColor: `${action.color}15`,
                            border: `1px solid ${action.color}30`
                        }}
                    >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center"
                             style={{ backgroundColor: action.color }}>
                            <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-center" style={{ color: action.color }}>
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Recent Activity Feed Component
const RecentActivityFeed = ({ theme, opportunities = [], orders = [], onNavigate }) => {
    const activities = useMemo(() => {
        const items = [];
        
        // Recent opportunities (limit 3)
        opportunities.slice(0, 3).forEach(opp => {
            items.push({
                type: 'project',
                title: opp.name || opp.project || 'Untitled Project',
                subtitle: `${opp.customer || opp.company || 'Unknown'} • ${opp.stage || 'Discovery'}`,
                value: opp.value || '$0',
                time: 'Today',
                action: () => onNavigate('projects'),
                icon: Briefcase,
                color: theme.colors.accent
            });
        });
        
        // Recent orders (limit 2)
        const sortedOrders = [...orders]
            .filter(o => o.date && o.net)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 2);
            
        sortedOrders.forEach(order => {
            items.push({
                type: 'order',
                title: `PO #${order.po || order.orderNumber}`,
                subtitle: order.details || order.company || 'Order',
                value: `$${(order.net || 0).toLocaleString()}`,
                time: order.date ? new Date(order.date).toLocaleDateString() : 'Recent',
                action: () => onNavigate(`orders/${order.orderNumber || order.po}`),
                icon: Package,
                color: '#10B981'
            });
        });
        
        return items.slice(0, 5);
    }, [opportunities, orders, theme.colors.accent, onNavigate]);

    if (activities.length === 0) return null;

    return (
        <GlassCard theme={theme} className="p-4 mb-4" variant="elevated">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>
                    Recent Activity
                </h3>
                <button 
                    onClick={() => onNavigate('projects')}
                    className="text-xs font-semibold flex items-center gap-1" 
                    style={{ color: theme.colors.accent }}
                >
                    View All
                    <ArrowRight className="w-3 h-3" />
                </button>
            </div>
            
            <div className="space-y-3">
                {activities.map((activity, i) => (
                    <button
                        key={i}
                        onClick={activity.action}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                    >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" 
                             style={{ backgroundColor: `${activity.color}20` }}>
                            <activity.icon className="w-5 h-5" style={{ color: activity.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                                {activity.title}
                            </p>
                            <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>
                                {activity.subtitle}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="font-bold text-sm" style={{ color: activity.color }}>
                                {activity.value}
                            </p>
                            <p className="text-[10px]" style={{ color: theme.colors.textSecondary }}>
                                {activity.time}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </GlassCard>
    );
};

// Top Customers Widget Component
const TopCustomersWidget = ({ theme, customerDirectory = [], onNavigate }) => {
    const topCustomers = useMemo(() => {
        return [...customerDirectory]
            .sort((a, b) => (b.sales || 0) - (a.sales || 0))
            .slice(0, 5);
    }, [customerDirectory]);

    if (topCustomers.length === 0) return null;

    return (
        <GlassCard theme={theme} className="p-4 mb-4" variant="elevated">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>
                    Top Customers
                </h3>
                <button 
                    onClick={() => onNavigate('customer-rank')}
                    className="text-xs font-semibold flex items-center gap-1" 
                    style={{ color: theme.colors.accent }}
                >
                    View All
                    <ArrowRight className="w-3 h-3" />
                </button>
            </div>
            
            <div className="space-y-2">
                {topCustomers.map((customer, i) => (
                    <button
                        key={customer.id}
                        onClick={() => onNavigate('resources/customer-directory')}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                                 style={{ 
                                     backgroundColor: i < 3 ? `${theme.colors.accent}20` : theme.colors.subtle,
                                     color: i < 3 ? theme.colors.accent : theme.colors.textSecondary
                                 }}>
                                {i + 1}
                            </div>
                            <div className="text-left min-w-0">
                                <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                                    {customer.name}
                                </p>
                                {customer.type && (
                                    <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>
                                        {customer.type}
                                    </p>
                                )}
                            </div>
                        </div>
                        <p className="font-bold text-sm flex-shrink-0" style={{ color: theme.colors.accent }}>
                            ${(customer.sales || 0).toLocaleString()}
                        </p>
                    </button>
                ))}
            </div>
        </GlassCard>
    );
};

// Smart Search Component (kept from original)
const SmartSearch = ({ theme, onNavigate, onAskAI, onVoiceActivate }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const anchorRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

    const updatePos = useCallback(() => {
        if (!anchorRef.current) return;
        const r = anchorRef.current.getBoundingClientRect();
        setPos({ top: r.bottom + window.scrollY + 8, left: r.left + window.scrollX, width: r.width });
    }, []);

    useEffect(() => {
        if (!isFocused) return;
        updatePos();
        const onResize = () => updatePos();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [isFocused, updatePos]);

    useEffect(() => {
        const term = query.trim().toLowerCase();
        setFiltered(
            isFocused && term
                ? allApps.filter(a => a.name.toLowerCase().includes(term)).sort((a, b) => a.name.localeCompare(b.name))
                : []
        );
    }, [query, isFocused]);

    useEffect(() => {
        const close = (e) => {
            if (anchorRef.current && !anchorRef.current.contains(e.target)) setIsFocused(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (query.trim() && filtered.length === 0) {
            onAskAI(query);
            setQuery('');
            setIsFocused(false);
        }
    };

    return (
        <div ref={anchorRef} className="relative">
            <GlassCard theme={theme} variant="elevated" className="w-full px-4" style={{ borderRadius: 9999, paddingTop: 0, paddingBottom: 0 }}>
                <HomeSearchInput
                    onSubmit={submit}
                    value={query}
                    onChange={setQuery}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onVoiceClick={() => onVoiceActivate('Voice Activated')}
                    theme={theme}
                    className="w-full"
                />
            </GlassCard>

            {isFocused && filtered.length > 0 && (
                <DropdownPortal>
                    <div className="absolute" style={{ top: pos.top, left: pos.left, width: pos.width, zIndex: 10000 }}>
                        <GlassCard theme={theme} className="p-1" variant="elevated">
                            <ul className="max-h-64 overflow-y-auto scrollbar-hide">
                                {filtered.map((app) => (
                                    <li
                                        key={app.route}
                                        onMouseDown={() => {
                                            onNavigate(app.route);
                                            setQuery('');
                                            setIsFocused(false);
                                        }}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.99]"
                                        style={{ color: theme.colors.textPrimary }}
                                    >
                                        <app.icon className="w-[18px] h-[18px]" style={{ color: theme.colors.textSecondary }} />
                                        <span className="text-[15px]">{app.name}</span>
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
export const HomeScreen = ({ 
    theme, 
    onNavigate, 
    onAskAI, 
    onVoiceActivate, 
    homeApps,
    opportunities = [],
    orders = [],
    customerDirectory = []
}) => {
    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 pt-4 pb-8 space-y-4">
                {/* Welcome Header */}
                <div className="mb-2">
                    <h1 className="text-3xl font-bold" style={{ color: theme.colors.textPrimary }}>
                        Dashboard
                    </h1>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>

                {/* Search */}
                <SmartSearch 
                    theme={theme} 
                    onNavigate={onNavigate} 
                    onAskAI={onAskAI} 
                    onVoiceActivate={onVoiceActivate} 
                />

                {/* Dashboard Stats */}
                <DashboardStats 
                    theme={theme} 
                    opportunities={opportunities}
                    orders={orders}
                    customerDirectory={customerDirectory}
                />

                {/* Quick Actions */}
                <QuickActions theme={theme} onNavigate={onNavigate} />

                {/* Recent Activity */}
                <RecentActivityFeed 
                    theme={theme}
                    opportunities={opportunities}
                    orders={orders}
                    onNavigate={onNavigate}
                />

                {/* Top Customers */}
                <TopCustomersWidget
                    theme={theme}
                    customerDirectory={customerDirectory}
                    onNavigate={onNavigate}
                />
            </div>
        </div>
    );
};
