// Scan Mini App - Local State Management with Offline Support
import { useState, useEffect, useCallback, useRef } from 'react';
import { SYNC_STATUS, MOCK_SCAN_EVENTS, MOCK_EXCEPTIONS, MOCK_ORDERS, parseScanBarcode, findLPNInOrders } from './data.js';

const STORAGE_KEY = 'myjsi:scan:queue';
const SCAN_EVENTS_KEY = 'myjsi:scan:events';
const EXCEPTIONS_KEY = 'myjsi:scan:exceptions';

// Dedupe window in milliseconds (prevent spam)
const DEDUPE_WINDOW_MS = 3000;

/**
 * Custom hook for managing scan state with offline support
 */
export const useScanStore = () => {
    const [scanEvents, setScanEvents] = useState([]);
    const [exceptions, setExceptions] = useState([]);
    const [offlineQueue, setOfflineQueue] = useState([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const lastScanRef = useRef({ lpn: null, timestamp: 0 });

    // Load persisted data on mount
    useEffect(() => {
        try {
            const storedEvents = localStorage.getItem(SCAN_EVENTS_KEY);
            const storedExceptions = localStorage.getItem(EXCEPTIONS_KEY);
            const storedQueue = localStorage.getItem(STORAGE_KEY);

            if (storedEvents) {
                setScanEvents(JSON.parse(storedEvents));
            } else {
                // Initialize with mock data
                setScanEvents(MOCK_SCAN_EVENTS);
            }

            if (storedExceptions) {
                setExceptions(JSON.parse(storedExceptions));
            } else {
                setExceptions(MOCK_EXCEPTIONS);
            }

            if (storedQueue) {
                setOfflineQueue(JSON.parse(storedQueue));
            }
        } catch (e) {
            console.error('Failed to load scan data:', e);
            setScanEvents(MOCK_SCAN_EVENTS);
            setExceptions(MOCK_EXCEPTIONS);
        }
    }, []);

    // Persist data changes
    useEffect(() => {
        try {
            localStorage.setItem(SCAN_EVENTS_KEY, JSON.stringify(scanEvents));
        } catch (e) {
            console.error('Failed to persist scan events:', e);
        }
    }, [scanEvents]);

    useEffect(() => {
        try {
            localStorage.setItem(EXCEPTIONS_KEY, JSON.stringify(exceptions));
        } catch (e) {
            console.error('Failed to persist exceptions:', e);
        }
    }, [exceptions]);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(offlineQueue));
        } catch (e) {
            console.error('Failed to persist offline queue:', e);
        }
    }, [offlineQueue]);

    // Online/offline detection
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Auto-sync when coming back online
    useEffect(() => {
        if (isOnline && offlineQueue.length > 0 && !isSyncing) {
            syncQueue();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline]);

    /**
     * Add a scan event (receive action)
     */
    const addScanEvent = useCallback((rawBarcode, metadata = {}) => {
        const parsed = parseScanBarcode(rawBarcode);
        
        if (parsed.error) {
            return { success: false, error: parsed.error };
        }

        const { lpn, orderId: parsedOrderId, shipmentId: parsedShipmentId } = parsed;

        // Dedupe check
        const now = Date.now();
        if (lastScanRef.current.lpn === lpn && (now - lastScanRef.current.timestamp) < DEDUPE_WINDOW_MS) {
            return { success: false, error: 'Duplicate scan detected', isDuplicate: true };
        }
        lastScanRef.current = { lpn, timestamp: now };

        // Look up LPN in orders
        const lookup = findLPNInOrders(lpn, MOCK_ORDERS);
        const orderId = parsedOrderId || lookup?.order?.id || null;
        const shipmentId = parsedShipmentId || lookup?.lpnInfo?.shipmentId || null;
        const description = lookup?.lpnInfo?.description || null;

        // Check if already scanned (duplicate in history)
        const existingScan = scanEvents.find(s => s.lpn === lpn && s.action === 'receive');
        const isDuplicateInHistory = !!existingScan;

        const newEvent = {
            id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            lpn,
            orderId,
            shipmentId,
            description,
            action: 'receive',
            timestamp: now,
            userId: 1, // Would come from auth
            userName: 'Luke Wagner',
            syncStatus: isOnline ? SYNC_STATUS.SYNCED : SYNC_STATUS.QUEUED,
            location: metadata.location || null,
            note: metadata.note || null,
            isDuplicate: isDuplicateInHistory,
            isUnknown: !lookup,
        };

        setScanEvents(prev => [newEvent, ...prev]);

        // Add to offline queue if not online
        if (!isOnline) {
            setOfflineQueue(prev => [...prev, { ...newEvent, type: 'scan' }]);
        }

        return {
            success: true,
            event: newEvent,
            order: lookup?.order || null,
            lpnInfo: lookup?.lpnInfo || null,
            isDuplicate: isDuplicateInHistory,
            isUnknown: !lookup,
        };
    }, [scanEvents, isOnline]);

    /**
     * Add an exception (damaged, missing, wrong item, unknown LPN)
     */
    const addException = useCallback((type, data) => {
        const now = Date.now();
        const newException = {
            id: `exc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            orderId: data.orderId || null,
            type,
            lpn: data.lpn || null,
            description: data.description || null,
            note: data.note || '',
            photos: data.photos || [],
            timestamp: now,
            userId: 1,
            userName: 'Luke Wagner',
            syncStatus: isOnline ? SYNC_STATUS.SYNCED : SYNC_STATUS.QUEUED,
        };

        setExceptions(prev => [newException, ...prev]);

        if (!isOnline) {
            setOfflineQueue(prev => [...prev, { ...newException, type: 'exception' }]);
        }

        return { success: true, exception: newException };
    }, [isOnline]);

    /**
     * Mark receiving as complete for an order
     */
    const markReceivingComplete = useCallback((orderId) => {
        // In a real app, this would call an API
        // For mock, we just verify all LPNs are scanned
        const order = MOCK_ORDERS.find(o => o.id === orderId);
        if (!order) return { success: false, error: 'Order not found' };

        const orderScans = scanEvents.filter(s => s.orderId === orderId && s.action === 'receive');
        const scannedLPNs = new Set(orderScans.map(s => s.lpn));
        const allScanned = order.expectedLPNs.every(item => scannedLPNs.has(item.lpn));

        if (!allScanned) {
            return { success: false, error: 'Not all LPNs have been scanned' };
        }

        // Mark complete (in real app, this would be an API call)
        return { success: true };
    }, [scanEvents]);

    /**
     * Close with variance
     */
    const closeWithVariance = useCallback((orderId, reason) => {
        if (!reason?.trim()) {
            return { success: false, error: 'Reason is required' };
        }

        const newException = {
            id: `exc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            orderId,
            type: 'closed_with_variance',
            reason,
            timestamp: Date.now(),
            userId: 1,
            userName: 'Luke Wagner',
            syncStatus: isOnline ? SYNC_STATUS.SYNCED : SYNC_STATUS.QUEUED,
        };

        setExceptions(prev => [newException, ...prev]);

        if (!isOnline) {
            setOfflineQueue(prev => [...prev, { ...newException, type: 'exception' }]);
        }

        return { success: true };
    }, [isOnline]);

    /**
     * Sync offline queue
     */
    const syncQueue = useCallback(async () => {
        if (offlineQueue.length === 0 || isSyncing) return;

        setIsSyncing(true);

        // Simulate API calls for each queued item
        const updatedQueue = [];
        const syncedIds = new Set();

        for (const item of offlineQueue) {
            try {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Mark as synced (in real app, this would be after successful API call)
                syncedIds.add(item.id);
            } catch (e) {
                // Keep failed items in queue
                updatedQueue.push(item);
            }
        }

        // Update sync status in events/exceptions
        if (syncedIds.size > 0) {
            setScanEvents(prev => prev.map(event =>
                syncedIds.has(event.id) ? { ...event, syncStatus: SYNC_STATUS.SYNCED } : event
            ));
            setExceptions(prev => prev.map(exc =>
                syncedIds.has(exc.id) ? { ...exc, syncStatus: SYNC_STATUS.SYNCED } : exc
            ));
        }

        setOfflineQueue(updatedQueue);
        setIsSyncing(false);
    }, [offlineQueue, isSyncing]);

    /**
     * Retry failed sync
     */
    const retrySync = useCallback(() => {
        if (isOnline) {
            syncQueue();
        }
    }, [isOnline, syncQueue]);

    /**
     * Get recent scans (last 10)
     */
    const getRecentScans = useCallback((limit = 10) => {
        return scanEvents.slice(0, limit);
    }, [scanEvents]);

    /**
     * Get scans for a specific order
     */
    const getOrderScans = useCallback((orderId) => {
        return scanEvents.filter(s => s.orderId === orderId);
    }, [scanEvents]);

    /**
     * Get exceptions for a specific order
     */
    const getOrderExceptions = useCallback((orderId) => {
        return exceptions.filter(e => e.orderId === orderId);
    }, [exceptions]);

    /**
     * Get queued count
     */
    const queuedCount = offlineQueue.length;

    return {
        // State
        scanEvents,
        exceptions,
        isOnline,
        isSyncing,
        queuedCount,

        // Actions
        addScanEvent,
        recordScan: addScanEvent, // Alias for convenience
        addException,
        markReceivingComplete,
        closeWithVariance,
        syncQueue,
        retrySync,

        // Queries
        getRecentScans,
        getOrderScans,
        getOrderExceptions,
    };
};

export default useScanStore;
