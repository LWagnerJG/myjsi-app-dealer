// HomeScreen with comprehensive dealer dashboard
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { MENU_ITEMS, allApps, DEFAULT_HOME_APPS } from '../../data.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../components/common/SearchInput.jsx';
import { DropdownPortal } from '../../DropdownPortal.jsx';
import { Plus, Briefcase, Package, Users, TrendingUp, DollarSign, ArrowRight, Bell, Calendar, CheckCircle, ChevronRight, Search } from 'lucide-react';

// --- Redesigned Components ---

// 1. Minimalist Header with integrated Search
const HeroSection = ({ theme, onNavigate, onAskAI, onVoiceActivate }) => {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-end mb-4 px-1">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                        Good Morning, Luke
                    </h1>
                    <p className="text-sm font-medium mt-1 opacity-60" style={{ color: theme.colors.textSecondary }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={() => onNavigate('settings')}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-105"
                    style={{ borderColor: theme.colors.border }}
                >
                    <img src="https://i.pravatar.cc/150?u=luke" alt="Profile" className="w-full h-full object-cover" />
                </button>
            </div>

            {/* Simplified Search */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 opacity-40" style={{ color: theme.colors.textSecondary }} />
                </div>
                <input
                    type="text"
                    placeholder="Search projects, orders, or customers..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm transition-all outline-none border border-transparent focus:border-opacity-50"
                    style={{
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.textPrimary,
                        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
                        borderColor: theme.colors.accent
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && onAskAI(e.target.value)}
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                    <button onClick={() => onVoiceActivate()} className="p-1.5 rounded-full hover:bg-black/5 transition-colors">
                        <div className="w-4 h-4 rounded-full bg-red-500/80 animate-pulse" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. Horizontal Scrollable Stats (Saves vertical space)
const StatsStrip = ({ theme, opportunities = [], orders = [], customerDirectory = [], onNavigate }) => {
    const stats = useMemo(() => {
        const pipelineValue = opportunities
            .filter(o => o.stage !== 'Won' && o.stage !== 'Lost')
            .reduce((sum, o) => {
                const val = typeof o.value === 'string' ? parseFloat(o.value.replace(/[^0-9.]/g, '')) || 0 : o.value || 0;
                return sum + val;
            }, 0);

        const activeProjects = opportunities.filter(o => o.stage !== 'Won' && o.stage !== 'Lost').length;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentOrders = orders.filter(o => o.date && new Date(o.date) >= thirtyDaysAgo).length;

        const activeCustomers = customerDirectory.filter(c => (c.projects?.length || 0) > 0).length;

        return [
            { label: 'Pipeline', value: `$${pipelineValue.toLocaleString()}`, route: 'sales', icon: TrendingUp, color: theme.colors.accent },
            { label: 'Active Projects', value: activeProjects, route: 'projects', icon: Briefcase, color: '#3B82F6' },
            { label: 'Recent Orders', value: recentOrders, route: 'orders', icon: Package, color: '#10B981' },
            { label: 'Customers', value: activeCustomers, route: 'resources/dealer-directory', icon: Users, color: '#F59E0B' },
        ];
    }, [opportunities, orders, customerDirectory, theme]);

    return (
        <div className="mb-8 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide flex gap-3 snap-x">
            {stats.map((stat, i) => (
                <button
                    key={i}
                    onClick={() => onNavigate(stat.route)}
                    className="snap-start min-w-[140px] flex-1 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] border border-transparent hover:border-opacity-20"
                    style={{
                        backgroundColor: theme.colors.surface,
                        boxShadow: '0 4px 12px -2px rgba(0,0,0,0.03)',
                        borderColor: stat.color
                    }}
                >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${stat.color}15` }}>
                        <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                    <p className="text-xs font-semibold opacity-60 mb-0.5" style={{ color: theme.colors.textSecondary }}>
                        {stat.label}
                    </p>
                    <p className="text-lg font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                        {stat.value}
                    </p>
                </button>
            ))}
        </div>
    );
};

// 3. Unified "Focus Center" (Combines Notifications & Tasks)
const FocusCenter = ({ theme, onNavigate }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>Focus Center</h2>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-600">3 Urgent</span>
            </div>

            <div className="space-y-3">
                {/* Urgent Alert */}
                <div className="p-4 rounded-2xl flex items-start gap-4 transition-transform hover:scale-[1.01] cursor-pointer"
                    style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900">2 Orders Pending Approval</h3>
                        <p className="text-xs text-gray-600 mt-1">Requires your immediate acknowledgment to proceed.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400" />
                </div>

                {/* Top Task */}
                <GlassCard theme={theme} className="p-4 flex items-center gap-4 cursor-pointer hover:bg-black/5 transition-colors" variant="elevated">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold truncate" style={{ color: theme.colors.textPrimary }}>Follow up: Startup Collaboration Space</h3>
                        <p className="text-xs opacity-60 truncate" style={{ color: theme.colors.textSecondary }}>Expected PO: Within 30 Days • High Priority</p>
                    </div>
                    <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 transition-colors" style={{ color: theme.colors.textPrimary }}>
                        Done
                    </button>
                </GlassCard>

                {/* Secondary Task */}
                <GlassCard theme={theme} className="p-4 flex items-center gap-4 cursor-pointer hover:bg-black/5 transition-colors" variant="elevated">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold truncate" style={{ color: theme.colors.textPrimary }}>Process order #450080-01</h3>
                        <p className="text-xs opacity-60 truncate" style={{ color: theme.colors.textSecondary }}>Business Furnishings • $55,000</p>
                    </div>
                    <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 transition-colors" style={{ color: theme.colors.textPrimary }}>
                        View
                    </button>
                </GlassCard>
            </div>
        </div>
    );
};

// 4. Clean Quick Actions
const QuickActionsStrip = ({ theme, onNavigate }) => {
    const actions = [
        { label: 'New Project', route: 'new-lead', icon: Plus, color: theme.colors.accent },
        { label: 'Directory', route: 'resources/dealer-directory', icon: Users, color: '#10B981' },
        { label: 'Samples', route: 'samples', icon: Package, color: '#8B5CF6' },
        { label: 'Catalog', route: 'products', icon: Briefcase, color: '#F59E0B' },
    ];

    return (
        <div className="mb-8">
            <h2 className="text-sm font-bold mb-3 px-1 opacity-70" style={{ color: theme.colors.textSecondary }}>Quick Access</h2>
            <div className="grid grid-cols-4 gap-2">
                {actions.map((action, i) => (
                    <button
                        key={i}
                        onClick={() => onNavigate(action.route)}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95 shadow-sm"
                            style={{ backgroundColor: theme.colors.surface }}>
                            <action.icon className="w-6 h-6" style={{ color: action.color }} />
                        </div>
                        <span className="text-[10px] font-semibold text-center opacity-80" style={{ color: theme.colors.textPrimary }}>
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Main HomeScreen Component
export const HomeScreen = ({
    theme,
    onNavigate,
    onAskAI,
    onVoiceActivate,
    opportunities = [],
    orders = [],
    customerDirectory = []
}) => {
    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-5 pt-6 pb-20 max-w-2xl mx-auto w-full">

                <HeroSection
                    theme={theme}
                    onNavigate={onNavigate}
                    onAskAI={onAskAI}
                    onVoiceActivate={onVoiceActivate}
                />

                <StatsStrip
                    theme={theme}
                    opportunities={opportunities}
                    orders={orders}
                    customerDirectory={customerDirectory}
                    onNavigate={onNavigate}
                />

                <FocusCenter
                    theme={theme}
                    onNavigate={onNavigate}
                />

                <QuickActionsStrip
                    theme={theme}
                    onNavigate={onNavigate}
                />

                {/* Subtle Footer Quote or Branding */}
                <div className="text-center opacity-30 mt-8">
                    <p className="text-xs font-medium italic" style={{ color: theme.colors.textSecondary }}>
                        "Design that inspires."
                    </p>
                </div>

            </div>
        </div>
    );
};
