// Scan Mini App - Data & Configuration
// Feature flag controlled delivery scanning tool

// ============================================
// FEATURE FLAG
// ============================================
export const SCAN_FEATURE_FLAG = {
    enabled: true, // Global feature flag
    // Per-account enablement could be added here
};

// ============================================
// DISPLAY CONFIGURATION
// ============================================
export const SCAN_CONFIG = {
    displayName: 'Scan', // Configurable: "Dock", "Receive", "Check-In"
    subtitle: 'Receive and confirm deliveries',
    route: 'resources/scan',
};

// ============================================
// RECEIVING STATUS STATES
// ============================================
export const RECEIVING_STATUS = {
    NOT_STARTED: 'not_started',
    PARTIAL: 'partial',
    COMPLETE: 'complete',
    CLOSED_WITH_VARIANCE: 'closed_with_variance',
};

export const RECEIVING_STATUS_LABELS = {
    [RECEIVING_STATUS.NOT_STARTED]: 'Not Started',
    [RECEIVING_STATUS.PARTIAL]: 'Partial',
    [RECEIVING_STATUS.COMPLETE]: 'Complete',
    [RECEIVING_STATUS.CLOSED_WITH_VARIANCE]: 'Closed with Variance',
};

export const RECEIVING_STATUS_COLORS = {
    [RECEIVING_STATUS.NOT_STARTED]: '#6b7280', // gray
    [RECEIVING_STATUS.PARTIAL]: '#C4956A', // warning/amber
    [RECEIVING_STATUS.COMPLETE]: '#4A7C59', // success/green
    [RECEIVING_STATUS.CLOSED_WITH_VARIANCE]: '#B85C5C', // error/red
};

// ============================================
// SHIPPING STATUS STATES
// ============================================
export const SHIPPING_STATUS = {
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    IN_TRANSIT: 'in_transit',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
};

