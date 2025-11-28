// HomeScreen with comprehensive dealer dashboard
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { MENU_ITEMS, allApps, DEFAULT_HOME_APPS } from '../../data.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../components/common/SearchInput.jsx';
import { DropdownPortal } from '../../DropdownPortal.jsx';
import { Plus, Briefcase, Package, Users, TrendingUp, DollarSign, ArrowRight, Bell, Calendar, CheckCircle, ChevronRight, Search } from 'lucide-react';

// 1. Minimalist Header with integrated Search
const HeroSection = ({ theme, onNavigate, onAskAI, onVoiceActivate }) => {
    return (
        <div className="mb-8 md:mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                        Good Morning, Luke
                    </h1>
                    <p className="text-sm font-medium mt-1 opacity-50" style={{ color: theme.colors.textSecondary }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={() => onNavigate('settings')}
                    className="hidden md:block w-12 h-12 rounded-full overflow-hidden border-2 transition-transform hover:scale-105"
                    style={{ borderColor: theme.colors.border }}
                >
                    <img src="https://i.pravatar.cc/150?u=luke" alt="Profile" className="w-full h-full object-cover" />
                </button>
            </div>

            {/* Simplified Search - Premium Feel */}
            <div className="relative group max-w-3xl">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 opacity-30" style={{ color: theme.colors.textPrimary }} />
                </div>
                <input
                    type="text"
                    placeholder="Ask anything..."
                    className="w-full pl-12 pr-12 py-4 rounded-2xl text-base transition-all outline-none border"
                    style={{
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.textPrimary,
                        boxShadow: '0 2px 10px -1px rgba(0,0,0,0.03)',
                        borderColor: 'transparent'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.colors.accent}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                    onKeyDown={(e) => e.key === 'Enter' && onAskAI(e.target.value)}
                />
                <div className="absolute inset-y-0 right-4 flex items-center">
                    <button onClick={() => onVoiceActivate()} className="p-2 rounded-full hover:bg-black/5 transition-colors opacity-50 hover:opacity-100">
                        <div className="w-2 h-2 rounded-full bg-current" style={{ color: theme.colors.textPrimary }} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. Responsive Stats (Scroll on Mobile, Grid on Desktop)
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
        <div className="mb-10">
            {/* Mobile: Horizontal Scroll | Desktop: 4-Column Grid */}
            <div className="flex overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide md:grid md:grid-cols-4 md:gap-6 md:mx-0 md:pb-0 md:px-0 snap-x">
                {stats.map((stat, i) => (
                    <button
                        key={i}
                        onClick={() => onNavigate(stat.route)}
                        className="snap-start min-w-[160px] flex-1 p-5 rounded-2xl text-left transition-all hover:-translate-y-1 border border-transparent hover:border-opacity-10 group"
                        style={{
                            backgroundColor: theme.colors.surface,
                            boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)',
                        }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-xs font-bold uppercase tracking-wider opacity-40" style={{ color: theme.colors.textSecondary }}>
                                {stat.label}
                            </p>
                            <stat.icon className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: theme.colors.textPrimary }} />
                        </div>
                        <p className="text-2xl md:text-3xl font-light tracking-tight" style={{ color: theme.colors.textPrimary }}>
                            {stat.value}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};

// 3. Unified "Focus Center" - Minimalist List
const FocusCenter = ({ theme, onNavigate }) => {
    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>Focus Center</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Urgent Item - Subtle Alert */}
                <div className="p-5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all hover:shadow-md border-l-4"
                    style={{
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.accent, // Use brand accent instead of red
                        boxShadow: '0 2px 12px -2px rgba(0,0,0,0.03)'
                    }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${theme.colors.accent}15` }}>
                        <Bell className="w-5 h-5" style={{ color: theme.colors.accent }} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>2 Orders Pending</h3>
                        <p className="text-xs opacity-60 mt-0.5" style={{ color: theme.colors.textSecondary }}>Awaiting your approval</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30" style={{ color: theme.colors.textPrimary }} />
                </div>

                {/* Task Item */}
                <div className="p-5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all hover:shadow-md border border-transparent hover:border-opacity-10"
                    style={{
                        backgroundColor: theme.colors.surface,
                        boxShadow: '0 2px 12px -2px rgba(0,0,0,0.03)'
                    }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: theme.colors.background }}>
                        <Calendar className="w-5 h-5 opacity-60" style={{ color: theme.colors.textPrimary }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold truncate" style={{ color: theme.colors.textPrimary }}>Follow up: Startup Space</h3>
                        <p className="text-xs opacity-60 mt-0.5 truncate" style={{ color: theme.colors.textSecondary }}>Expected PO: Within 30 Days</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 4. Monochrome Quick Actions
const QuickActionsStrip = ({ theme, onNavigate }) => {
    const actions = [
        { label: 'New Project', route: 'new-lead', icon: Plus },
        { label: 'Directory', route: 'resources/dealer-directory', icon: Users },
        { label: 'Samples', route: 'samples', icon: Package },
        { label: 'Catalog', route: 'products', icon: Briefcase },
    ];

    return (
        <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 opacity-40" style={{ color: theme.colors.textSecondary }}>Quick Access</h2>
            <div className="grid grid-cols-4 gap-3 md:gap-6">
                {actions.map((action, i) => (
                    <button
                        key={i}
                        onClick={() => onNavigate(action.route)}
                        className="flex flex-col items-center gap-3 group p-4 rounded-2xl transition-all hover:bg-black/5"
                    >
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border"
                            style={{
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border
                            }}>
                            <action.icon className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100" style={{ color: theme.colors.textPrimary }} />
                        </div>
                        <span className="text-[10px] md:text-xs font-semibold text-center opacity-60 group-hover:opacity-100" style={{ color: theme.colors.textPrimary }}>
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
