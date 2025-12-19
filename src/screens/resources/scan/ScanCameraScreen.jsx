import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
    Camera, X, Check, AlertTriangle, Package, Zap, Type,
    ChevronDown, Image, MapPin, FileText, RefreshCw, PartyPopper,
    Phone, Mail
} from 'lucide-react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Button } from '../../../design-system/Button.jsx';
import { useScanStore } from './useScanStore.js';
import {
    EXCEPTION_TYPE,
    EXCEPTION_LABELS,
    SYNC_STATUS_COLORS,
    SYNC_STATUS,
    formatRelativeTime,
    MOCK_ORDERS,
    findLPNInOrders,
    parseScanBarcode,
    isOrderComplete,
} from './data.js';
import jsQR from 'jsqr';

// ============================================
// SCAN RESULT FEEDBACK
// ============================================
const ScanFeedback = ({ result, theme, onDismiss }) => {
    useEffect(() => {
        if (result) {
            const timer = setTimeout(onDismiss, 2500);
            return () => clearTimeout(timer);
        }
    }, [result, onDismiss]);

    if (!result) return null;

    const isSuccess = result.success && !result.isUnknown;
    const isWarning = result.success && (result.isDuplicate || result.isUnknown);
    const isError = !result.success;

    const bgColor = isError ? '#B85C5C' : isWarning ? '#C4956A' : '#4A7C59';

    return (
        <div
            className="fixed inset-x-4 top-24 z-50 animate-slide-down"
            style={{ animation: 'slideDown 0.3s ease-out' }}
        >
            <GlassCard theme={theme} className="p-4" style={{ backgroundColor: bgColor }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        {isError ? (
                            <X className="w-5 h-5 text-white" />
                        ) : isWarning ? (
                            <AlertTriangle className="w-5 h-5 text-white" />
                        ) : (
                            <Check className="w-5 h-5 text-white" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-white text-sm">
                            {isError ? 'Scan Failed' : isWarning ? (result.isUnknown ? 'Unknown LPN' : 'Already Scanned') : 'Received'}
                        </p>
                        <p className="text-white/80 text-xs">
                            {result.error || result.lpn || result.event?.lpn || 'Item recorded successfully'}
                            {result.projectName && ` • ${result.projectName}`}
                        </p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

// ============================================
// ORDER COMPLETE CELEBRATION
// ============================================
const OrderCompleteModal = ({ show, order, theme, onContinue, onViewOrder }) => {
    if (!show || !order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" />
            <div
                className="relative w-full max-w-sm rounded-2xl p-6 text-center"
                style={{ backgroundColor: theme.colors.surface, animation: 'scaleIn 0.3s ease-out' }}
            >
                <div 
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: '#4A7C5915' }}
                >
                    <PartyPopper className="w-10 h-10" style={{ color: '#4A7C59' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
                    Order Complete!
                </h3>
                <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
                    All {order.expectedLPNs?.length || 0} cartons for <strong>{order.projectName}</strong> have been received.
                </p>
                <div className="flex gap-3">
                    <Button
                        theme={theme}
                        variant="secondary"
                        size="md"
                        onClick={onContinue}
                        fullWidth
                    >
                        Continue Scanning
                    </Button>
                    <Button
                        theme={theme}
                        variant="primary"
                        size="md"
                        onClick={onViewOrder}
                        fullWidth
                    >
                        View Order
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ============================================
// DAMAGE REPORT MODAL (INTEGRATES WITH REPLACEMENTS)
// ============================================
const DamageReportModal = ({ show, lpnInfo, order, theme, onSubmit, onClose, onNavigate }) => {
    const [note, setNote] = useState('');
    const [photos, setPhotos] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (show) {
            setNote('');
            setPhotos([]);
        }
    }, [show]);

    const handlePhotoUpload = async (e) => {
        if (e.target.files) {
            const newPhotos = await Promise.all(
                Array.from(e.target.files).slice(0, 3 - photos.length).map(file =>
                    new Promise(resolve => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    })
                )
            );
            setPhotos(prev => [...prev, ...newPhotos]);
        }
    };

    const handleSubmit = useCallback(async () => {
        if (photos.length === 0) {
            alert('At least one photo is required for damage claims');
            return;
        }

        setIsSubmitting(true);
        
        // Submit exception to scan store
        await onSubmit({
            type: EXCEPTION_TYPE.DAMAGED,
            lpn: lpnInfo?.lpn,
            description: lpnInfo?.description,
            note,
            photos,
        });

        // Navigate to replacements screen with pre-filled warranty claim data
        onNavigate('replacements');
        
        setIsSubmitting(false);
    }, [lpnInfo, note, photos, onSubmit, onNavigate]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div
                className="relative w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
                style={{ backgroundColor: theme.colors.surface }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#B85C5C15' }}
                        >
                            <AlertTriangle className="w-5 h-5" style={{ color: '#B85C5C' }} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                Report Damage
                            </h3>
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                {lpnInfo?.lpn || 'Unknown Item'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.colors.subtle }}
                    >
                        <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>

                {/* Item info */}
                {order && (
                    <div 
                        className="p-3 rounded-xl mb-4"
                        style={{ backgroundColor: theme.colors.subtle }}
                    >
                        <p className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                            {lpnInfo?.description || 'Unknown item'}
                        </p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            {order.projectName} • {order.soNumber}
                        </p>
                    </div>
                )}

                {/* Photo capture - Required */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>
                        Photos (Required)
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        className="hidden"
                        onChange={handlePhotoUpload}
                    />
                    
                    {photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {photos.map((photo, idx) => (
                                <div key={idx} className="relative rounded-xl overflow-hidden aspect-square">
                                    <img src={photo} alt="" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setPhotos(p => p.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
                        style={{ 
                            border: `2px dashed ${photos.length === 0 ? '#B85C5C' : theme.colors.border}`,
                            backgroundColor: theme.colors.subtle,
                        }}
                    >
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${theme.colors.accent}15` }}
                        >
                            <Camera className="w-5 h-5" style={{ color: theme.colors.accent }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                            {photos.length > 0 ? 'Add More Photos' : 'Take Photo of Damage'}
                        </span>
                    </button>
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>
                        Damage Description
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Describe the damage (e.g., dented corner, torn packaging)..."
                        rows={3}
                        className="w-full p-3 rounded-xl text-sm outline-none resize-none"
                        style={{
                            backgroundColor: theme.colors.subtle,
                            border: `1px solid ${theme.colors.border}`,
                            color: theme.colors.textPrimary,
                        }}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        theme={theme}
                        variant="secondary"
                        size="lg"
                        onClick={onClose}
                        fullWidth
                    >
                        Cancel
                    </Button>
                    <Button
                        theme={theme}
                        variant="primary"
                        size="lg"
                        onClick={handleSubmit}
                        disabled={photos.length === 0 || isSubmitting}
                        fullWidth
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit & File Claim'}
                    </Button>
                </div>

                <p className="text-center text-xs mt-3" style={{ color: theme.colors.textSecondary }}>
                    This will create a warranty claim in Replacements
                </p>
            </div>
        </div>
    );
};

// ============================================
// MANUAL ENTRY MODAL
// ============================================
const ManualEntryModal = ({ show, theme, onSubmit, onClose }) => {
    const [lpnValue, setLpnValue] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (show) {
            setLpnValue('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (lpnValue.trim()) {
            onSubmit(lpnValue.trim());
            setLpnValue('');
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div
                className="relative w-full max-w-lg rounded-t-3xl p-6"
                style={{ backgroundColor: theme.colors.surface }}
            >
                <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: theme.colors.border }} />
                <h3 className="text-lg font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
                    Manual LPN Entry
                </h3>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={lpnValue}
                        onChange={(e) => setLpnValue(e.target.value)}
                        placeholder="Enter LPN (e.g., LPN-001-A)"
                        className="w-full p-4 rounded-xl text-base outline-none mb-4"
                        style={{
                            backgroundColor: theme.colors.subtle,
                            border: `1px solid ${theme.colors.border}`,
                            color: theme.colors.textPrimary,
                        }}
                    />
                    <div className="flex gap-3">
                        <Button
                            theme={theme}
                            variant="secondary"
                            size="lg"
                            onClick={onClose}
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button
                            theme={theme}
                            variant="primary"
                            size="lg"
                            type="submit"
                            disabled={!lpnValue.trim()}
                            fullWidth
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================
// MISSING ITEM MODAL
// ============================================
const MissingItemModal = ({ show, theme, onSubmit, onClose }) => {
    const [note, setNote] = useState('');

    useEffect(() => {
        if (show) {
            setNote('');
        }
    }, [show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ type: EXCEPTION_TYPE.MISSING, note: note.trim() });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div
                className="relative w-full max-w-lg rounded-t-3xl p-6"
                style={{ backgroundColor: theme.colors.surface }}
            >
                <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: theme.colors.border }} />
                <h3 className="text-lg font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
                    Report Missing Item
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                            Description
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Describe which item is missing..."
                            rows={3}
                            className="w-full p-3 rounded-xl text-sm outline-none resize-none"
                            style={{
                                backgroundColor: theme.colors.subtle,
                                border: `1px solid ${theme.colors.border}`,
                                color: theme.colors.textPrimary,
                            }}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button theme={theme} variant="secondary" size="lg" onClick={onClose} fullWidth>
                            Cancel
                        </Button>
                        <Button theme={theme} variant="primary" size="lg" type="submit" fullWidth>
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================
// MAIN CAMERA SCAN SCREEN
// ============================================
export const ScanCameraScreen = ({ theme, onNavigate, handleBack }) => {
const videoRef = useRef(null);
const canvasRef = useRef(null);
const streamRef = useRef(null);
const scanLoopRef = useRef(null);

const [scanResult, setScanResult] = useState(null);
const [showManualEntry, setShowManualEntry] = useState(false);
const [showDamageModal, setShowDamageModal] = useState(false);
const [showMissingModal, setShowMissingModal] = useState(false);
const [scanCount, setScanCount] = useState(0);
const [isScanning, setIsScanning] = useState(false);
const [hasPermission, setHasPermission] = useState(null);
const [currentScanContext, setCurrentScanContext] = useState(null);
const [completedOrder, setCompletedOrder] = useState(null);
const [lastScanLPN, setLastScanLPN] = useState(null);
    
// Parse orderId from URL if scanning for specific order
const [targetOrderId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('orderId');
});
const targetOrder = useMemo(() => targetOrderId ? MOCK_ORDERS.find(o => o.id === targetOrderId) : null, [targetOrderId]);

const { addScanEvent, addException, isOnline, queuedCount, scanEvents } = useScanStore();
    
// Calculate progress for target order
const orderProgress = useMemo(() => {
    if (!targetOrder) return null;
    const orderScans = scanEvents.filter(s => s.orderId === targetOrder.id && s.action === 'receive');
    const scannedLPNs = new Set(orderScans.map(s => s.lpn));
    return { scanned: scannedLPNs.size, total: targetOrder.expectedLPNs.length };
}, [targetOrder, scanEvents]);

    // Process scan from any source (camera or manual)
    const handleScan = useCallback((barcode, metadata = {}) => {
        const parsed = parseScanBarcode(barcode);
        if (parsed.error || !parsed.lpn) {
            setScanResult({ success: false, error: 'Invalid barcode' });
            return;
        }

        // Prevent rapid duplicate scans
        if (lastScanLPN === parsed.lpn) {
            setScanResult({ success: true, isDuplicate: true, lpn: parsed.lpn });
            return;
        }

        // Look up LPN
        const lookup = findLPNInOrders(parsed.lpn);
        
        const result = addScanEvent(barcode, metadata);
        setScanResult({
            ...result,
            lpn: parsed.lpn,
            projectName: lookup?.order?.projectName,
        });
        
        if (result.success) {
            setScanCount(prev => prev + 1);
            setLastScanLPN(parsed.lpn);
            
            // Store context for damage reporting
            if (lookup) {
                setCurrentScanContext({ order: lookup.order, lpnInfo: lookup.lpnInfo });
                
                // Check if order is complete after this scan
                setTimeout(() => {
                    const orderScans = scanEvents.filter(s => s.orderId === lookup.order.id);
                    const scannedLPNs = new Set(orderScans.map(s => s.lpn));
                    scannedLPNs.add(parsed.lpn);
                    
                    if (lookup.order.expectedLPNs.every(item => scannedLPNs.has(item.lpn))) {
                        setCompletedOrder(lookup.order);
                    }
                }, 300);
            }
            
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(result.isUnknown || result.isDuplicate ? [50, 50, 50] : 50);
            }
        }
    }, [addScanEvent, scanEvents, lastScanLPN]);

    // Real camera QR scanning loop
    const startScanLoop = useCallback(() => {
        if (scanLoopRef.current) return;

        scanLoopRef.current = setInterval(() => {
            if (!videoRef.current || !canvasRef.current) return;
            if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code && code.data) {
                handleScan(code.data);
            }
        }, 250);
    }, [handleScan]);

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.playsInline = true;
                videoRef.current.muted = true;
                await videoRef.current.play();
            }

            setHasPermission(true);
            setIsScanning(true);
            startScanLoop();
        } catch (err) {
            console.error('Camera error:', err);
            setHasPermission(false);
        }
    }, [startScanLoop]);

    // Stop camera
    const stopCamera = useCallback(() => {
        if (scanLoopRef.current) {
            clearInterval(scanLoopRef.current);
            scanLoopRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
    }, []);

    // Lifecycle
    useEffect(() => {
        startCamera();
        return stopCamera;
    }, [startCamera, stopCamera]);

    const handleManualSubmit = useCallback((lpn) => {
        setShowManualEntry(false);
        handleScan(lpn);
    }, [handleScan]);

    const handleDamageSubmit = useCallback(async (damageData) => {
        const orderId = currentScanContext?.order?.id || targetOrder?.id;
        if (orderId) {
            await addException(EXCEPTION_TYPE.DAMAGED, {
                orderId,
                ...damageData,
            });
        }
        setShowDamageModal(false);
    }, [addException, currentScanContext, targetOrder]);

    const handleMissingSubmit = useCallback((data) => {
        const orderId = currentScanContext?.order?.id || targetOrder?.id;
        if (orderId) {
            addException(EXCEPTION_TYPE.MISSING, {
                orderId,
                ...data,
            });
        }
        setShowMissingModal(false);
    }, [addException, currentScanContext, targetOrder]);

    const handleClose = useCallback(() => {
        stopCamera();
        if (handleBack) {
            handleBack();
        } else {
            onNavigate('resources/scan');
        }
    }, [handleBack, onNavigate, stopCamera]);

    // Simulated scan for demo
    const simulateScan = useCallback(() => {
        const mockBarcodes = [
            'LPN-001-A', 'LPN-001-B', 'LPN-002-A', 'LPN-002-B', 'LPN-002-C',
            'LPN-003-A', 'LPN-UNKNOWN-123',
        ];
        const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
        handleScan(randomBarcode);
    }, [handleScan]);

    return (
        <div className="fixed inset-0 z-40 flex flex-col" style={{ backgroundColor: '#000' }}>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between"
                 style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
                <button
                    onClick={handleClose}
                    className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
                >
                    <X className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-2">
                    {!isOnline && (
                        <div className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                            Offline • {queuedCount} queued
                        </div>
                    )}
                    {/* Show progress for target order, or general scan count */}
                    {orderProgress ? (
                        <div className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium">
                            {orderProgress.scanned}/{orderProgress.total} scanned
                        </div>
                    ) : (
                        <div className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium">
                            {scanCount} scanned
                        </div>
                    )}
                </div>
            </div>
            
            {/* Order context banner */}
            {targetOrder && (
                <div 
                    className="absolute top-20 left-4 right-4 z-10 p-3 rounded-xl"
                    style={{ 
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        marginTop: 'env(safe-area-inset-top, 0px)'
                    }}
                >
                    <p className="text-white font-semibold text-sm truncate">{targetOrder.projectName}</p>
                    <p className="text-white/70 text-xs">{targetOrder.soNumber}</p>
                </div>
            )}

            {/* Camera View */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Real camera video */}
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                    autoPlay
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Fallback gradient background when no camera */}
                {hasPermission === false && (
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800" />
                )}
                
                {/* Scan target area */}
                <div className="relative w-72 h-72 pointer-events-none">
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-lg" />
                    
                    {/* Scanning line animation */}
                    {isScanning && (
                        <div
                            className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                            style={{ animation: 'scan 2s ease-in-out infinite' }}
                        />
                    )}
                </div>

                {/* Camera permission denied */}
                {hasPermission === false && (
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="text-center">
                            <Camera className="w-16 h-16 mx-auto mb-4 text-white/40" />
                            <p className="text-white font-semibold mb-2">Camera Access Required</p>
                            <p className="text-white/60 text-sm mb-4">
                                Enable camera permissions or use manual entry
                            </p>
                            <Button theme={theme} variant="primary" onClick={startCamera}>
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="absolute bottom-32 left-0 right-0 text-center">
                    <p className="text-white/80 text-sm">
                        {isScanning ? 'Point camera at barcode or QR code' : 'Starting camera...'}
                    </p>
                </div>
            </div>

            {/* Bottom Controls - positioned above nav bar */}
            <div
                className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-6"
                style={{
                    backgroundColor: theme.colors.surface,
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
                }}
            >
                {/* Simulated scan button (for demo) */}
                {hasPermission === false && (
                    <button
                        onClick={simulateScan}
                        className="w-full py-4 rounded-full font-bold text-white flex items-center justify-center gap-2 mb-4 active:scale-98 transition-transform"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        <Zap className="w-5 h-5" />
                        Tap to Simulate Scan
                    </button>
                )}

                {/* Secondary actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowManualEntry(true)}
                        className="flex-1 py-3 rounded-full font-medium text-sm flex items-center justify-center gap-2"
                        style={{
                            backgroundColor: theme.colors.subtle,
                            color: theme.colors.textPrimary,
                        }}
                    >
                        <Type className="w-4 h-4" />
                        Manual
                    </button>
                    <button
                        onClick={() => setShowDamageModal(true)}
                        className="flex-1 py-3 rounded-full font-medium text-sm flex items-center justify-center gap-2"
                        style={{
                            backgroundColor: '#B85C5C15',
                            color: '#B85C5C',
                        }}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Report Damage
                    </button>
                    <button
                        onClick={() => setShowMissingModal(true)}
                        className="flex-1 py-3 rounded-full font-medium text-sm flex items-center justify-center gap-2"
                        style={{
                            backgroundColor: '#C4956A15',
                            color: '#C4956A',
                        }}
                    >
                        <Package className="w-4 h-4" />
                        Missing
                    </button>
                </div>
            </div>

            {/* Scan Feedback */}
            <ScanFeedback
                result={scanResult}
                theme={theme}
                onDismiss={() => setScanResult(null)}
            />

            {/* Modals */}
            <ManualEntryModal
                show={showManualEntry}
                theme={theme}
                onSubmit={handleManualSubmit}
                onClose={() => setShowManualEntry(false)}
            />

            <DamageReportModal
                show={showDamageModal}
                lpnInfo={currentScanContext?.lpnInfo}
                order={currentScanContext?.order || targetOrder}
                theme={theme}
                onSubmit={handleDamageSubmit}
                onClose={() => setShowDamageModal(false)}
                onNavigate={(route) => {
                    stopCamera();
                    onNavigate(route);
                }}
            />

            <MissingItemModal
                show={showMissingModal}
                theme={theme}
                onSubmit={handleMissingSubmit}
                onClose={() => setShowMissingModal(false)}
            />

            <OrderCompleteModal
                show={!!completedOrder}
                order={completedOrder}
                theme={theme}
                onContinue={() => setCompletedOrder(null)}
                onViewOrder={() => {
                    stopCamera();
                    onNavigate(`resources/scan/order/${completedOrder.id}`);
                }}
            />

            {/* CSS for scanning animation */}
            <style>{`
                @keyframes scan {
                    0%, 100% { top: 10%; opacity: 0; }
                    50% { top: 90%; opacity: 1; }
                }
                @keyframes scaleIn {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-scan {
                    animation: scan 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default ScanCameraScreen;
