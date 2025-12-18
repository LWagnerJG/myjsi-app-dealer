import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { GlassCard, ScreenLayout } from '../../design-system/index.js';
import { Modal } from '../../components/common/Modal';
import { ChevronLeft, TrendingUp, Building2 } from 'lucide-react';
import { CUSTOMER_RANK_DATA } from './data.js';
import { motion } from 'framer-motion';
import { DESIGN_TOKENS, JSI_COLORS } from '../../design-system/tokens.js';

// This screen shows PROJECT NAMES ranked by sales/bookings
// The dealer's customers (projects) are ranked here

export const CustomerRankingScreen = ({ theme, onNavigate }) => {
    const [tab, setTab] = useState('sales');
    const [modalData, setModalData] = useState(null);

    // Extract all projects from all customers and rank them
    const projectRows = useMemo(() => {
        const allProjects = [];
        
        CUSTOMER_RANK_DATA.forEach(customer => {
            (customer.orders || []).forEach(order => {
                allProjects.push({
                    id: `${customer.id}-${order.projectName}`,
                    projectName: order.projectName,
                    customerName: customer.name,
                    amount: order.amount,
                    // For demo, generate some variation for bookings vs sales
                    sales: order.amount,
                    bookings: Math.round(order.amount * (0.9 + Math.random() * 0.2))
                });
            });
        });
        
        // Sort by the selected metric
        const sorted = [...allProjects].sort((a, b) => (b[tab] || 0) - (a[tab] || 0));
        return sorted.map((p, i) => ({ ...p, rank: i + 1 }));
    }, [tab]);

    const maxVal = useMemo(() => Math.max(...projectRows.map(r => r[tab] || 0), 1), [projectRows, tab]);

    const open = useCallback((project) => setModalData(project), []);
    const close = useCallback(() => setModalData(null), []);

    const tabRefs = useRef([]);
    const [underline, setUnderline] = useState({ left: 0, width: 0, opacity: 0 });

    useEffect(() => {
        const idx = tab === 'sales' ? 0 : 1;
        const el = tabRefs.current[idx];
        if (el) setUnderline({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
    }, [tab]);

    const medalStyle = (rank) => {
        const map = {
            1: { ring: JSI_COLORS.gold, fill: '#F7E8AD' },
            2: { ring: '#C8CDD3', fill: '#ECEFF2' },
            3: { ring: '#D9A079', fill: '#F4D1BE' },
        }[rank];
        if (!map) return { 
            backgroundColor: theme.colors.subtle, 
            border: `1px solid ${theme.colors.border}`, 
            color: theme.colors.textSecondary 
        };
        return {
            background: `radial-gradient(120% 120% at 50% 0%, ${map.fill} 0%, #fff 90%)`,
            border: `1px solid ${map.ring}`,
            boxShadow: `0 0 0 2px ${map.ring}33 inset`,
            color: theme.colors.textPrimary,
        };
    };

    const Row = ({ project, index }) => {
        const pct = Math.min(100, Math.round(((project[tab] || 0) / maxVal) * 100));
        const isTop3 = project.rank <= 3;
        
        return (
            <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.03, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => open(project)}
                className="w-full text-left"
            >
                <div 
                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all hover:bg-black/[0.03] active:scale-[0.99] ${isTop3 ? 'mb-1' : ''}`}
                    style={{ 
                        backgroundColor: isTop3 ? `${theme.colors.accent}04` : 'transparent',
                        borderBottom: isTop3 ? 'none' : `1px solid ${theme.colors.border}15`
                    }}
                >
                    <div 
                        className="h-10 w-10 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0" 
                        style={medalStyle(project.rank)}
                    >
                        {project.rank}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                            {project.projectName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />
                            <span className="text-[11px] truncate" style={{ color: theme.colors.textSecondary }}>
                                {project.customerName}
                            </span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.subtle }}>
                            <motion.div 
                                className="h-full rounded-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, delay: index * 0.03, ease: [0.4, 0, 0.2, 1] }}
                                style={{ backgroundColor: isTop3 ? theme.colors.accent : `${theme.colors.accent}70` }} 
                            />
                        </div>
                    </div>
                    
                    <div className="pl-3 text-right flex-shrink-0">
                        <div className="text-lg font-bold tabular-nums" style={{ color: theme.colors.accent }}>
                            ${Number(project[tab] || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] font-medium" style={{ color: theme.colors.textSecondary }}>
                            {tab === 'sales' ? 'Sales' : 'Bookings'}
                        </div>
                    </div>
                </div>
            </motion.button>
        );
    };

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
                Customer Leaderboard
            </h1>
        </div>
    );

    return (
        <ScreenLayout
            theme={theme}
            header={header}
            maxWidth="content"
            padding={true}
            paddingBottom="8rem"
        >
            {/* Tabs for Sales / Bookings toggle */}
            <div 
                className="rounded-2xl p-1.5 flex gap-1"
                style={{ 
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    boxShadow: DESIGN_TOKENS.shadows.sm
                }}
            >
                <button
                    ref={(el) => (tabRefs.current[0] = el)}
                    onClick={() => setTab('sales')}
                    className="flex-1 py-3 px-4 rounded-xl text-[14px] font-semibold transition-all relative"
                    style={{ 
                        backgroundColor: tab === 'sales' ? theme.colors.accent : 'transparent',
                        color: tab === 'sales' ? '#FFF' : theme.colors.textSecondary,
                        boxShadow: tab === 'sales' ? DESIGN_TOKENS.shadows.sm : 'none'
                    }}
                >
                    Sales
                </button>
                <button
                    ref={(el) => (tabRefs.current[1] = el)}
                    onClick={() => setTab('bookings')}
                    className="flex-1 py-3 px-4 rounded-xl text-[14px] font-semibold transition-all relative"
                    style={{ 
                        backgroundColor: tab === 'bookings' ? theme.colors.accent : 'transparent',
                        color: tab === 'bookings' ? '#FFF' : theme.colors.textSecondary,
                        boxShadow: tab === 'bookings' ? DESIGN_TOKENS.shadows.sm : 'none'
                    }}
                >
                    Bookings
                </button>
            </div>

            {/* Project Rankings */}
            <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
                <div className="py-2">
                    {projectRows.map((project, i) => (
                        <Row key={project.id} project={project} index={i} />
                    ))}
                    
                    {projectRows.length === 0 && (
                        <div className="p-8 text-center">
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                No project data available
                            </p>
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Project Detail Modal */}
            <Modal show={!!modalData} onClose={close} title={modalData?.projectName || ''} theme={theme}>
                {!!modalData && (
                    <div className="space-y-5">
                        {/* Customer info */}
                        <div 
                            className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ backgroundColor: theme.colors.subtle }}
                        >
                            <Building2 className="w-5 h-5" style={{ color: theme.colors.accent }} />
                            <div>
                                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Customer</p>
                                <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                                    {modalData.customerName}
                                </p>
                            </div>
                        </div>
                        
                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div 
                                className="rounded-2xl p-4 text-center" 
                                style={{ 
                                    backgroundColor: `${theme.colors.accent}10`,
                                    border: `1px solid ${theme.colors.accent}20`
                                }}
                            >
                                <div className="text-xs font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                                    Sales
                                </div>
                                <div className="text-2xl font-bold" style={{ color: theme.colors.accent }}>
                                    ${Number(modalData.sales || 0).toLocaleString()}
                                </div>
                            </div>
                            <div 
                                className="rounded-2xl p-4 text-center" 
                                style={{ 
                                    backgroundColor: theme.colors.subtle,
                                    border: `1px solid ${theme.colors.border}`
                                }}
                            >
                                <div className="text-xs font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                                    Bookings
                                </div>
                                <div className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                                    ${Number(modalData.bookings || 0).toLocaleString()}
                                </div>
                            </div>
                        </div>
                        
                        {/* Ranking info */}
                        <div 
                            className="flex items-center justify-between p-4 rounded-xl"
                            style={{ 
                                backgroundColor: theme.colors.surface,
                                border: `1px solid ${theme.colors.border}`
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" style={{ color: theme.colors.accent }} />
                                <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                                    Current Rank
                                </span>
                            </div>
                            <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                style={medalStyle(modalData.rank)}
                            >
                                {modalData.rank}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </ScreenLayout>
    );
};
