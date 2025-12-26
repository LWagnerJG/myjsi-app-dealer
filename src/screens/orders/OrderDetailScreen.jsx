/* eslint-disable react/prop-types */
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Calendar, FileText, ChevronDown, ChevronUp, Package, Share2,
    Truck, Factory, CheckCircle, ClipboardList, Play, Video,
    X, Eye, Download, ExternalLink, Clock, User, MapPin, 
    DollarSign, Hash, Building2, Sparkles
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { ORDER_DATA, STATUS_COLORS } from './data';
import { motion, AnimatePresence } from 'framer-motion';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';
import { useIsDesktop } from '../../hooks/useResponsive.js';

const currency = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const titleCase = (s) => s ? s.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : '';

// Mock video thumbnails for production clips
const VIDEO_THUMBNAILS = {
    'Machining': 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=400&h=225&fit=crop',
    'Assembly': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=225&fit=crop',
    'Raw Materials': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop'
};

// Production steps - dynamically generated based on order status
const getProductionSteps = (status) => {
    // Only show real progress for orders "In Production" or later
    if (status === 'In Production') {
        return [
            { label: 'Raw Materials', completed: true, date: 'Jun 15', description: 'Materials sourced & inspected' },
            { label: 'Machining', completed: true, date: 'Jun 16', video: true, thumbnail: VIDEO_THUMBNAILS['Machining'], duration: '0:45' },
            { label: 'Assembly', completed: true, date: 'Today', video: true, thumbnail: VIDEO_THUMBNAILS['Assembly'], duration: '1:12' },
            { label: 'Finishing', completed: false, description: 'Surface treatment & coating' },
            { label: 'Quality Control', completed: false, description: 'Final inspection' }
        ];
    } else if (status === 'Shipping' || status === 'Delivered') {
        return [
            { label: 'Raw Materials', completed: true, date: 'Jun 15', description: 'Materials sourced & inspected' },
            { label: 'Machining', completed: true, date: 'Jun 16', video: true, thumbnail: VIDEO_THUMBNAILS['Machining'], duration: '0:45' },
            { label: 'Assembly', completed: true, date: 'Jun 18', video: true, thumbnail: VIDEO_THUMBNAILS['Assembly'], duration: '1:12' },
            { label: 'Finishing', completed: true, date: 'Jun 20', description: 'Surface treatment complete' },
            { label: 'Quality Control', completed: true, date: 'Jun 21', description: 'Passed all inspections' }
        ];
    }
    // For earlier stages, return placeholder structure (won't be displayed)
    return [
        { label: 'Raw Materials', completed: false, description: 'Materials sourcing' },
        { label: 'Machining', completed: false, description: 'CNC & precision cutting' },
        { label: 'Assembly', completed: false, description: 'Component assembly' },
        { label: 'Finishing', completed: false, description: 'Surface treatment' },
        { label: 'Quality Control', completed: false, description: 'Final inspection' }
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
                                    {/* Video Thumbnail */}
                                    {step.video && step.completed && step.thumbnail && (
                                        <div className="mt-3 relative group cursor-pointer rounded-xl overflow-hidden shadow-lg">
                                            <img 
                                                src={step.thumbnail} 
                                                alt={`${step.label} video`}
                                                className="w-full h-24 object-cover transition-transform group-hover:scale-105"
                                            />
                                            {/* Gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                            {/* Play button */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                                    <Play className="w-5 h-5 text-red-500 fill-current ml-0.5" />
                                                </div>
                                            </div>
                                            {/* Duration badge */}
                                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-medium">
                                                {step.duration}
                                            </div>
                                            {/* Label */}
                                            <div className="absolute bottom-2 left-2 text-white text-xs font-semibold">
                                                Watch {step.label}
                                            </div>
                                        </div>
                                    )}
                                    {/* Fallback button if no thumbnail */}
                                    {step.video && step.completed && !step.thumbnail && (
                                        <button className="mt-2 px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors hover:bg-[#B85C5C]/20"
                                            style={{ backgroundColor: 'rgba(184, 92, 92, 0.1)' }}>
                                            <Play className="w-3 h-3 fill-current" style={{ color: '#B85C5C' }} />
                                            <span className="text-xs font-bold" style={{ color: '#B85C5C' }}>Watch Clip</span>
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

// Compact Timeline Node - shows inline info, no collapse needed
const TimelineNode = ({ step, active, isPast, isFuture, isLast, theme, inlineContent, actionButton }) => {
    return (
        <div className="flex gap-3">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm`}
                    style={{
                        backgroundColor: active ? theme.colors.accent : isPast ? theme.colors.surface : theme.colors.background,
                        border: `2px solid ${active ? theme.colors.accent : isPast ? theme.colors.accent + '40' : theme.colors.subtle}`,
                        color: active ? '#fff' : isPast ? theme.colors.accent : theme.colors.textSecondary + '60'
                    }}
                >
                    {isPast ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <step.icon className="w-5 h-5" />
                    )}
                </div>
                {!isLast && (
                    <div
                        className="w-0.5 flex-1 my-1.5 rounded-full"
                        style={{ backgroundColor: isPast ? theme.colors.accent + '30' : theme.colors.subtle }}
                    />
                )}
            </div>
            
            {/* Content */}
            <div className={`flex-1 ${isLast ? 'pb-2' : 'pb-6'}`}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className={`font-bold ${active ? 'text-base' : 'text-sm'}`}
                                style={{ color: isFuture ? theme.colors.textSecondary + '60' : theme.colors.textPrimary }}>
                                {step.label}
                            </h4>
                            {active && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" 
                                    style={{ backgroundColor: theme.colors.accent + '20', color: theme.colors.accent }}>
                                    Current
                                </span>
                            )}
                        </div>
                        {/* Inline content - shows key info without expanding */}
                        {inlineContent && (isPast || active) && (
                            <div className="mt-1.5">
                                {inlineContent}
                            </div>
                        )}
                    </div>
                    {/* Action button */}
                    {actionButton && (isPast || active) && (
                        <div className="flex-shrink-0">
                            {actionButton}
                        </div>
                    )}
                </div>
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
    const [showProductionModal, setShowProductionModal] = useState(false);

    const handleShare = () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({ title: `Order #${order?.orderNumber}`, text: order?.details, url: window.location.href }).catch(() => {});
        }
    };

    // Loading skeleton
    if (!order) {
        return (
            <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
                <div className="px-6 pt-6 pb-2">
                    <div className="h-3 w-20 rounded mb-2 animate-pulse" style={{ backgroundColor: theme.colors.subtle }} />
                    <div className="h-8 w-40 rounded mb-2 animate-pulse" style={{ backgroundColor: theme.colors.subtle }} />
                    <div className="h-4 w-32 rounded animate-pulse" style={{ backgroundColor: theme.colors.subtle }} />
                </div>
                <div className="px-6 pt-4 space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl animate-pulse" style={{ backgroundColor: theme.colors.subtle }} />
                            <div className="flex-1">
                                <div className="h-4 w-24 rounded mb-2 animate-pulse" style={{ backgroundColor: theme.colors.subtle }} />
                                <div className="h-3 w-32 rounded animate-pulse" style={{ backgroundColor: theme.colors.subtle }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

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

                {/* Compact Lifecycle Timeline */}
                <div className="mb-8">
                    {LIFECYCLE_STEPS.map((step, index) => {
                        const isActive = index === currentStepIndex;
                        const isPast = index < currentStepIndex;
                        const isFuture = index > currentStepIndex;

                        // Define inline content for each step
                        const getInlineContent = () => {
                            if (step.id === 'po') {
                                return (
                                    <div className="flex items-center gap-3 text-xs" style={{ color: theme.colors.textSecondary }}>
                                        <span className="font-mono font-semibold" style={{ color: theme.colors.textPrimary }}>{order.po}</span>
                                        <span>•</span>
                                        <span>{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                );
                            }
                            if (step.id === 'entry') {
                                return (
                                    <div className="flex items-center gap-3 text-xs" style={{ color: theme.colors.textSecondary }}>
                                        <span className="font-semibold" style={{ color: theme.colors.accent }}>{currency(order.net || 0)}</span>
                                        <span>•</span>
                                        <span>{order.lineItems?.length || 0} items</span>
                                    </div>
                                );
                            }
                            if (step.id === 'ack' && order.ackDate) {
                                return (
                                    <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                        {new Date(order.ackDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                );
                            }
                            if (step.id === 'production' && currentStepIndex >= 3) {
                                const steps = getProductionSteps(order.status);
                                const completed = steps.filter(s => s.completed).length;
                                const pct = Math.round((completed / steps.length) * 100);
                                return (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.subtle }}>
                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: theme.colors.accent }} />
                                        </div>
                                        <span className="text-xs font-bold" style={{ color: theme.colors.accent }}>{pct}%</span>
                                    </div>
                                );
                            }
                            if (step.id === 'shipping') {
                                return (
                                    <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                        Est. {new Date(order.shipDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                );
                            }
                            if (step.id === 'delivery') {
                                return (
                                    <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                        Est. {new Date(order.shipDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                );
                            }
                            return null;
                        };

                        // Define action buttons for each step
                        const getActionButton = () => {
                            if (step.id === 'po') {
                                return (
                                    <button 
                                        onClick={() => window.open(order.ackUrl, '_blank')}
                                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                                        style={{ backgroundColor: theme.colors.accent + '15', color: theme.colors.accent }}
                                    >
                                        <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                );
                            }
                            if (step.id === 'ack' && order.ackUrl) {
                                return (
                                    <button 
                                        onClick={() => window.open(order.ackUrl, '_blank')}
                                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                                        style={{ backgroundColor: '#4A7C59' + '15', color: '#4A7C59' }}
                                    >
                                        <FileText className="w-3.5 h-3.5" /> View
                                    </button>
                                );
                            }
                            if (step.id === 'production' && currentStepIndex >= 3) {
                                return (
                                    <button 
                                        onClick={() => setShowProductionModal(true)}
                                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                                        style={{ backgroundColor: theme.colors.accent + '15', color: theme.colors.accent }}
                                    >
                                        <Video className="w-3.5 h-3.5" /> Clips
                                    </button>
                                );
                            }
                            return null;
                        };

                        return (
                            <TimelineNode
                                key={step.id}
                                step={step}
                                isLast={index === LIFECYCLE_STEPS.length - 1}
                                theme={theme}
                                active={isActive}
                                isPast={isPast}
                                isFuture={isFuture}
                                inlineContent={getInlineContent()}
                                actionButton={getActionButton()}
                            />
                        );
                    })}
                </div>

                {/* Order Summary Card */}
                <div className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>Order Summary</h3>
                        <button 
                            onClick={handleShare}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5"
                            style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary }}
                        >
                            <Share2 className="w-3.5 h-3.5" /> Share
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[10px] font-medium uppercase tracking-wider opacity-60 mb-0.5" style={{ color: theme.colors.textSecondary }}>Total Value</div>
                            <div className="text-xl font-bold" style={{ color: theme.colors.accent }}>{currency(order.net || 0)}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-medium uppercase tracking-wider opacity-60 mb-0.5" style={{ color: theme.colors.textSecondary }}>Est. Ship</div>
                            <div className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>
                                {new Date(order.shipDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-medium uppercase tracking-wider opacity-60 mb-0.5" style={{ color: theme.colors.textSecondary }}>Dealer</div>
                            <div className="text-sm font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{order.company}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-medium uppercase tracking-wider opacity-60 mb-0.5" style={{ color: theme.colors.textSecondary }}>Discount</div>
                            <div className="text-sm font-bold" style={{ color: '#4A7C59' }}>{order.discount || '—'}</div>
                        </div>
                    </div>
                </div>

                {/* Line Items Section - Tiles */}
                <div>
                    <div className="flex justify-between items-baseline mb-4 px-1">
                        <h3 className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>Line Items</h3>
                        <span className="text-xs opacity-60 font-medium">{order.lineItems.length} Products</span>
                    </div>
                    <div className="space-y-1">
                        {order.lineItems.map((item, i) => (
                            <LineItemTile key={item.line || `item-${i}`} index={i + 1} item={item} theme={theme} />
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
