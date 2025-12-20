// Customer Directory specific data (renamed from Dealer Directory for dealer app context)
export const CUSTOMER_DIRECTORY_DATA = [
    {
        id: 1,
        name: "Business Furniture LLC",
        type: "Corporate",
        address: "4102 Meghan Beeler Court, South Bend, IN 46628",
        salespeople: [{ name: "John Doe", email: "john@businessfurniture.com", status: "active", roleLabel: "Sales" }],
        designers: [{ name: "Jane Smith", email: "jane@businessfurniture.com", status: "active", roleLabel: "Designer" }],
        administration: [],
        installers: [],
        dailyDiscount: "18.40%",
        bookings: 450000,
        sales: 435000,
        projects: [
            { name: "Office Renovation Phase 1", value: 112000, status: "In Progress" },
            { name: "Conference Room Upgrade", value: 55000, status: "Quote Sent" }
        ],
        notes: "Preferred customer. Net 30 terms. Annual contract renewal in March."
    },
    {
        id: 2,
        name: "Corporate Design Inc",
        type: "Corporate",
        address: "123 Main Street, Evansville, IN 47708",
        salespeople: [{ name: "Mike Wilson", email: "mike@corporatedesign.com", status: "active", roleLabel: "Sales" }],
        designers: [{ name: "Sarah Johnson", email: "sarah@corporatedesign.com", status: "active", roleLabel: "Designer" }],
        administration: [{ name: "Admin User", email: "admin@corporatedesign.com", status: "active", roleLabel: "Admin" }],
        installers: [],
        dailyDiscount: "22.34%",
        bookings: 380000,
        sales: 395000,
        projects: [
            { name: "Lobby Refresh", value: 75000, status: "In Progress" }
        ],
        notes: "Request 2-week lead time for installations. Main contact: Sarah Johnson."
    },
    {
        id: 3,
        name: "OfficeWorks",
        type: "Corporate",
        address: "456 Business Ave, Indianapolis, IN 46204",
        salespeople: [{ name: "Lisa Chen", email: "lisa@officeworks.com", status: "active", roleLabel: "Sales" }],
        designers: [],
        administration: [],
        installers: [{ name: "Tom Brown", email: "tom@officeworks.com", status: "active", roleLabel: "Installer" }],
        dailyDiscount: "19.50%",
        bookings: 490000,
        sales: 510000,
        projects: [
            { name: "Cafeteria Seating", value: 28000, status: "Completed" },
            { name: "Training Room Setup", value: 42000, status: "Quote Sent" }
        ],
        notes: "Self-install preferred. Bulk orders only."
    }
];

export const CUSTOMER_TYPES = [
    { value: 'Corporate', label: 'Corporate', color: '#3B82F6' },
    { value: 'Education', label: 'Education', color: '#10B981' },
    { value: 'Healthcare', label: 'Healthcare', color: '#EF4444' },
    { value: 'Government', label: 'Government', color: '#8B5CF6' },
    { value: 'Hospitality', label: 'Hospitality', color: '#F59E0B' },
    { value: 'Religious', label: 'Religious', color: '#6366F1' },
    { value: 'Other', label: 'Other', color: '#6B7280' }
];

export const CUSTOMER_ROLES = [
    { value: 'sales', label: 'Sales' },
    { value: 'designer', label: 'Designer' },
    { value: 'admin', label: 'Administration' },
    { value: 'installer', label: 'Installer' }
];

export const CUSTOMER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending'
};

export const ROLE_OPTIONS = [
    { label: 'Administrator', value: 'Administrator' },
    { label: 'Admin/Sales Support', value: 'Admin/Sales Support' },
    { label: 'Sales', value: 'Sales' },
    { label: 'Designer', value: 'Designer' },
    { label: 'Sales/Designer', value: 'Sales/Designer' },
    { label: 'Installer', value: 'Installer' }
];

// Daily discount options for customer directory
export const DAILY_DISCOUNT_OPTIONS = [
    'Undecided', 
    '50/20 (60.00%)', 
    '50/20/1 (60.4%)', 
    '50/20/2 (60.80%)', 
    '50/20/4 (61.60%)', 
    '50/20/2/3 (61.98%)', 
    '50/20/5 (62.00%)', 
    '50/20/3 (61.20%)', 
    '50/20/6 (62.40%)', 
    '50/25 (62.50%)', 
    '50/20/5/2 (62.76%)', 
    '50/20/7 (62.80%)', 
    '50/20/8 (63.20%)', 
    '50/10/10/10 (63.55%)', 
    '50/20/9 (63.6%)', 
    '50/20/10 (64.00%)', 
    '50/20/8/3 (64.30%)', 
    '50/20/10/3 (65.08%)', 
    '50/20/10/5 (65.80%)', 
    '50/20/15 (66.00%)'
];