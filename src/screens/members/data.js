// Members and user management data
// ============================================
// Role system
// Dealer users: the staff inside this dealership (principal, admin, sales, design, install)
// ============================================

// Dealer staff roles (the only roles in the dealer app)
export const DEALER_ROLES = [
    { value: 'dealer-principal', label: 'Principal' },
    { value: 'dealer-administrator', label: 'Administrator' },
    { value: 'dealer-salesperson', label: 'Salesperson' },
    { value: 'dealer-designer', label: 'Designer' },
    { value: 'dealer-installer', label: 'Installer' },
];

// Admin-level roles (full access)
export const ADMIN_ROLES = ['dealer-principal', 'dealer-administrator'];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

export const getRoleLabel = (roleValue) => {
    return DEALER_ROLES.find(r => r.value === roleValue)?.label || roleValue;
};

// ----- Permission system -----
export const PERMISSION_LABELS = {
    salesData: 'Sales Data',
    projectsData: 'Projects Data',
    orderData: 'Order Data',
    replacements: 'Replacements',
    sampleOrdering: 'Sample Ordering',
};

export const PERMISSION_DESCRIPTIONS = {
    salesData: 'Access to sales reports, customer data, revenue metrics, rewards, and customer ranking',
    projectsData: 'Create, edit, and manage project opportunities and leads',
    orderData: 'View and manage orders, order history, and order entry',
    replacements: 'Submit and track replacement part requests',
    sampleOrdering: 'Order product samples and track sample requests',
};

// ----- Dealer staff (this dealership's team) -----
export const INITIAL_MEMBERS = [
    {
        id: 1,
        firstName: 'Karen',
        lastName: 'Mitchell',
        email: 'karen.mitchell@dealer.com',
        phone: '555-1234',
        role: 'dealer-principal',
        permissions: {
            salesData: true, projectsData: true, orderData: true,
            replacements: true, sampleOrdering: true,
        },
    },
    {
        id: 2,
        firstName: 'Luke',
        lastName: 'Wagner',
        email: 'luke.wagner@dealer.com',
        phone: '555-4321',
        role: 'dealer-salesperson',
        permissions: {
            salesData: true, projectsData: true, orderData: true,
            replacements: true, sampleOrdering: true,
        },
    },
    {
        id: 3,
        firstName: 'Amanda',
        lastName: 'Cole',
        email: 'amanda.cole@dealer.com',
        phone: '555-5678',
        role: 'dealer-administrator',
        permissions: {
            salesData: true, projectsData: true, orderData: true,
            replacements: true, sampleOrdering: true,
        },
    },
    {
        id: 4,
        firstName: 'Tom',
        lastName: 'Bradley',
        email: 'tom.bradley@dealer.com',
        phone: '555-8765',
        role: 'dealer-salesperson',
        permissions: {
            salesData: true, projectsData: true, orderData: true,
            replacements: true, sampleOrdering: true,
        },
    },
    {
        id: 5,
        firstName: 'Lisa',
        lastName: 'Nguyen',
        email: 'lisa.nguyen@dealer.com',
        phone: '555-2468',
        role: 'dealer-designer',
        permissions: {
            salesData: false, projectsData: true, orderData: true,
            replacements: true, sampleOrdering: true,
        },
    },
    {
        id: 6,
        firstName: 'Megan',
        lastName: 'Brooks',
        email: 'megan.brooks@dealer.com',
        phone: '555-1357',
        role: 'dealer-salesperson',
        permissions: {
            salesData: true, projectsData: true, orderData: true,
            replacements: true, sampleOrdering: false,
        },
    },
    {
        id: 7,
        firstName: 'Derek',
        lastName: 'Simmons',
        email: 'derek.simmons@dealer.com',
        phone: '555-9753',
        role: 'dealer-installer',
        permissions: {
            salesData: false, projectsData: false, orderData: true,
            replacements: true, sampleOrdering: false,
        },
    },
];
