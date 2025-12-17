/* eslint-disable react/prop-types */
import React, { useState, useMemo } from 'react';
import {
    Calendar, FileText, ChevronDown, ChevronUp, Package, Share2,
    Truck, Factory, CheckCircle, ClipboardList, Play, Video,
    MessageSquare, Check
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { ORDER_DATA, STATUS_COLORS } from './data';
import { motion, AnimatePresence } from 'framer-motion';

const currency = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const titleCase = (s) => s ? s.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : '';

// Mock Data
const PRODUCTION_STEPS = [
    { label: 'Raw Materials', completed: true, date: 'Jun 15' },
    { label: 'Machining', completed: true, date: 'Jun 16', video: true },
    { label: 'Assembly', completed: true, date: 'Today', video: true },
    { label: 'Finishing', completed: false },
    { label: 'Quality Control', completed: false }
];

const ORDER_ENTRY_LOG = [
    { type: 'question', text: 'Clarification Needed: Confirm finish for Table.', date: 'Jun 12', author: 'JSI Entry' },
    { type: 'answer', text: 'Customer: Confirmed Mocha Laminate.', date: 'Jun 12', author: 'Luke Wagner' },
    { type: 'success', text: 'Clean PO Generated', date: 'Jun 13', author: 'System' }
];

const LIFECYCLE_STEPS = [
    { id: 'po', label: 'PO Received', icon: FileText },
    { id: 'entry', label: 'Order Entry', icon: ClipboardList },
    { id: 'ack', label: 'Acknowledged', icon: CheckCircle },
    { id: 'production', label: 'In Production', icon: Factory },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'delivery', label: 'Delivered', icon: Package }
];

const STATUS_TO_INDEX = {
    'Discovery': 0, 'Specifying': 0, 'Decision/Bidding': 0, 'PO Expected': 0, 'Won': 0,
    'Order Entry': 1,
    'Acknowledged': 2,
    'In Production': 3,
    'Shipping': 4,
    'Delivered': 5
};