export const SHIPPING_STATUS_LABELS = {
    [SHIPPING_STATUS.PROCESSING]: 'Processing',
    [SHIPPING_STATUS.SHIPPED]: 'Shipped',
    [SHIPPING_STATUS.IN_TRANSIT]: 'In Transit',
    [SHIPPING_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
    [SHIPPING_STATUS.DELIVERED]: 'Delivered',
};

export const SHIPPING_STATUS_COLORS = {
    [SHIPPING_STATUS.PROCESSING]: '#6b7280',
    [SHIPPING_STATUS.SHIPPED]: '#5B7B8C',
    [SHIPPING_STATUS.IN_TRANSIT]: '#C4956A',
    [SHIPPING_STATUS.OUT_FOR_DELIVERY]: '#4A7C59',
    [SHIPPING_STATUS.DELIVERED]: '#4A7C59',
};

// ============================================
// EXCEPTION TYPES
// ============================================
export const EXCEPTION_TYPE = {
    MISSING: 'missing',
    DAMAGED: 'damaged',
    WRONG_ITEM: 'wrong_item',
    UNKNOWN_LPN: 'unknown_lpn',
};

export const EXCEPTION_LABELS = {
    [EXCEPTION_TYPE.MISSING]: 'Missing',
    [EXCEPTION_TYPE.DAMAGED]: 'Damaged',
    [EXCEPTION_TYPE.WRONG_ITEM]: 'Wrong Item',
    [EXCEPTION_TYPE.UNKNOWN_LPN]: 'Unknown LPN',
};

// ============================================
// SYNC STATUS
// ============================================
export const SYNC_STATUS = {
    QUEUED: 'queued',
    SYNCING: 'syncing',
    SYNCED: 'synced',
    FAILED: 'failed',
};

export const SYNC_STATUS_LABELS = {
    [SYNC_STATUS.QUEUED]: 'Queued',
    [SYNC_STATUS.SYNCING]: 'Syncing...',
    [SYNC_STATUS.SYNCED]: 'Synced',
    [SYNC_STATUS.FAILED]: 'Failed',
};

export const SYNC_STATUS_COLORS = {
    [SYNC_STATUS.QUEUED]: '#C4956A',
    [SYNC_STATUS.SYNCING]: '#5B7B8C',
    [SYNC_STATUS.SYNCED]: '#4A7C59',
    [SYNC_STATUS.FAILED]: '#B85C5C',
};

// ============================================
// MOCK DATA - Expected LPNs per Order
// ============================================
export const MOCK_ORDERS = [
    {
        id: 'ORD-2024-001',
        soNumber: 'SO-450080',
        poNumber: 'PO-78234',
        projectName: 'Riverside Medical Center',
        shipTo: '123 Healthcare Blvd, Indianapolis, IN 46204',
        contacts: [
            { name: 'Sarah Johnson', role: 'Sales', email: 'sarah.j@dealer.com', phone: '555-1234' },
            { name: 'Mike Chen', role: 'Admin', email: 'mike.c@dealer.com', phone: '555-5678' },
        ],
        expectedCartons: 12,
        orderDate: '2025-01-15',
        estimatedDelivery: '2025-01-28',
        shippingStatus: SHIPPING_STATUS.IN_TRANSIT,
        trackingLocation: {
            lat: 39.7684,
            lng: -86.1581,
            city: 'Indianapolis, IN',
            lastUpdate: Date.now() - 3600000,
            eta: '2 hours',
        },
        shipments: [
            { id: 'SHIP-001', carrier: 'FedEx', trackingNumber: '7891234567890' }
        ],
        expectedLPNs: [
            { lpn: 'LPN-001-A', description: 'Executive Desk - Top', shipmentId: 'SHIP-001' },
            { lpn: 'LPN-001-B', description: 'Executive Desk - Base', shipmentId: 'SHIP-001' },
            { lpn: 'LPN-002-A', description: 'Conference Table - Top', shipmentId: 'SHIP-001' },
            { lpn: 'LPN-002-B', description: 'Conference Table - Legs (1/2)', shipmentId: 'SHIP-001' },
            { lpn: 'LPN-002-C', description: 'Conference Table - Legs (2/2)', shipmentId: 'SHIP-001' },
            { lpn: 'LPN-003-A', description: 'Task Chair - Seat', shipmentId: 'SHIP-001' },
            { lpn: 'LPN-003-B', description: 'Task Chair - Back', shipmentId: 'SHIP-001' },
            { lpn: 'LPN-003-C', description: 'Task Chair - Base', shipmentId: 'SHIP-001' },
            { lpn: 'LPN-004-A', description: 'Filing Cabinet', shipmentId: 'SHIP-001' },
            { lpn: 'LPN-005-A', description: 'Bookshelf - Left', shipmentId: 'SHIP-001' },
            { lpn: 'LPN-005-B', description: 'Bookshelf - Right', shipmentId: 'SHIP-001' },
            { lpn: 'LPN-006-A', description: 'Accessories Pack', shipmentId: 'SHIP-001' },
        ],
    },
    {
        id: 'ORD-2024-002',
        soNumber: 'SO-450125',
        poNumber: 'PO-78456',
        projectName: 'Downtown Law Offices',
        shipTo: '456 Legal Ave, Suite 200, Chicago, IL 60601',
        contacts: [
            { name: 'Emily Rodriguez', role: 'Designer', email: 'emily.r@lawfirm.com', phone: '555-9012' },
        ],
        expectedCartons: 8,
        orderDate: '2025-01-18',
        estimatedDelivery: '2025-01-30',
        shippingStatus: SHIPPING_STATUS.SHIPPED,
        shipments: [
            { id: 'SHIP-002', carrier: 'UPS', trackingNumber: '1Z999AA10123456784' }
        ],
        expectedLPNs: [
            { lpn: 'LPN-101-A', description: 'Partner Desk - Top', shipmentId: 'SHIP-002' },
            { lpn: 'LPN-101-B', description: 'Partner Desk - Pedestal L', shipmentId: 'SHIP-002' },
            { lpn: 'LPN-101-C', description: 'Partner Desk - Pedestal R', shipmentId: 'SHIP-002' },
            { lpn: 'LPN-102-A', description: 'Credenza - Main', shipmentId: 'SHIP-002' },
            { lpn: 'LPN-102-B', description: 'Credenza - Hutch', shipmentId: 'SHIP-002' },
            { lpn: 'LPN-103-A', description: 'Guest Chair (1/2)', shipmentId: 'SHIP-002' },
            { lpn: 'LPN-103-B', description: 'Guest Chair (2/2)', shipmentId: 'SHIP-002' },
            { lpn: 'LPN-104-A', description: 'Lateral File', shipmentId: 'SHIP-002' },
        ],
    },
    {
        id: 'ORD-2024-003',
        soNumber: 'SO-450200',
        poNumber: 'PO-78789',
        projectName: 'Tech Startup HQ',
        shipTo: '789 Innovation Dr, Austin, TX 78701',
        contacts: [
            { name: 'Alex Turner', role: 'Facilities', email: 'alex@techstartup.com', phone: '555-3456' },
            { name: 'Jordan Lee', role: 'Admin', email: 'jordan@techstartup.com', phone: '555-7890' },
        ],
        expectedCartons: 15,
        orderDate: '2025-01-20',
        estimatedDelivery: '2025-02-03',
        shippingStatus: SHIPPING_STATUS.PROCESSING,
        shipments: [
            { id: 'SHIP-003A', carrier: 'FedEx Freight', trackingNumber: '123456789012' },
            { id: 'SHIP-003B', carrier: 'FedEx Freight', trackingNumber: '123456789013' }
        ],
        expectedLPNs: [
            { lpn: 'LPN-201-A', description: 'Sit-Stand Desk Frame (1/3)', shipmentId: 'SHIP-003A' },
            { lpn: 'LPN-201-B', description: 'Sit-Stand Desk Frame (2/3)', shipmentId: 'SHIP-003A' },
            { lpn: 'LPN-201-C', description: 'Sit-Stand Desk Frame (3/3)', shipmentId: 'SHIP-003A' },
            { lpn: 'LPN-201-D', description: 'Desk Top - Walnut', shipmentId: 'SHIP-003A' },
            { lpn: 'LPN-202-A', description: 'Monitor Arm Dual', shipmentId: 'SHIP-003A' },
            { lpn: 'LPN-202-B', description: 'Cable Management Kit', shipmentId: 'SHIP-003A' },
            { lpn: 'LPN-203-A', description: 'Ergonomic Chair - Black (1/4)', shipmentId: 'SHIP-003A' },
            { lpn: 'LPN-203-B', description: 'Ergonomic Chair - Black (2/4)', shipmentId: 'SHIP-003B' },
            { lpn: 'LPN-203-C', description: 'Ergonomic Chair - Black (3/4)', shipmentId: 'SHIP-003B' },
            { lpn: 'LPN-203-D', description: 'Ergonomic Chair - Black (4/4)', shipmentId: 'SHIP-003B' },
            { lpn: 'LPN-204-A', description: 'Collaboration Table - Top', shipmentId: 'SHIP-003B' },
            { lpn: 'LPN-204-B', description: 'Collaboration Table - Base', shipmentId: 'SHIP-003B' },
            { lpn: 'LPN-205-A', description: 'Lounge Seating (1/2)', shipmentId: 'SHIP-003B' },
            { lpn: 'LPN-205-B', description: 'Lounge Seating (2/2)', shipmentId: 'SHIP-003B' },
            { lpn: 'LPN-206-A', description: 'Storage Lockers', shipmentId: 'SHIP-003B' },
        ],
    },
];

// Mock scanned events (for demo purposes)
export const MOCK_SCAN_EVENTS = [
    {
        id: 'scan-001',
        lpn: 'LPN-001-A',
        orderId: 'ORD-2024-001',
        shipmentId: 'SHIP-001',
        action: 'receive',
        timestamp: Date.now() - 3600000, // 1 hour ago
        userId: 1,
        userName: 'Luke Wagner',
        syncStatus: SYNC_STATUS.SYNCED,
        location: { floor: '1', zone: 'Dock A' },
    },
    {
        id: 'scan-002',
        lpn: 'LPN-001-B',
        orderId: 'ORD-2024-001',
        shipmentId: 'SHIP-001',
        action: 'receive',
        timestamp: Date.now() - 3500000,
        userId: 1,
        userName: 'Luke Wagner',
        syncStatus: SYNC_STATUS.SYNCED,
        location: { floor: '1', zone: 'Dock A' },
    },
    {
        id: 'scan-003',
        lpn: 'LPN-002-A',
        orderId: 'ORD-2024-001',
        shipmentId: 'SHIP-001',
        action: 'receive',
        timestamp: Date.now() - 1800000, // 30 min ago
        userId: 1,
        userName: 'Luke Wagner',
        syncStatus: SYNC_STATUS.QUEUED,
        location: { floor: '1', zone: 'Dock A' },
    },
];

// Mock exceptions
export const MOCK_EXCEPTIONS = [
    {
        id: 'exc-001',
        orderId: 'ORD-2024-002',
        type: EXCEPTION_TYPE.DAMAGED,
        lpn: 'LPN-102-A',
        description: 'Credenza - Main',
        note: 'Corner dented during shipping',
        photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
        timestamp: Date.now() - 86400000, // 1 day ago
        userId: 1,
        userName: 'Luke Wagner',
    },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse a scanned barcode to extract LPN and OrderId
 * Supports formats:
 * - Simple LPN: "LPN-001-A"
 * - With Order: "ORD-2024-001|LPN-001-A"
 * - QR JSON: {"lpn":"LPN-001-A","orderId":"ORD-2024-001"}
 */
export const parseScanBarcode = (rawValue) => {
    if (!rawValue) return { lpn: null, orderId: null, shipmentId: null, error: 'Empty scan' };
    
    const trimmed = rawValue.trim();
    
    // Try JSON format first
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed.lpn) {
            return {
                lpn: parsed.lpn,
                orderId: parsed.orderId || null,
                shipmentId: parsed.shipmentId || null,
                error: null,
            };
        }
    } catch (e) {
        // Not JSON, continue with other formats
    }
    
    // Try pipe-delimited format: "ORD-XXX|LPN-XXX"
    if (trimmed.includes('|')) {
        const parts = trimmed.split('|');
        return {
            lpn: parts[1] || parts[0],
            orderId: parts[0].startsWith('ORD') ? parts[0] : null,
            shipmentId: null,
            error: null,
        };
    }
    
    // Simple LPN format
    if (trimmed.startsWith('LPN-')) {
        return {
            lpn: trimmed,
            orderId: null,
            shipmentId: null,
            error: null,
        };
    }
    
    // Unknown format - still capture it
    return {
        lpn: trimmed,
        orderId: null,
        shipmentId: null,
        error: null,
    };
};

