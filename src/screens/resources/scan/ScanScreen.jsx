import React, { useState, useMemo, useCallback } from 'react';
import {
    Scan, Package, Clock, ChevronRight, Search, Wifi, WifiOff,
    RefreshCw, CheckCircle, AlertTriangle, MapPin, Truck, Calendar
} from 'lucide-react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { ScreenLayout, SectionHeader } from '../../../design-system/index.js';
import { Button } from '../../../design-system/Button.jsx';
import { useScanStore } from './useScanStore.js';
import {
    SCAN_CONFIG,
    MOCK_ORDERS,
    RECEIVING_STATUS,
    RECEIVING_STATUS_LABELS,
    RECEIVING_STATUS_COLORS,
    SHIPPING_STATUS,
    SHIPPING_STATUS_LABELS,
    SHIPPING_STATUS_COLORS,
    SYNC_STATUS,
    SYNC_STATUS_LABELS,
    SYNC_STATUS_COLORS,
    calculateReceivingStatus,
    formatRelativeTime,
    formatDate,
} from './data.js';

// ============================================
// SYNC STATUS INDICATOR
// ============================================
const SyncStatusIndicator = ({ isOnline, queuedCount, isSyncing, onRetry, theme }) => {
    if (isOnline && queuedCount === 0) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" 
                 style={{ backgroundColor: `${SYNC_STATUS_COLORS[SYNC_STATUS.SYNCED]}15` }}>
                <Wifi className="w-4 h-4" style={{ color: SYNC_STATUS_COLORS[SYNC_STATUS.SYNCED] }} />
                <span className="text-xs font-medium" style={{ color: SYNC_STATUS_COLORS[SYNC_STATUS.SYNCED] }}>
                    Online
                </span>
            </div>
        );
    }

    if (!isOnline) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                 style={{ backgroundColor: `${SYNC_STATUS_COLORS[SYNC_STATUS.FAILED]}15` }}>
                <WifiOff className="w-4 h-4" style={{ color: SYNC_STATUS_COLORS[SYNC_STATUS.FAILED] }} />
                <span className="text-xs font-medium" style={{ color: SYNC_STATUS_COLORS[SYNC_STATUS.FAILED] }}>
                    Offline
                </span>
            </div>
        );
    }

    if (queuedCount > 0) {
        return (
            <button
                onClick={onRetry}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all active:scale-95"
                style={{ backgroundColor: `${SYNC_STATUS_COLORS[SYNC_STATUS.QUEUED]}15` }}
            >
                <RefreshCw 
                    className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} 
                    style={{ color: SYNC_STATUS_COLORS[SYNC_STATUS.QUEUED] }} 
                />
                <span className="text-xs font-medium" style={{ color: SYNC_STATUS_COLORS[SYNC_STATUS.QUEUED] }}>
                    {isSyncing ? 'Syncing...' : `${queuedCount} queued`}
                </span>
            </button>
        );
    }

    return null;
};

// ============================================
// RECENT SCAN ITEM
// ============================================
const RecentScanItem = ({ scan, theme, isLast }) => {
    const syncColor = SYNC_STATUS_COLORS[scan.syncStatus] || SYNC_STATUS_COLORS[SYNC_STATUS.QUEUED];

    return (
        <div
            className="flex items-center gap-3 py-3 px-1"
            style={{ borderBottom: isLast ? 'none' : `1px solid ${theme.colors.border}20` }}
        >
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: scan.isUnknown ? '#B85C5C15' : theme.colors.subtle }}
            >
                {scan.isUnknown ? (
                    <AlertTriangle className="w-5 h-5" style={{ color: '#B85C5C' }} />
                ) : scan.isDuplicate ? (
                    <CheckCircle className="w-5 h-5" style={{ color: '#C4956A' }} />
                ) : (
                    <Package className="w-5 h-5" style={{ color: theme.colors.accent }} />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                    {scan.lpn}
                </p>
                <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>
                    {scan.description || (scan.isUnknown ? 'Unknown LPN' : scan.orderId || 'Scanned')}
                    {scan.isDuplicate && ' • Duplicate'}
                </p>
            </div>
            <div className="flex flex-col items-end gap-1">
                <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                    {formatRelativeTime(scan.timestamp)}
                </span>
                <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: syncColor }}
                    title={SYNC_STATUS_LABELS[scan.syncStatus]}
                />
            </div>
        </div>
    );
};

