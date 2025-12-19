import React, { useState, useMemo, useCallback } from 'react';
import {
    Package, CheckCircle, AlertTriangle, Camera, MapPin, User, Clock,
    ChevronRight, Image, X, FileText, Truck, Users, PartyPopper
} from 'lucide-react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Button } from '../../../design-system/Button.jsx';
import { ScreenLayout, SectionHeader } from '../../../design-system/index.js';
import { useScanStore } from './useScanStore.js';
import {
    MOCK_ORDERS,
    RECEIVING_STATUS,
    RECEIVING_STATUS_LABELS,
    RECEIVING_STATUS_COLORS,
    EXCEPTION_TYPE,
    EXCEPTION_LABELS,
    calculateReceivingStatus,
    formatRelativeTime,
    formatDate,
} from './data.js';

// ============================================
// COMPLETION CELEBRATION MODAL
// ============================================
const CompletionModal = ({ show, order, theme, onClose, onViewStatus }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div
                className="relative w-full max-w-sm rounded-2xl p-6 text-center"
                style={{ backgroundColor: theme.colors.surface }}
            >
                <div 
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: '#4A7C5915' }}
                >
                    <PartyPopper className="w-10 h-10" style={{ color: '#4A7C59' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
                    All Packages Received!
                </h3>
                <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
                    All {order?.expectedLPNs?.length || 0} cartons for {order?.projectName} have been scanned and received successfully.
                </p>
                <div className="flex gap-3">
                    <Button
                        theme={theme}
                        variant="secondary"
                        size="md"
                        onClick={onClose}
                        fullWidth
                    >
                        Continue Scanning
                    </Button>
                    <Button
                        theme={theme}
                        variant="primary"
                        size="md"
                        onClick={onViewStatus}
                        fullWidth
                    >
                        View Status
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ============================================
// PROGRESS HEADER
// ============================================
const ProgressHeader = ({ order, scanEvents, exceptions, theme }) => {
    const status = calculateReceivingStatus(order, scanEvents, exceptions);
    const statusColor = RECEIVING_STATUS_COLORS[status];
    const statusLabel = RECEIVING_STATUS_LABELS[status];

    const orderScans = scanEvents.filter(s => s.orderId === order.id && s.action === 'receive');
    const scannedLPNs = new Set(orderScans.map(s => s.lpn));
    const scannedCount = scannedLPNs.size;
    const expectedCount = order.expectedLPNs.length;
    const progressPercent = expectedCount > 0 ? (scannedCount / expectedCount) * 100 : 0;

    const orderExceptions = exceptions.filter(e => e.orderId === order.id && e.type !== 'closed_with_variance');

    return (
        <GlassCard theme={theme} variant="elevated" className="p-4">
            <div className="flex items-center justify-between mb-3">
                <div
                    className="px-3 py-1.5 rounded-full flex items-center gap-2"
                    style={{ backgroundColor: `${statusColor}15` }}
                >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
                    <span className="text-sm font-semibold" style={{ color: statusColor }}>
                        {statusLabel}
                    </span>
                </div>
                <span className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>
                    {scannedCount} / {expectedCount}
                </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-3 rounded-full overflow-hidden mb-2" style={{ backgroundColor: theme.colors.border }}>
                <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${progressPercent}%`,
                        backgroundColor: statusColor,
                    }}
                />
            </div>

            <div className="flex justify-between text-xs" style={{ color: theme.colors.textSecondary }}>
                <span>Cartons received</span>
                <span>{Math.round(progressPercent)}% complete</span>
            </div>

            {orderExceptions.length > 0 && (
                <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${theme.colors.border}20` }}>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" style={{ color: '#B85C5C' }} />
                        <span className="text-sm font-medium" style={{ color: '#B85C5C' }}>
                            {orderExceptions.length} exception{orderExceptions.length !== 1 ? 's' : ''} reported
                        </span>
                    </div>
                </div>
            )}
        </GlassCard>
    );
};

