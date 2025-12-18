import React, { useMemo, useState, useCallback } from 'react';
import { GlassCard, ScreenLayout } from '../../design-system/index.js';
import { Modal } from '../../components/common/Modal';
import { Building2, TrendingUp } from 'lucide-react';
import { CUSTOMER_RANK_DATA } from './data.js';
import { motion } from 'framer-motion';
import { JSI_COLORS } from '../../design-system/tokens.js';

// Customer Leaderboard - shows PROJECT NAMES ranked by Ordered/Invoiced

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
                    sales: order.amount,
                    bookings: Math.round(order.amount * (0.9 + Math.random() * 0.2))
                });
            });
        });
        
        const sorted = [...allProjects].sort((a, b) => (b[tab] || 0) - (a[tab] || 0));
        return sorted.map((p, i) => ({ ...p, rank: i + 1 }));
    }, [tab]);

    const maxVal = useMemo(() => Math.max(...projectRows.map(r => r[tab] || 0), 1), [projectRows, tab]);

    const open = useCallback((project) => setModalData(project), []);
    const close = useCallback(() => setModalData(null), []);

    const medalStyle = (rank) => {
        const map = {
            1: { ring: JSI_COLORS.gold, fill: '#F7E8AD' },
            2: { ring: '#C8CDD3', fill: '#ECEFF2' },
            3: { ring: '#D9A079', fill: '#F4D1BE' },
        }[rank];
        if (!map) return { 
            backgroundColor: theme.colors.subtle, 
            color: theme.colors.textSecondary 
        };
        return {
            background: `radial-gradient(120% 120% at 50% 0%, ${map.fill} 0%, #fff 90%)`,
            border: `1px solid ${map.ring}`,
            boxShadow: `0 0 0 2px ${map.ring}25 inset`,
            color: theme.colors.textPrimary,
        };
    };

    const Row = ({ project, index }) => {
        const pct = Math.min(100, Math.round(((project[tab] || 0) / maxVal) * 100));
        const isTop3 = project.rank <= 3;
        
        return (
            <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.015 }}
                onClick={() => open(project)}
                className="w-full text-left"
            >
                <div 
                    className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-black/[0.02] active:scale-[0.99]"
                >
                    <div 
                        className="h-8 w-8 rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0" 
                        style={medalStyle(project.rank)}
                    >
                        {project.rank}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-[13px] truncate" style={{ color: theme.colors.textPrimary }}>
                            {project.projectName}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />
                            <span className="text-[11px] truncate" style={{ color: theme.colors.textSecondary }}>
                                {project.customerName}
                            </span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.subtle }}>
                            <motion.div 
                                className="h-full rounded-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.35, delay: index * 0.015 }}
                                style={{ backgroundColor: isTop3 ? theme.colors.accent : `${theme.colors.accent}70` }} 
                            />
                        </div>
                    </div>
                    
                    <div className="pl-2 text-right flex-shrink-0">
                        <div className="text-[15px] font-bold tabular-nums" style={{ color: theme.colors.accent }}>
                            ${Number(project[tab] || 0).toLocaleString()}
                        </div>
                        <div className="text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>
                            {tab === 'sales' ? 'Invoiced' : 'Ordered'}
                        </div>
                    </div>
                </div>
            </motion.button>
        );
    };

    return (
        <ScreenLayout
            theme={theme}
            maxWidth="content"
            padding={true}
            paddingBottom="8rem"
            gap="0.75rem"
        >
            {/* Toggle: Invoiced / Ordered */}
            <div 
                className="flex items-center rounded-full p-0.5"
                style={{ backgroundColor: theme.colors.subtle }}
            >
                <button
                    onClick={() => setTab('sales')}
                    className="flex-1 py-2.5 px-4 rounded-full text-[13px] font-semibold transition-all"
                    style={{ 
                        backgroundColor: tab === 'sales' ? '#FFF' : 'transparent',
                        color: tab === 'sales' ? theme.colors.textPrimary : theme.colors.textSecondary,
                        boxShadow: tab === 'sales' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    Invoiced
                </button>
                <button
                    onClick={() => setTab('bookings')}
                    className="flex-1 py-2.5 px-4 rounded-full text-[13px] font-semibold transition-all"
                    style={{ 
                        backgroundColor: tab === 'bookings' ? '#FFF' : 'transparent',
                        color: tab === 'bookings' ? theme.colors.textPrimary : theme.colors.textSecondary,
                        boxShadow: tab === 'bookings' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    Ordered
                </button>
            </div>

            {/* Project Rankings */}
            <GlassCard theme={theme} className="p-2" variant="elevated">
                {projectRows.map((project, i) => (
                    <Row key={project.id} project={project} index={i} />
                ))}
                
                {projectRows.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-[13px]" style={{ color: theme.colors.textSecondary }}>
                            No project data available
                        </p>
                    </div>
                )}
            </GlassCard>

            {/* Project Detail Modal */}
            <Modal show={!!modalData} onClose={close} title={modalData?.projectName || ''} theme={theme}>
                {!!modalData && (
                    <div className="space-y-4">
                        {/* Customer info */}
                        <div 
                            className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ backgroundColor: theme.colors.subtle }}
                        >
                            <Building2 className="w-4 h-4" style={{ color: theme.colors.accent }} />
                            <div>
                                <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>Customer</p>
                                <p className="font-medium text-[13px]" style={{ color: theme.colors.textPrimary }}>
                                    {modalData.customerName}
                                </p>
                            </div>
                        </div>
                        
                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div 
                                className="rounded-xl p-3 text-center" 
                                style={{ backgroundColor: `${theme.colors.accent}08` }}
                            >
                                <div className="text-[11px] font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                                    Invoiced
                                </div>
                                <div className="text-xl font-bold tabular-nums" style={{ color: theme.colors.accent }}>
                                    ${Number(modalData.sales || 0).toLocaleString()}
                                </div>
                            </div>
                            <div 
                                className="rounded-xl p-3 text-center" 
                                style={{ backgroundColor: theme.colors.subtle }}
                            >
                                <div className="text-[11px] font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                                    Ordered
                                </div>
                                <div className="text-xl font-bold tabular-nums" style={{ color: theme.colors.textPrimary }}>
                                    ${Number(modalData.bookings || 0).toLocaleString()}
                                </div>
                            </div>
                        </div>
                        
                        {/* Ranking */}
                        <div 
                            className="flex items-center justify-between p-3 rounded-xl"
                            style={{ backgroundColor: theme.colors.subtle }}
                        >
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                <span className="text-[13px] font-medium" style={{ color: theme.colors.textSecondary }}>
                                    Current Rank
                                </span>
                            </div>
                            <div 
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
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
