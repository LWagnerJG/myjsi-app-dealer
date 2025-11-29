// HomeScreen with comprehensive dealer dashboard
import React, { useState, useMemo } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Plus, Briefcase, Package, Users, TrendingUp, Bell, Calendar, ChevronRight, Search, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';

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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Good Morning, Luke</h1>
                <p className="text-sm text-gray-500 font-medium mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Search Pill - Full width on mobile, fixed width on desktop */}
            <div className="relative group w-full lg:w-96">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Ask anything..."
                    className="w-full pl-14 pr-14 py-4 lg:py-3 rounded-[2rem] bg-white text-gray-900 placeholder-gray-400 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-none outline-none focus:ring-2 focus:ring-black/5 transition-all"
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

// 2. Responsive Stats Widget
const StatsSection = ({ opportunities = [], orders = [], onNavigate }) => {
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

    // Mobile View: Single Consolidated Card
    const MobileView = () => (
        <WidgetCard className="lg:hidden mb-6 !p-0 overflow-hidden bg-[#F5F5F7]">
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

    // Desktop View: 3 Separate Detailed Cards
    const DesktopView = () => (
        <div className="hidden lg:grid grid-cols-3 gap-6 mb-8">
            <WidgetCard onClick={() => onNavigate('sales')} className="group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        +12% <ArrowUpRight className="w-3 h-3 ml-1" />
                    </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pipeline}</div>
                <div className="text-sm font-medium text-gray-500">Total Pipeline Value</div>
            </WidgetCard>

            <WidgetCard onClick={() => onNavigate('projects')} className="group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Active
                    </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.projects}</div>
                <div className="text-sm font-medium text-gray-500">Projects in Progress</div>
            </WidgetCard>

            <WidgetCard onClick={() => onNavigate('orders')} className="group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                        <Package className="w-6 h-6" />
                    </div>
                    <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        This Month
                    </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.orders}</div>
                <div className="text-sm font-medium text-gray-500">Recent Orders</div>
            </WidgetCard>
        </div>
    );

    return (
        <>
            <MobileView />
            <DesktopView />
        </>
    );
};

// 3. Action Center (Sidebar on Desktop)
const ActionCenterWidget = ({ onNavigate }) => {
    const items = [
        { id: 1, type: 'urgent', title: '2 Orders Pending', subtitle: 'Requires approval', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
        { id: 2, type: 'task', title: 'Follow up: Startup Space', subtitle: 'Expected PO: 30 Days', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 3, type: 'task', title: 'Review: Medical Wing', subtitle: 'New drawings available', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 4, type: 'task', title: 'Call: John Doe', subtitle: 'Discuss Q4 Strategy', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    return (
        <WidgetCard className="h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Action Center</h2>
                <span className="flex h-2 w-2 rounded-full bg-red-500" />
            </div>

            <div className="space-y-3">
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

            <button onClick={() => onNavigate('tasks')} className="w-full mt-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                View All Tasks
            </button>
        </WidgetCard>
    );
};

// 4. Responsive Quick Access
const QuickAccessWidget = ({ onNavigate }) => {
    const actions = [
        { label: 'New Project', route: 'new-lead', icon: Plus },
        { label: 'Directory', route: 'resources/dealer-directory', icon: Users },
        { label: 'Samples', route: 'samples', icon: Package },
        { label: 'Catalog', route: 'products', icon: Briefcase },
    ];

    return (
        <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Quick Access</h2>
            {/* Mobile: Grid 2x2 | Desktop: Flex Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map((action, i) => (
                    <WidgetCard
                        key={i}
                        onClick={() => onNavigate(action.route)}
                        className="flex flex-col lg:flex-row items-center gap-3 lg:gap-4 !p-5 text-center lg:text-left hover:border-black/10"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 group-hover:bg-gray-100 transition-colors">
                            <action.icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{action.label}</span>
                    </WidgetCard>
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
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-[#FAFAFA]">
            {/* Main Container: Constrained on mobile, Wide on desktop */}
            <div className="px-6 pt-8 pb-24 w-full max-w-lg lg:max-w-7xl mx-auto">

                <Header
                    theme={theme}
                    onNavigate={onNavigate}
                    onAskAI={onAskAI}
                    onVoiceActivate={onVoiceActivate}
                />

                <StatsSection
                    opportunities={opportunities}
                    orders={orders}
                    onNavigate={onNavigate}
                />

                {/* Desktop Grid Layout */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8">

                    {/* Left Column (Main Content) */}
                    <div className="lg:col-span-8">
                        <QuickAccessWidget onNavigate={onNavigate} />

                        {/* Placeholder for future content (e.g. Recent Projects Table) */}
                        <div className="hidden lg:block">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Recent Activity</h2>
                            <WidgetCard className="h-64 flex items-center justify-center text-gray-400 border-dashed">
                                Activity Feed / Chart Placeholder
                            </WidgetCard>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-4">
                        <ActionCenterWidget onNavigate={onNavigate} />
                    </div>

                </div>
            </div>
        </div>
    );
};
