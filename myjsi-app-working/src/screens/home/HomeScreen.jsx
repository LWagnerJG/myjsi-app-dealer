// HomeScreen with comprehensive dealer dashboard
import React, { useState, useMemo } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Plus, Briefcase, Package, Users, TrendingUp, Bell, Calendar, ChevronRight, Search, ArrowUpRight } from 'lucide-react';

// --- Shared Components ---

// A unified "Widget Card" to ensure 100% consistency in shape and feel
const WidgetCard = ({ children, className = "", onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 transition-all duration-300 hover:shadow-md ${onClick ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : ''} ${className}`}
    >
        {children}
    </div>
);

// 1. Header Section
const Header = ({ theme, onNavigate, onAskAI, onVoiceActivate }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6 px-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Good Morning, Luke</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={() => onNavigate('settings')}
                    className="w-12 h-12 rounded-full bg-gray-100 border-4 border-white shadow-sm overflow-hidden transition-transform hover:scale-105"
                >
                    <img src="https://i.pravatar.cc/150?u=luke" alt="Profile" className="w-full h-full object-cover" />
                </button>
            </div>

            {/* Search Pill */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Ask anything..."
                    className="w-full pl-14 pr-14 py-5 rounded-[2rem] bg-white text-gray-900 placeholder-gray-400 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-none outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && onAskAI(e.target.value)}
                />
                <button
                    onClick={() => onVoiceActivate()}
                    className="absolute inset-y-2 right-2 aspect-square rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </button>
            </div>
        </div>
    );
};

// 2. Consolidated Overview Widget (Replaces clunky separate cards)
const OverviewWidget = ({ opportunities = [], orders = [], onNavigate }) => {
    const stats = useMemo(() => {
        const pipeline = opportunities
            .filter(o => o.stage !== 'Won' && o.stage !== 'Lost')
            .reduce((sum, o) => sum + (typeof o.value === 'string' ? parseFloat(o.value.replace(/[^0-9.]/g, '')) || 0 : o.value || 0), 0);

        const activeProjects = opportunities.filter(o => o.stage !== 'Won' && o.stage !== 'Lost').length;

        return {
            pipeline: `$${(pipeline / 1000).toFixed(0)}k`,
            projects: activeProjects,
            orders: orders.length
        };
    }, [opportunities, orders]);

    return (
        <WidgetCard className="mb-6 !p-0 overflow-hidden bg-[#F5F5F7]">
            <div className="p-6 pb-0 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Overview</h2>
                <button onClick={() => onNavigate('sales')} className="text-xs font-bold text-gray-500 hover:text-gray-900">View Report</button>
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-200/50 mt-4">
                <button onClick={() => onNavigate('sales')} className="p-6 text-center hover:bg-black/5 transition-colors">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stats.pipeline}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pipeline</div>
                </button>
                <button onClick={() => onNavigate('projects')} className="p-6 text-center hover:bg-black/5 transition-colors">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stats.projects}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Projects</div>
                </button>
                <button onClick={() => onNavigate('orders')} className="p-6 text-center hover:bg-black/5 transition-colors">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stats.orders}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Orders</div>
                </button>
            </div>
        </WidgetCard>
    );
};

// 3. Unified Action Center (Notifications + Tasks in one list)
const ActionCenterWidget = ({ onNavigate }) => {
    const items = [
        { id: 1, type: 'urgent', title: '2 Orders Pending', subtitle: 'Requires approval', icon: Bell, color: 'text-red-500', bg: 'bg-red-50' },
        { id: 2, type: 'task', title: 'Follow up: Startup Space', subtitle: 'Expected PO: 30 Days', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 3, type: 'task', title: 'Review: Medical Wing', subtitle: 'New drawings available', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    return (
        <WidgetCard className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Action Center</h2>
                <span className="flex h-2 w-2 rounded-full bg-red-500" />
            </div>

            <div className="space-y-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onNavigate('tasks')}
                        className="group flex items-center gap-4 p-3 -mx-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 truncate">{item.title}</h3>
                            <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                ))}
            </div>
        </WidgetCard>
    );
};

// 4. Quick Access Grid (Consistent shape)
const QuickAccessWidget = ({ onNavigate }) => {
    const actions = [
        { label: 'New Project', route: 'new-lead', icon: Plus },
        { label: 'Directory', route: 'resources/dealer-directory', icon: Users },
        { label: 'Samples', route: 'samples', icon: Package },
        { label: 'Catalog', route: 'products', icon: Briefcase },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 mb-8">
            {actions.map((action, i) => (
                <WidgetCard
                    key={i}
                    onClick={() => onNavigate(action.route)}
                    className="flex items-center gap-4 !p-4"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{action.label}</span>
                </WidgetCard>
            ))}
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
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-[#FAFAFA]">
            <div className="px-6 pt-8 pb-24 max-w-lg mx-auto w-full">

                <Header
                    theme={theme}
                    onNavigate={onNavigate}
                    onAskAI={onAskAI}
                    onVoiceActivate={onVoiceActivate}
                />

                <OverviewWidget
                    opportunities={opportunities}
                    orders={orders}
                    onNavigate={onNavigate}
                />

                <ActionCenterWidget
                    onNavigate={onNavigate}
                />

                <QuickAccessWidget
                    onNavigate={onNavigate}
                />

            </div>
        </div>
    );
};
