/* eslint-disable react/prop-types */
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Calendar, FileText, ChevronDown, ChevronUp, Package, Share2,
    Truck, Factory, CheckCircle, ClipboardList, Play, Video,
    X, Eye
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { ORDER_DATA, STATUS_COLORS } from './data';
import { motion, AnimatePresence } from 'framer-motion';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';
import { useIsDesktop } from '../../hooks/useResponsive.js';

const currency = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const titleCase = (s) => s ? s.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : '';

// Production steps - dynamically generated based on order status
const getProductionSteps = (status) => {
    // Only show real progress for orders "In Production" or later
    if (status === 'In Production') {
        return [
            { label: 'Raw Materials', completed: true, date: 'Jun 15' },
            { label: 'Machining', completed: true, date: 'Jun 16', video: true },
            { label: 'Assembly', completed: true, date: 'Today', video: true },
            { label: 'Finishing', completed: false },
            { label: 'Quality Control', completed: false }
        ];
    } else if (status === 'Shipping' || status === 'Delivered') {
        return [
            { label: 'Raw Materials', completed: true, date: 'Jun 15' },
            { label: 'Machining', completed: true, date: 'Jun 16', video: true },
            { label: 'Assembly', completed: true, date: 'Jun 18', video: true },
            { label: 'Finishing', completed: true, date: 'Jun 20' },
            { label: 'Quality Control', completed: true, date: 'Jun 21' }
        ];
    }
    // For earlier stages, return placeholder structure (won't be displayed)
    return [
        { label: 'Raw Materials', completed: false },
        { label: 'Machining', completed: false },
        { label: 'Assembly', completed: false },
        { label: 'Finishing', completed: false },
        { label: 'Quality Control', completed: false }
    ];
};