// ============================================
// ORDER CARD
// ============================================
const OrderCard = ({ order, scanEvents, exceptions, theme, onSelect, onTrackShipment }) => {
    const status = calculateReceivingStatus(order, scanEvents, exceptions);
    const statusColor = RECEIVING_STATUS_COLORS[status];
    const statusLabel = RECEIVING_STATUS_LABELS[status];

    const orderScans = scanEvents.filter(s => s.orderId === order.id && s.action === 'receive');
    const scannedLPNs = new Set(orderScans.map(s => s.lpn));
    const scannedCount = scannedLPNs.size;
    const expectedCount = order.expectedLPNs.length;
    const progressPercent = expectedCount > 0 ? (scannedCount / expectedCount) * 100 : 0;

    const orderExceptions = exceptions.filter(e => e.orderId === order.id);
    const exceptionCount = orderExceptions.length;

    // Shipping status handling
    const shippingStatus = order.shippingStatus;
    const shippingColor = SHIPPING_STATUS_COLORS[shippingStatus] || '#6b7280';
    const shippingLabel = SHIPPING_STATUS_LABELS[shippingStatus] || 'Unknown';
    const isInTransit = shippingStatus === SHIPPING_STATUS.IN_TRANSIT || shippingStatus === SHIPPING_STATUS.OUT_FOR_DELIVERY;

    return (
        <GlassCard
            theme={theme}
            variant="elevated"
            className="p-4"
        >
            {/* Header with project name and status badges */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(order)}>
                    <p className="font-bold text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                        {order.projectName}
                    </p>
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                        {order.poNumber} • {order.soNumber}
                    </p>
                </div>
                <div className="flex flex-col gap-1.5 items-end flex-shrink-0 ml-2">
                    {/* Receiving status */}
                    <div
                        className="px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: `${statusColor}15` }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                        <span className="text-[10px] font-medium" style={{ color: statusColor }}>
                            {statusLabel}
                        </span>
                    </div>
                    {/* Shipping status - clickable if in transit */}
                    {isInTransit ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onTrackShipment(order);
                            }}
                            className="px-2 py-0.5 rounded-full flex items-center gap-1 transition-all active:scale-95"
                            style={{ backgroundColor: `${shippingColor}15` }}
                        >
                            <Truck className="w-3 h-3" style={{ color: shippingColor }} />
                            <span className="text-[10px] font-medium" style={{ color: shippingColor }}>
                                {shippingLabel}
                            </span>
                        </button>
                    ) : (
                        <div
                            className="px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ backgroundColor: `${shippingColor}15` }}
                        >
                            <span className="text-[10px] font-medium" style={{ color: shippingColor }}>
                                {shippingLabel}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-2 cursor-pointer" onClick={() => onSelect(order)}>
                <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: theme.colors.textSecondary }}>
                        {scannedCount} of {expectedCount} cartons
                    </span>
                    {exceptionCount > 0 && (
                        <span style={{ color: '#B85C5C' }}>
                            {exceptionCount} exception{exceptionCount !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: theme.colors.border }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                            width: `${progressPercent}%`,
                            backgroundColor: statusColor,
                        }}
                    />
                </div>
            </div>

            {/* Footer with address and date */}
            <div className="flex items-center justify-between cursor-pointer" onClick={() => onSelect(order)}>
                <div className="flex items-center gap-3 text-xs" style={{ color: theme.colors.textSecondary }}>
                    <span className="truncate max-w-[140px]">{order.shipTo.split(',')[0]}</span>
                    {order.estimatedDelivery && (
                        <span className="flex items-center gap-1 flex-shrink-0">
                            <Calendar className="w-3 h-3" />
                            {formatDate(order.estimatedDelivery)}
                        </span>
                    )}
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.border }} />
            </div>
        </GlassCard>
    );
};