/**
 * Look up an LPN across all orders
 */
export const findLPNInOrders = (lpn, orders = MOCK_ORDERS) => {
    for (const order of orders) {
        const found = order.expectedLPNs.find(item => item.lpn === lpn);
        if (found) {
            return {
                order,
                lpnInfo: found,
            };
        }
    }
    return null;
};

/**
 * Calculate receiving status for an order
 */
export const calculateReceivingStatus = (order, scanEvents = [], exceptions = []) => {
    const orderScans = scanEvents.filter(s => s.orderId === order.id && s.action === 'receive');
    const scannedLPNs = new Set(orderScans.map(s => s.lpn));
    const expectedCount = order.expectedLPNs.length;
    const scannedCount = scannedLPNs.size;
    
    const orderExceptions = exceptions.filter(e => e.orderId === order.id);
    const closedWithVariance = orderExceptions.some(e => e.type === 'closed_with_variance');
    
    if (closedWithVariance) {
        return RECEIVING_STATUS.CLOSED_WITH_VARIANCE;
    }
    if (scannedCount === 0) {
        return RECEIVING_STATUS.NOT_STARTED;
    }
    if (scannedCount >= expectedCount) {
        return RECEIVING_STATUS.COMPLETE;
    }
    return RECEIVING_STATUS.PARTIAL;
};

/**
 * Check if all LPNs for an order have been scanned
 */
export const isOrderComplete = (order, scanEvents = []) => {
    const orderScans = scanEvents.filter(s => s.orderId === order.id && s.action === 'receive');
    const scannedLPNs = new Set(orderScans.map(s => s.lpn));
    return order.expectedLPNs.every(item => scannedLPNs.has(item.lpn));
};

/**
 * Format relative time
 */
export const formatRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
};

/**
 * Format date for display
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