// Production Details Modal
const ProductionDetailsModal = ({ isOpen, onClose, theme, productionSteps, status }) => {
    const completedCount = productionSteps.filter(s => s.completed).length;
    const totalSteps = productionSteps.length;
    const progressPercent = Math.round((completedCount / totalSteps) * 100);

    return createPortal(
        <>
            {/* Backdrop with blur */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 transition-opacity duration-300 pointer-events-auto"
                style={{ 
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    zIndex: DESIGN_TOKENS.zIndex.overlay 
                }}
                onClick={onClose}
            />
            {/* Modal */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
                style={{ zIndex: DESIGN_TOKENS.zIndex.modal }}
            >
                <div 
                    className="w-full max-w-md rounded-3xl overflow-hidden pointer-events-auto shadow-2xl"
                    style={{ backgroundColor: theme.colors.background }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: theme.colors.border }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.accent + '20' }}>
                                <Factory className="w-5 h-5" style={{ color: theme.colors.accent }} />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>In Production</h2>
                                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Factory Progress Updates</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/10"
                            style={{ backgroundColor: theme.colors.subtle }}
                        >
                            <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-5 pt-5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>Overall Progress</span>
                            <span className="text-xs font-bold" style={{ color: theme.colors.accent }}>{progressPercent}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.subtle }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: theme.colors.accent }}
                            />
                        </div>
                    </div>

                    {/* Production Steps */}
                    <div className="p-5 space-y-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
                        {productionSteps.map((step, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex gap-4 items-start"
                            >
                                <div className="flex flex-col items-center">
                                    <div 
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? '' : 'border-2 border-dashed'}`}
                                        style={{ 
                                            backgroundColor: step.completed ? theme.colors.accent : 'transparent',
                                            borderColor: step.completed ? 'transparent' : theme.colors.textSecondary + '40'
                                        }}
                                    >
                                        {step.completed ? (
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.textSecondary + '40' }} />
                                        )}
                                    </div>
                                    {i < productionSteps.length - 1 && (
                                        <div 
                                            className="w-0.5 h-8 my-1"
                                            style={{ 
                                                backgroundColor: step.completed && productionSteps[i + 1]?.completed 
                                                    ? theme.colors.accent + '40' 
                                                    : theme.colors.subtle 
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="flex-1 pb-2">
                                    <div className="flex items-center justify-between">
                                        <span 
                                            className={`font-semibold text-sm ${step.completed ? '' : 'opacity-50'}`}
                                            style={{ color: theme.colors.textPrimary }}
                                        >
                                            {step.label}
                                        </span>
                                        {step.date && (
                                            <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                                {step.date}
                                            </span>
                                        )}
                                    </div>
                                    {step.video && step.completed && (
                                        <button className="mt-2 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors hover:bg-red-500/20"
                                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                                            <Play className="w-3 h-3 fill-current text-red-500" />
                                            <span className="text-xs font-bold text-red-500">Watch Clip</span>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-5 pt-0">
                        <button 
                            onClick={onClose}
                            className="w-full py-3 rounded-full font-semibold text-sm"
                            style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </motion.div>
        </>,
        document.body
    );
};

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

export const OrderDetailScreen = ({ theme, onNavigate, orderNumber: orderNumberProp, route, currentScreen }) => {
    // Use the orderNumber prop directly if provided, otherwise fall back to extracting from route
    const orderNumber = orderNumberProp || (typeof (route || currentScreen) === 'string' ? (route || currentScreen).split('/')[1] : null);
    const order = useMemo(() => ORDER_DATA.find(o => o.orderNumber === orderNumber), [orderNumber]);
    const isDesktop = useIsDesktop();

    // Derived State
    const currentStepIndex = order ? (STATUS_TO_INDEX[order.status] ?? 0) : 0;
    const [expandedStep, setExpandedStep] = useState(null);
    const [showProductionModal, setShowProductionModal] = useState(false);

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
            <div className={`${isDesktop ? 'max-w-4xl mx-auto w-full' : ''} px-6 pt-6 pb-2`}>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60" style={{ color: theme.colors.textSecondary }}>Order Details</div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>#{order.orderNumber}</h1>
                        <p className="text-sm font-medium mt-1" style={{ color: theme.colors.textSecondary }}>{order.details}</p>
                    </div>
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto scrollbar-hide ${isDesktop ? 'max-w-4xl mx-auto w-full' : ''} px-6 pt-4 pb-32`}>

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
                                    <div className="bg-white/5 p-4 space-y-3">
                                        <div className="text-sm space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="opacity-60" style={{ color: theme.colors.textSecondary }}>Order Entered</span>
                                                <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                                                    {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="opacity-60" style={{ color: theme.colors.textSecondary }}>PO Number</span>
                                                <span className="font-mono font-medium" style={{ color: theme.colors.textPrimary }}>{order.po}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="opacity-60" style={{ color: theme.colors.textSecondary }}>Dealer/Company</span>
                                                <span className="font-medium text-right" style={{ color: theme.colors.textPrimary }}>{order.company}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="opacity-60" style={{ color: theme.colors.textSecondary }}>Order Value</span>
                                                <span className="font-semibold" style={{ color: theme.colors.accent }}>
                                                    {currency(order.net || 0)}
                                                </span>
                                            </div>
                                            {order.discount && (
                                                <div className="flex justify-between items-center">
                                                    <span className="opacity-60" style={{ color: theme.colors.textSecondary }}>Discount</span>
                                                    <span className="font-medium" style={{ color: theme.colors.textPrimary }}>{order.discount}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="opacity-60" style={{ color: theme.colors.textSecondary }}>Line Items</span>
                                                <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                                                    {order.lineItems?.length || 0} {order.lineItems?.length === 1 ? 'item' : 'items'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step.id === 'ack' && order.ackUrl && (
                                    <div className={`bg-white/5 p-4 ${isDesktop ? 'flex gap-3' : 'flex flex-col gap-2'}`}>
                                        <button 
                                            onClick={() => window.open(order.ackUrl, '_blank')} 
                                            className={`${isDesktop ? 'flex-1' : 'w-full'} py-2.5 rounded-lg bg-black/5 dark:bg-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors hover:bg-black/10`} 
                                            style={{ color: theme.colors.accent }}
                                        >
                                            <FileText className="w-4 h-4" /> View Acknowledgement
                                        </button>
                                        <button 
                                            onClick={handleShare} 
                                            className={`${isDesktop ? 'px-4' : 'w-full'} py-2.5 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center gap-2 hover:bg-black/10 text-xs font-bold`} 
                                            style={{ color: theme.colors.accent }}
                                        >
                                            <Share2 className="w-4 h-4" />
                                            {isDesktop && <span>Share</span>}
                                            {!isDesktop && <span>Share Order</span>}
                                        </button>
                                    </div>
                                )}

                                {step.id === 'production' && currentStepIndex >= 3 && (
                                    <div className="bg-white/5 p-4 space-y-4">
                                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Factory Updates</div>
                                        {/* Preview of production steps */}
                                        <div className="space-y-2">
                                            {getProductionSteps(order.status).slice(0, 3).map((s, i) => (
                                                <div key={i} className="flex gap-3 items-center">
                                                    <div className={`w-2 h-2 rounded-full ${s.completed ? '' : 'border border-dashed'}`} style={{ backgroundColor: s.completed ? theme.colors.success : 'transparent', borderColor: theme.colors.textSecondary }} />
                                                    <div className={`text-sm flex-1 ${s.completed ? '' : 'opacity-50'}`}>{s.label}</div>
                                                    {s.date && <span className="text-xs opacity-50">{s.date}</span>}
                                                </div>
                                            ))}
                                        </div>
                                        {/* View Full Details Button */}
                                        <button 
                                            onClick={() => setShowProductionModal(true)}
                                            className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors hover:bg-black/10"
                                            style={{ backgroundColor: theme.colors.accent + '15', color: theme.colors.accent }}
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Full Details
                                        </button>
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

            {/* Production Details Modal */}
            <AnimatePresence>
                {showProductionModal && (
                    <ProductionDetailsModal
                        isOpen={showProductionModal}
                        onClose={() => setShowProductionModal(false)}
                        theme={theme}
                        productionSteps={getProductionSteps(order.status)}
                        status={order.status}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