// ============================================
// TRACKING MAP MODAL
// ============================================
const TrackingModal = ({ order, show, onClose, theme }) => {
    if (!show || !order) return null;

    const trackingLocation = order.trackingLocation;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div
                className="relative w-full max-w-lg rounded-2xl overflow-hidden"
                style={{ backgroundColor: theme.colors.surface }}
            >
                {/* Map placeholder */}
                <div 
                    className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 relative flex items-center justify-center"
                >
                    <div className="text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-2" style={{ color: theme.colors.accent }} />
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {trackingLocation?.city || 'Location unavailable'}
                        </p>
                        {trackingLocation?.eta && (
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                ETA: {trackingLocation.eta}
                            </p>
                        )}
                    </div>
                    {/* Simulated map marker */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 animate-ping absolute" />
                        <div className="w-4 h-4 rounded-full bg-blue-600 relative" />
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold" style={{ color: theme.colors.textPrimary }}>
                            Shipment Tracking
                        </h3>
                        <span 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ 
                                backgroundColor: `${SHIPPING_STATUS_COLORS[order.shippingStatus]}15`,
                                color: SHIPPING_STATUS_COLORS[order.shippingStatus]
                            }}
                        >
                            {SHIPPING_STATUS_LABELS[order.shippingStatus]}
                        </span>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span style={{ color: theme.colors.textSecondary }}>Order</span>
                            <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                                {order.soNumber}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: theme.colors.textSecondary }}>Carrier</span>
                            <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                                {order.shipments?.[0]?.carrier || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: theme.colors.textSecondary }}>Tracking #</span>
                            <span className="font-medium font-mono text-xs" style={{ color: theme.colors.textPrimary }}>
                                {order.shipments?.[0]?.trackingNumber || 'N/A'}
                            </span>
                        </div>
                        {trackingLocation?.lastUpdate && (
                            <div className="flex justify-between">
                                <span style={{ color: theme.colors.textSecondary }}>Last Update</span>
                                <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                                    {formatRelativeTime(trackingLocation.lastUpdate)}
                                </span>
                            </div>
                        )}
                    </div>

                    <Button
                        theme={theme}
                        variant="primary"
                        size="md"
                        onClick={onClose}
                        fullWidth
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ============================================
// MAIN SCAN SCREEN
// ============================================
export const ScanScreen = ({ theme, onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [trackingOrder, setTrackingOrder] = useState(null);
    const {
        scanEvents,
        exceptions,
        isOnline,
        isSyncing,
        queuedCount,
        retrySync,
        getRecentScans,
    } = useScanStore();

    const recentScans = useMemo(() => getRecentScans(10), [getRecentScans]);

    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return MOCK_ORDERS;
        const q = searchQuery.toLowerCase();
        return MOCK_ORDERS.filter(order =>
            order.projectName.toLowerCase().includes(q) ||
            order.poNumber.toLowerCase().includes(q) ||
            order.soNumber?.toLowerCase().includes(q) ||
            order.id.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    const handleScanToReceive = useCallback(() => {
        onNavigate('resources/scan/camera');
    }, [onNavigate]);

    const handleSelectOrder = useCallback((order) => {
        onNavigate(`resources/scan/order/${order.id}`);
    }, [onNavigate]);

    const handleTrackShipment = useCallback((order) => {
        setTrackingOrder(order);
    }, []);

    return (
        <ScreenLayout
            theme={theme}
            maxWidth="default"
            padding={true}
            paddingBottom="8rem"
            gap="1rem"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                        {SCAN_CONFIG.displayName}
                    </h1>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        {SCAN_CONFIG.subtitle}
                    </p>
                </div>
                <SyncStatusIndicator
                    isOnline={isOnline}
                    queuedCount={queuedCount}
                    isSyncing={isSyncing}
                    onRetry={retrySync}
                    theme={theme}
                />
            </div>

            {/* Primary Action - Single button, full width */}
            <GlassCard theme={theme} variant="elevated" className="p-4">
                <Button
                    theme={theme}
                    variant="primary"
                    size="lg"
                    icon={Scan}
                    onClick={handleScanToReceive}
                    fullWidth
                >
                    Scan to Receive
                </Button>
            </GlassCard>

            {/* Search */}
            <div className="relative">
                <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: theme.colors.textSecondary }}
                />
                <input
                    type="text"
                    placeholder="Search by PO, order #, or project..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-3 pl-12 pr-4 rounded-full text-sm outline-none transition-all focus:ring-2 focus:ring-offset-2"
                    style={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.textPrimary,
                        '--tw-ring-color': `${theme.colors.accent}40`,
                    }}
                />
            </div>

            {/* Recent Activity */}
            {recentScans.length > 0 && !searchQuery && (
                <GlassCard theme={theme} variant="elevated" className="overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between"
                         style={{ borderBottom: `1px solid ${theme.colors.border}20` }}>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" style={{ color: theme.colors.accent }} />
                            <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                                Recent Activity
                            </span>
                        </div>
                        <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            Last {recentScans.length} scans
                        </span>
                    </div>
                    <div className="px-3">
                        {recentScans.slice(0, 5).map((scan, idx) => (
                            <RecentScanItem
                                key={scan.id}
                                scan={scan}
                                theme={theme}
                                isLast={idx === Math.min(recentScans.length - 1, 4)}
                            />
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Orders List */}
            <SectionHeader theme={theme} title="Orders" />
            <div className="space-y-3">
                {filteredOrders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        scanEvents={scanEvents}
                        exceptions={exceptions}
                        theme={theme}
                        onSelect={handleSelectOrder}
                        onTrackShipment={handleTrackShipment}
                    />
                ))}
                {filteredOrders.length === 0 && (
                    <div className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto mb-3" style={{ color: theme.colors.border }} />
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                            No orders found for "{searchQuery}"
                        </p>
                    </div>
                )}
            </div>

            {/* Tracking Modal */}
            <TrackingModal
                order={trackingOrder}
                show={!!trackingOrder}
                onClose={() => setTrackingOrder(null)}
                theme={theme}
            />
        </ScreenLayout>
    );
};

export default ScanScreen;