const TimelineNode = ({ step, index, active, isPast, isLast, expanded, onToggle, children, theme }) => {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div
                    onClick={onToggle}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all ${onToggle ? 'cursor-pointer hover:scale-110 shadow-sm' : ''}`}
                    style={{
                        borderColor: active || isPast ? theme.colors.accent : theme.colors.subtle,
                        backgroundColor: active ? theme.colors.accent : isPast ? theme.colors.surface : theme.colors.background,
                        color: active ? '#fff' : isPast ? theme.colors.accent : theme.colors.textSecondary
                    }}
                >
                    <step.icon className="w-4 h-4" />
                </div>
                {!isLast && (
                    <div
                        className="w-0.5 flex-1 my-1"
                        style={{ backgroundColor: isPast ? theme.colors.accent : theme.colors.subtle, opacity: isPast ? 0.3 : 0.1 }}
                    />
                )}
            </div>
            <div className="flex-1 pb-8">
                <div onClick={onToggle} className={`flex items-baseline justify-between ${onToggle ? 'cursor-pointer' : ''}`}>
                    <div>
                        <h4 className={`font-bold text-sm ${active ? 'text-base' : ''} transition-all`}
                            style={{ color: active ? theme.colors.textPrimary : isPast ? theme.colors.textPrimary : theme.colors.textSecondary }}>
                            {step.label}
                        </h4>
                        {active && <div className="text-[10px] font-bold mt-0.5 uppercase tracking-wider" style={{ color: theme.colors.accent }}>Current Stage</div>}
                    </div>
                    {children && (
                        <div className="text-xs opacity-50 transition-transform" style={{ color: theme.colors.textSecondary, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {(expanded || active) && children && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-3"
                        >
                            <div className={`rounded-xl overflow-hidden`} style={{ backgroundColor: theme.colors.surface }}>
                                {children}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const LineItemTile = ({ item, index, theme }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <GlassCard theme={theme} className="mb-3 overflow-hidden bg-opacity-40" variant="flat">
            <div onClick={() => setExpanded(!expanded)} className="p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex gap-4 items-center">
                {/* Number Column */}
                <div className="text-2xl font-bold opacity-10 w-8 text-center" style={{ color: theme.colors.textPrimary }}>
                    {String(index).padStart(2, '0')}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate" style={{ color: theme.colors.textPrimary }}>{titleCase(item.name)}</h4>
                    <div className="flex items-center gap-2 text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                        <span className="font-medium bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">{item.model}</span>
                        <span>•</span>
                        <span>Qty {item.quantity}</span>
                    </div>
                </div>

                <div className="text-right pl-2">
                    <div className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>{currency(item.extNet)}</div>
                    {expanded ?
                        <ChevronUp className="w-4 h-4 ml-auto mt-1 opacity-50" /> :
                        <ChevronDown className="w-4 h-4 ml-auto mt-1 opacity-50" />
                    }
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 pt-0 pl-16 space-y-1.5">
                            {item.specs?.map((s, i) => (
                                <div key={i} className="flex justify-between text-xs py-1 border-b last:border-0 border-dashed" style={{ borderColor: theme.colors.subtle }}>
                                    <span className="opacity-70" style={{ color: theme.colors.textSecondary }}>{titleCase(s.label)}</span>
                                    <span className="font-medium" style={{ color: theme.colors.textPrimary }}>{s.value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-xs pt-2 font-bold opacity-70">
                                <span style={{ color: theme.colors.textSecondary }}>Unit Price</span>
                                <span style={{ color: theme.colors.textPrimary }}>{currency(item.net)}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
};

export const OrderDetailScreen = ({ theme, onNavigate, route, currentScreen }) => {
    const effectiveRoute = route || currentScreen;
    const orderNumber = typeof effectiveRoute === 'string' ? effectiveRoute.split('/')[1] : null;
    const order = useMemo(() => ORDER_DATA.find(o => o.orderNumber === orderNumber), [orderNumber]);

    // Derived State
    const currentStepIndex = order ? (STATUS_TO_INDEX[order.status] ?? 0) : 0;
    const [expandedStep, setExpandedStep] = useState(null);

    const toggleStep = (id) => setExpandedStep(expandedStep === id ? null : id);

    // Auto-open past steps that have interesting data (like Order Entry) for the demo?
    // User requested "put an example", so we'll allow manual toggle to see it.

    const handleShare = () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({ title: `Order #${order?.orderNumber}`, text: order?.details, url: window.location.href }).catch(console.error);
        }
    };

    if (!order) return <div className="p-8 text-center opacity-50">Loading...</div>;

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            {/* Minimal Header */}
            <div className={`px-6 pt-6 pb-2`}>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60" style={{ color: theme.colors.textSecondary }}>Order Details</div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>#{order.orderNumber}</h1>
                        <p className="text-sm font-medium mt-1 truncate max-w-[280px]" style={{ color: theme.colors.textSecondary }}>{order.details}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-4 pb-32">

                {/* Lifecycle Vertical Timeline */}
                <div className="mb-10 pl-2">
                    {LIFECYCLE_STEPS.map((step, index) => {
                        const isActive = index === currentStepIndex;
                        const isPast = index < currentStepIndex;
                        const isExpanded = expandedStep === step.id; // Control expansion manually for history

                        return (
                            <TimelineNode
                                key={step.id}
                                step={step}
                                index={index}
                                isLast={index === LIFECYCLE_STEPS.length - 1}
                                theme={theme}
                                active={isActive}
                                isPast={isPast}
                                expanded={isExpanded || isActive} // Active step always expanded
                                onToggle={() => toggleStep(step.id)}
                            >
                                {/* CONTENT PER STAGE */}

                                {step.id === 'po' && (
                                    <div className="bg-white/5 p-4 text-sm space-y-2">
                                        <div className="flex justify-between"><span className="opacity-60">PO Number</span><span className="font-mono">{order.po}</span></div>
                                        <div className="flex justify-between"><span className="opacity-60">Received</span><span>{new Date(order.date).toLocaleDateString()}</span></div>
                                    </div>
                                )}

                                {step.id === 'entry' && (
                                    <div className="bg-white/5 p-4 space-y-4">
                                        {ORDER_ENTRY_LOG.map((log, i) => (
                                            <div key={i} className="flex gap-3 text-xs">
                                                <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${log.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                                    {log.type === 'question' ? <MessageSquare className="w-3 h-3" /> : log.type === 'success' ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium" style={{ color: theme.colors.textPrimary }}>{log.text}</div>
                                                    <div className="opacity-50 mt-0.5 text-[10px]">{log.date} • {log.author}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {step.id === 'ack' && order.ackUrl && (
                                    <div className="bg-white/5 p-4 flex gap-2">
                                        <button onClick={() => window.open(order.ackUrl, '_blank')} className="flex-1 py-2.5 rounded-lg bg-black/5 dark:bg-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors hover:bg-black/10" style={{ color: theme.colors.accent }}>
                                            <FileText className="w-4 h-4" /> View Ack
                                        </button>
                                        <button onClick={handleShare} className="w-10 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10" style={{ color: theme.colors.accent }}>
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {step.id === 'production' && (
                                    <div className="bg-white/5 p-4 space-y-4">
                                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Factory Updates</div>
                                        {PRODUCTION_STEPS.map((s, i) => (
                                            <div key={i} className="flex gap-3 items-center">
                                                <div className={`w-2 h-2 rounded-full ${s.completed ? '' : 'border border-dashed'}`} style={{ backgroundColor: s.completed ? theme.colors.success : 'transparent', borderColor: theme.colors.textSecondary }} />
                                                <div className={`text-sm flex-1 ${s.completed ? '' : 'opacity-50'}`}>{s.label}</div>
                                                {s.video && (
                                                    <div className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 flex items-center gap-1 cursor-pointer hover:bg-red-500/20">
                                                        <Play className="w-3 h-3 fill-current" />
                                                        <span className="text-[10px] font-bold">CLIP</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {(step.id === 'shipping' || step.id === 'delivery') && (
                                    <div className="bg-white/5 p-4 text-sm space-y-3">
                                        {step.id === 'shipping' && (
                                            <div className="flex gap-3 py-1">
                                                <Truck className="w-4 h-4 opacity-50 flex-shrink-0" />
                                                <div>
                                                    <div className="text-xs opacity-60 font-bold uppercase mb-1">Ship To</div>
                                                    <div className="leading-relaxed opacity-90 whitespace-pre-line">{order.shipTo}</div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="pt-2 border-t border-dashed opacity-70 flex justify-between text-xs" style={{ borderColor: theme.colors.subtle }}>
                                            <span>{step.id === 'delivery' ? 'Est. Delivery' : 'Est. Ship Date'}</span>
                                            <span className="font-mono font-bold">{new Date(order.shipDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                )}
                            </TimelineNode>
                        );
                    })}
                </div>

                {/* Line Items Section - Tiles */}
                <div>
                    <div className="flex justify-between items-baseline mb-4 px-1">
                        <h3 className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>Line Items</h3>
                        <span className="text-xs opacity-60 font-medium">{order.lineItems.length} Products</span>
                    </div>
                    <div className="space-y-1">
                        {order.lineItems.map((item, i) => (
                            <LineItemTile key={i} index={i + 1} item={item} theme={theme} />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
