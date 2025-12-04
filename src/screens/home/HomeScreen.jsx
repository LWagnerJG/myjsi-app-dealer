import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Plus, Briefcase, Package, Users, TrendingUp, Bell, Calendar, ChevronRight, Search, ArrowUpRight, Clock, AlertCircle, X, Check, BarChart3, Command } from 'lucide-react';

// --- Shared Components ---

const WidgetCard = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 transition-all duration-300 hover:bg-gray-50 ${className}`}
  >
    {children}
  </div>
);

// --- Skeleton Loading State ---
const SkeletonPulse = ({ className = "" }) => (
    <div className={`animate - pulse bg - gray - 100 rounded - 2xl ${ className } `} />
);

const HomeScreenSkeleton = () => (
    <div className="px-6 pt-8 pb-24 w-full max-w-lg lg:max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
            <div className="space-y-2">
                <SkeletonPulse className="h-8 w-48" />
                <SkeletonPulse className="h-4 w-32" />
            </div>
            <SkeletonPulse className="h-12 w-12 rounded-full" />
        </div>
        <SkeletonPulse className="h-14 w-full rounded-[2rem]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonPulse className="h-40 w-full rounded-[2rem]" />
            <SkeletonPulse className="h-40 w-full rounded-[2rem] hidden lg:block" />
            <SkeletonPulse className="h-40 w-full rounded-[2rem] hidden lg:block" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
                <SkeletonPulse className="h-32 w-full rounded-[2rem]" />
                <SkeletonPulse className="h-64 w-full rounded-[2rem]" />
            </div>
            <div className="lg:col-span-4">
                <SkeletonPulse className="h-96 w-full rounded-[2rem]" />
            </div>
        </div>
    </div>
);

// --- 1. Intelligent Command Palette ---
const CommandPalette = ({ isOpen, onClose, onNavigate, query, setQuery }) => {
    if (!isOpen) return null;

    const suggestions = [
        { icon: Package, label: 'Track Order #4500', action: () => onNavigate('orders') },
        { icon: Users, label: 'Find Customer', action: () => onNavigate('resources/dealer-directory') },
        { icon: Plus, label: 'New Project', action: () => onNavigate('new-lead') },
        { icon: BarChart3, label: 'View Sales Report', action: () => onNavigate('sales') },
    ];

    return (
        <div className="absolute top-20 left-0 right-0 z-50 px-6 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="bg-white/90 backdrop-blur-xl border border-black/5 shadow-2xl rounded-[2rem] overflow-hidden max-w-2xl mx-auto">
                <div className="p-2">
                    <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        AI Suggestions
                    </div>
                    {suggestions.map((item, i) => (
                        <button 
                            key={i}
                            onClick={() => { item.action(); onClose(); }}
                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 transition-colors text-left group"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-gray-700">{item.label}</span>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                        </button>
                    ))}
                </div>
                <div className="bg-gray-50 px-6 py-3 text-xs text-gray-400 font-medium border-t border-black/5 flex justify-between">
                    <span>Press Enter to ask AI</span>
                    <span>ESC to close</span>
                </div>
            </div>
        </div>
    );
};

// --- 2. Header with Search Focus ---
const Header = ({ theme, onNavigate, onAskAI, onVoiceActivate }) => {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [query, setQuery] = useState('');

    return (
        <div className="relative mb-8 z-40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className={`transition - opacity duration - 300 ${ isSearchFocused ? 'opacity-50 blur-sm' : 'opacity-100' } `}>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Good Morning, Luke</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="relative group w-full lg:w-96 transition-all duration-300">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Search className={`w - 5 h - 5 transition - colors ${ isSearchFocused ? 'text-black' : 'text-gray-400' } `} />
                    </div>
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        placeholder="Ask anything..." 
                        className={`w - full pl - 14 pr - 14 py - 4 lg: py - 3 rounded - [2rem] bg - white text - gray - 900 placeholder - gray - 400 border - none outline - none transition - all ${ isSearchFocused ? 'shadow-xl ring-2 ring-black/5 scale-105' : 'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]' } `}
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

            <CommandPalette 
                isOpen={isSearchFocused} 
                onClose={() => setIsSearchFocused(false)}
                onNavigate={onNavigate}
                query={query}
                setQuery={setQuery}
            />
        </div>
    );
};

// --- 3. Custom SVG Sales Chart (No Libraries) ---
const SalesChart = () => {
    // Simple mock data for the chart
    const data = [40, 65, 45, 80, 55, 90, 70];
    const max = Math.max(...data);
    
    return (
        <div className="h-48 w-full flex items-end justify-between gap-2 pt-8 px-2">
            {data.map((value, i) => {
                const height = (value / max) * 100;
                return (
                    <div key={i} className="w-full bg-gray-50 rounded-t-xl relative group hover:bg-black/5 transition-colors cursor-pointer">
                        <div 
                            className="absolute bottom-0 left-0 right-0 bg-black rounded-t-xl transition-all duration-500 ease-out group-hover:bg-gray-800"
                            style={{ height: `${ height }% `, opacity: 0.8 }}
                        />
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            ${value}k Sales
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- 4. Responsive Stats Widget ---
const StatsSection = ({ opportunities = [], orders = [], onNavigate }) => {
    const stats = useMemo(() => {
        const pipeline = opportunities
            .filter(o => o.stage !== 'Won' && o.stage !== 'Lost')
            .reduce((sum, o) => sum + (typeof o.value === 'string' ? parseFloat(o.value.replace(/[^0-9.]/g, '')) || 0 : o.value || 0), 0);
        
        const activeProjects = opportunities.filter(o => o.stage !== 'Won' && o.stage !== 'Lost').length;
        
        return { 
            pipeline: `$${ (pipeline / 1000).toFixed(0) } k`,
            projects: activeProjects,
            orders: orders.length
        };
    }, [opportunities, orders]);

    // Mobile View
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

    // Desktop View
    const DesktopView = () => (
        <div className="hidden lg:grid grid-cols-3 gap-6 mb-8">
            <WidgetCard onClick={() => onNavigate('sales')} className="group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            +12% <ArrowUpRight className="w-3 h-3 ml-1" />
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pipeline}</div>
                    <div className="text-sm font-medium text-gray-500">Total Pipeline Value</div>
                </div>
            </WidgetCard>

            <WidgetCard onClick={() => onNavigate('projects')} className="group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Active
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.projects}</div>
                    <div className="text-sm font-medium text-gray-500">Projects in Progress</div>
                </div>
            </WidgetCard>

            <WidgetCard onClick={() => onNavigate('orders')} className="group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                            <Package className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            This Month
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.orders}</div>
                    <div className="text-sm font-medium text-gray-500">Recent Orders</div>
                </div>
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

// --- 5. Interactive Action Center ---
const ActionCenterWidget = ({ onNavigate }) => {
    const [items, setItems] = useState([
        { id: 1, type: 'urgent', title: '2 Orders Pending', subtitle: 'Requires approval', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
        { id: 2, type: 'task', title: 'Follow up: Startup Space', subtitle: 'Expected PO: 30 Days', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 3, type: 'task', title: 'Review: Medical Wing', subtitle: 'New drawings available', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 4, type: 'task', title: 'Call: John Doe', subtitle: 'Discuss Q4 Strategy', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
    ]);

    const dismissItem = (e, id) => {
        e.stopPropagation();
        setItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <WidgetCard className="h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Action Center</h2>
                {items.some(i => i.type === 'urgent') && (
                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
            </div>
            
            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">All caught up! 🎉</div>
                ) : (
                    items.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => onNavigate('tasks')}
                            className="group flex items-center gap-4 p-3 -mx-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all duration-300"
                        >
                            <div className={`w - 12 h - 12 rounded - 2xl ${ item.bg } flex items - center justify - center flex - shrink - 0 transition - transform group - hover: scale - 110`}>
                                <item.icon className={`w - 5 h - 5 ${ item.color } `} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 truncate">{item.title}</h3>
                                <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                            </div>
                            <button 
                                onClick={(e) => dismissItem(e, item.id)}
                                className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 hover:text-green-500 hover:border-green-200 hover:bg-green-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
            
            <button onClick={() => onNavigate('tasks')} className="w-full mt-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                View All Tasks
            </button>
        </WidgetCard>
    );
};

// --- 6. Quick Access ---
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

// --- 7. Recent Projects Table (Desktop Only) ---
const RecentProjectsTable = ({ opportunities = [], onNavigate }) => {
    const projects = opportunities.slice(0, 5);

    return (
        <div className="hidden lg:block">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Recent Projects</h2>
                <button onClick={() => onNavigate('projects')} className="text-xs font-bold text-gray-500 hover:text-gray-900">View All</button>
            </div>
            <WidgetCard className="!p-0 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase">Project Name</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase">Customer</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase">Value</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {projects.length > 0 ? projects.map((p, i) => (
                            <tr key={i} onClick={() => onNavigate('projects')} className="hover:bg-gray-50 cursor-pointer transition-colors">
                                <td className="py-4 px-6 font-bold text-gray-900">{p.name || 'Untitled Project'}</td>
                                <td className="py-4 px-6 text-sm text-gray-500">{p.customer || 'Unknown'}</td>
                                <td className="py-4 px-6 font-bold text-gray-900">{typeof p.value === 'number' ? `$${ p.value.toLocaleString() } ` : p.value || '$0'}</td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                        {p.stage || 'Active'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="py-8 text-center text-gray-400 text-sm">No recent projects found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </WidgetCard>
        </div>
    );
};

// --- Main HomeScreen Component ---
export const HomeScreen = ({ 
    theme, 
    onNavigate, 
    onAskAI, 
    onVoiceActivate, 
    opportunities = [],
    orders = [],
    customerDirectory = []
}) => {
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading state for premium feel
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) return <HomeScreenSkeleton />;

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-[#FAFAFA]">
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

                <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8">
                    
                    {/* Left Column (Main Content) */}
                    <div className="lg:col-span-8 space-y-8">
                        <QuickAccessWidget onNavigate={onNavigate} />
                        
                        {/* Desktop Chart & Table */}
                        <div className="hidden lg:block space-y-8">
                            <div>
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Sales Performance</h2>
                                <WidgetCard>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">$482,000</div>
                                            <div className="text-sm text-gray-500">Total Revenue (YTD)</div>
                                        </div>
                                        <div className="flex gap-2">
                                            {['1W', '1M', '3M', '1Y'].map(period => (
                                                <button key={period} className={`px - 3 py - 1 rounded - lg text - xs font - bold ${ period === '1M' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200' } `}>
                                                    {period}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <SalesChart />
                                </WidgetCard>
                            </div>

                            <RecentProjectsTable opportunities={opportunities} onNavigate={onNavigate} />
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