// ============================================
// ORDER INFO CARD
// ============================================
const OrderInfoCard = ({ order, theme }) => (
    <GlassCard theme={theme} variant="minimal" className="p-4">
        <div className="space-y-3">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
                    <FileText className="w-4 h-4" style={{ color: theme.colors.accent }} />
                </div>
                <div className="flex-1">
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Order</p>
                    <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                        {order.soNumber} • {order.poNumber}
                    </p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
                    <MapPin className="w-4 h-4" style={{ color: theme.colors.accent }} />
                </div>
                <div className="flex-1">
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Ship To</p>
                    <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                        {order.shipTo}
                    </p>
                </div>
            </div>

            {/* Contacts section */}
            {order.contacts?.length > 0 && (
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
                        <Users className="w-4 h-4" style={{ color: theme.colors.accent }} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs mb-1" style={{ color: theme.colors.textSecondary }}>Contacts</p>
                        <div className="space-y-2">
                            {order.contacts.map((contact, idx) => (
                                <div key={idx}>
                                    <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                                        {contact.name}
                                    </p>
                                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                        {contact.role}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {order.shipments?.length > 0 && (
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
                        <Truck className="w-4 h-4" style={{ color: theme.colors.accent }} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Shipments</p>
                        {order.shipments.map(ship => (
                            <p key={ship.id} className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                                {ship.carrier} • {ship.trackingNumber}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </GlassCard>
);

// ============================================
// SCANNED ITEMS LIST
// ============================================
const ScannedItemsList = ({ order, scanEvents, theme }) => {
    const orderScans = scanEvents.filter(s => s.orderId === order.id && s.action === 'receive');
    const scannedLPNs = new Set(orderScans.map(s => s.lpn));

    const scannedItems = order.expectedLPNs.filter(item => scannedLPNs.has(item.lpn));
    const unscannedItems = order.expectedLPNs.filter(item => !scannedLPNs.has(item.lpn));

    const getScanInfo = (lpn) => orderScans.find(s => s.lpn === lpn);

    if (scannedItems.length === 0 && unscannedItems.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Scanned */}
            {scannedItems.length > 0 && (
                <GlassCard theme={theme} variant="elevated" className="overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${theme.colors.border}20` }}>
                        <CheckCircle className="w-4 h-4" style={{ color: '#4A7C59' }} />
                        <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                            Scanned ({scannedItems.length})
                        </span>
                    </div>
                    <div className="divide-y" style={{ borderColor: `${theme.colors.border}20` }}>
                        {scannedItems.map(item => {
                            const scanInfo = getScanInfo(item.lpn);
                            return (
                                <div key={item.lpn} className="px-4 py-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4A7C5915' }}>
                                        <Package className="w-4 h-4" style={{ color: '#4A7C59' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                                            {item.lpn}
                                        </p>
                                        <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>
                                            {item.description}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                            {scanInfo ? formatRelativeTime(scanInfo.timestamp) : ''}
                                        </p>
                                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                            {scanInfo?.userName || ''}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>
            )}

            {/* Pending */}
            {unscannedItems.length > 0 && (
                <GlassCard theme={theme} variant="elevated" className="overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${theme.colors.border}20` }}>
                        <Clock className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                        <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                            Pending ({unscannedItems.length})
                        </span>
                    </div>
                    <div className="divide-y" style={{ borderColor: `${theme.colors.border}20` }}>
                        {unscannedItems.map(item => (
                            <div key={item.lpn} className="px-4 py-3 flex items-center gap-3 opacity-60">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
                                    <Package className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                                        {item.lpn}
                                    </p>
                                    <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

// ============================================
// EXCEPTIONS LIST
// ============================================
const ExceptionsList = ({ order, exceptions, theme }) => {
    const orderExceptions = exceptions.filter(e => e.orderId === order.id && e.type !== 'closed_with_variance');

    if (orderExceptions.length === 0) return null;

    const getExceptionIcon = (type) => {
        switch (type) {
            case EXCEPTION_TYPE.DAMAGED: return AlertTriangle;
            case EXCEPTION_TYPE.MISSING: return Package;
            case EXCEPTION_TYPE.WRONG_ITEM: return X;
            case EXCEPTION_TYPE.UNKNOWN_LPN: return AlertTriangle;
            default: return AlertTriangle;
        }
    };

    const getExceptionColor = (type) => {
        switch (type) {
            case EXCEPTION_TYPE.DAMAGED: return '#B85C5C';
            case EXCEPTION_TYPE.MISSING: return '#C4956A';
            case EXCEPTION_TYPE.WRONG_ITEM: return '#5B7B8C';
            case EXCEPTION_TYPE.UNKNOWN_LPN: return '#B85C5C';
            default: return '#B85C5C';
        }
    };

    return (
        <GlassCard theme={theme} variant="elevated" className="overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${theme.colors.border}20` }}>
                <AlertTriangle className="w-4 h-4" style={{ color: '#B85C5C' }} />
                <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                    Exceptions ({orderExceptions.length})
                </span>
            </div>
            <div className="divide-y" style={{ borderColor: `${theme.colors.border}20` }}>
                {orderExceptions.map(exc => {
                    const Icon = getExceptionIcon(exc.type);
                    const color = getExceptionColor(exc.type);
                    return (
                        <div key={exc.id} className="p-4">
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${color}15` }}
                                >
                                    <Icon className="w-4 h-4" style={{ color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: `${color}15`, color }}
                                        >
                                            {EXCEPTION_LABELS[exc.type]}
                                        </span>
                                        <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                            {formatRelativeTime(exc.timestamp)}
                                        </span>
                                    </div>
                                    {exc.lpn && (
                                        <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                                            {exc.lpn}
                                        </p>
                                    )}
                                    {exc.note && (
                                        <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                                            {exc.note}
                                        </p>
                                    )}
                                    {exc.photos?.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {exc.photos.map((photo, idx) => (
                                                <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden">
                                                    <img src={photo} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs mt-2" style={{ color: theme.colors.textSecondary }}>
                                        Reported by {exc.userName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
};

// ============================================
// CLOSE WITH VARIANCE MODAL
// ============================================
const CloseVarianceModal = ({ show, theme, onSubmit, onClose }) => {
    const [reason, setReason] = useState('');

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div
                className="relative w-full max-w-md rounded-2xl p-6"
                style={{ backgroundColor: theme.colors.surface }}
            >
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
                    Close with Variance
                </h3>
                <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                    This will mark the order as closed even though not all items have been received. Please provide a reason.
                </p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for closing with variance..."
                    rows={3}
                    className="w-full p-3 rounded-xl text-sm outline-none resize-none mb-4"
                    style={{
                        backgroundColor: theme.colors.subtle,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.textPrimary,
                    }}
                />
                <div className="flex gap-3">
                    <Button theme={theme} variant="secondary" size="lg" onClick={onClose} fullWidth>
                        Cancel
                    </Button>
                    <Button
                        theme={theme}
                        variant="danger"
                        size="lg"
                        onClick={() => {
                            if (reason.trim()) {
                                onSubmit(reason);
                                setReason('');
                            }
                        }}
                        disabled={!reason.trim()}
                        fullWidth
                    >
                        Close Order
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ============================================
// MAIN ORDER RECEIVING STATUS SCREEN
// ============================================
export const OrderReceivingStatusScreen = ({ theme, onNavigate, handleBack, orderId }) => {
    const [showVarianceModal, setShowVarianceModal] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const {
        scanEvents,
        exceptions,
        markReceivingComplete,
        closeWithVariance,
    } = useScanStore();

    const order = useMemo(() => MOCK_ORDERS.find(o => o.id === orderId), [orderId]);

    const status = useMemo(() => {
        if (!order) return null;
        return calculateReceivingStatus(order, scanEvents, exceptions);
    }, [order, scanEvents, exceptions]);

    // Calculate progress for this order
    const orderProgress = useMemo(() => {
        if (!order) return { scanned: 0, total: 0 };
        const orderScans = scanEvents.filter(s => s.orderId === order.id && s.action === 'receive');
        const scannedLPNs = new Set(orderScans.map(s => s.lpn));
        return { scanned: scannedLPNs.size, total: order.expectedLPNs.length };
    }, [order, scanEvents]);

    const canMarkComplete = useMemo(() => {
        if (!order) return false;
        return orderProgress.scanned >= orderProgress.total;
    }, [order, orderProgress]);

    const handleMarkComplete = useCallback(() => {
        if (!order) return;
        const result = markReceivingComplete(order.id);
        if (result.success) {
            // Show success and navigate back
            if (handleBack) handleBack();
            else onNavigate('resources/scan');
        }
    }, [order, markReceivingComplete, handleBack, onNavigate]);

    const handleCloseVariance = useCallback((reason) => {
        if (!order) return;
        closeWithVariance(order.id, reason);
        setShowVarianceModal(false);
    }, [order, closeWithVariance]);

    // Navigate to scan camera with this order's context
    const handleScanForOrder = useCallback(() => {
        // Pass order context via URL parameter
        onNavigate(`resources/scan/camera?orderId=${order.id}`);
    }, [onNavigate, order]);

    const goBack = useCallback(() => {
        if (handleBack) handleBack();
        else onNavigate('resources/scan');
    }, [handleBack, onNavigate]);

    if (!order) {
        return (
            <ScreenLayout theme={theme} maxWidth="default" padding={true}>
                <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.border }} />
                    <p className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
                        Order not found
                    </p>
                    <Button
                        theme={theme}
                        variant="secondary"
                        className="mt-4"
                        onClick={() => onNavigate('resources/scan')}
                    >
                        Go Back
                    </Button>
                </div>
            </ScreenLayout>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header - project name only, no back arrow since MyJSI header already has one */}
            <div className="px-4 pt-2 pb-4">
                <h1 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                    {order.projectName}
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 space-y-4">
                    {/* Progress */}
                    <ProgressHeader
                        order={order}
                        scanEvents={scanEvents}
                        exceptions={exceptions}
                        theme={theme}
                    />

                    {/* Order Info */}
                    <OrderInfoCard order={order} theme={theme} />

                    {/* Exceptions */}
                    <ExceptionsList
                        order={order}
                        exceptions={exceptions}
                        theme={theme}
                    />

                    {/* Scanned Items */}
                    <ScannedItemsList
                        order={order}
                        scanEvents={scanEvents}
                        theme={theme}
                    />

                    {/* Bottom Actions - inside scroll area to appear above nav bar */}
                    {status !== RECEIVING_STATUS.COMPLETE && status !== RECEIVING_STATUS.CLOSED_WITH_VARIANCE && (
                        <div className="pt-4 pb-36 space-y-3">
                            {/* Primary scan action with progress */}
                            <Button
                                theme={theme}
                                variant="primary"
                                size="lg"
                                icon={Camera}
                                onClick={handleScanForOrder}
                                fullWidth
                            >
                                Scan for this Order ({orderProgress.scanned}/{orderProgress.total})
                            </Button>
                            
                            {/* Secondary actions */}
                            <div className="flex gap-3">
                                {canMarkComplete ? (
                                    <Button
                                        theme={theme}
                                        variant="secondary"
                                        size="md"
                                        icon={CheckCircle}
                                        onClick={handleMarkComplete}
                                        fullWidth
                                    >
                                        Mark Complete
                                    </Button>
                                ) : (
                                    <Button
                                        theme={theme}
                                        variant="ghost"
                                        size="md"
                                        onClick={() => setShowVarianceModal(true)}
                                        fullWidth
                                    >
                                        Close with Variance
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Bottom spacing when actions are hidden */}
                    {(status === RECEIVING_STATUS.COMPLETE || status === RECEIVING_STATUS.CLOSED_WITH_VARIANCE) && (
                        <div className="pb-36" />
                    )}
                </div>
            </div>

            <CloseVarianceModal
                show={showVarianceModal}
                theme={theme}
                onSubmit={handleCloseVariance}
                onClose={() => setShowVarianceModal(false)}
            />

            <CompletionModal
                show={showCompletionModal}
                order={order}
                theme={theme}
                onClose={() => setShowCompletionModal(false)}
                onViewStatus={() => {
                    setShowCompletionModal(false);
                }}
            />
        </div>
    );
};

export default OrderReceivingStatusScreen;
