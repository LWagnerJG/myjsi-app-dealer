// Sales feature specific data
import { VERTICAL_COLORS } from '../../constants/verticals.js';

export const YTD_SALES_DATA = [
    { label: 'Total Sales', current: 3666132, previous: 2900104, goal: 7000000 },
    { label: 'Education', current: 1250000, previous: 1045589, goal: 2500000 },
    { label: 'Health', current: 980000, previous: 850000, goal: 2000000 }
];

// Annual goals keyed by year — update each January
export const ANNUAL_GOALS_BY_YEAR = {
    2026: 7_500_000,
    2025: 7_000_000,
    2024: 6_500_000,
    2023: 6_000_000,
    2022: 5_500_000,
};

// Monthly bookings + invoiced sales by year
// When ERP is wired, replace with sales.getOrderSummary() grouped by month
export const MONTHLY_SALES_DATA_BY_YEAR = {
    2026: [
        { month: 'Jan', bookings: 1_182_400, sales:   524_800 },
        { month: 'Feb', bookings:   537_200, sales:   491_600 },
        { month: 'Mar', bookings:   428_900, sales:   382_400 },
        { month: 'Apr', bookings:   618_700, sales:   734_200 },
        { month: 'May', bookings:   316_500, sales:   192_300 },
    ],
    2025: [
        { month: 'Jan', bookings: 1259493, sales: 506304 },
        { month: 'Feb', bookings: 497537,  sales: 553922 },
        { month: 'Mar', bookings: 397684,  sales: 365601 },
        { month: 'Apr', bookings: 554318,  sales: 696628 },
        { month: 'May', bookings: 840255,  sales: 1340018 },
        { month: 'Jun', bookings: 116846,  sales: 36823 },
        { month: 'Jul', bookings: 520000,  sales: 785000 },
        { month: 'Aug', bookings: 600000,  sales: 825000 },
    ],
    2024: [
        { month: 'Jan', bookings: 980000,  sales: 810000 },
        { month: 'Feb', bookings: 620000,  sales: 590000 },
        { month: 'Mar', bookings: 745000,  sales: 680000 },
        { month: 'Apr', bookings: 830000,  sales: 760000 },
        { month: 'May', bookings: 910000,  sales: 870000 },
        { month: 'Jun', bookings: 760000,  sales: 720000 },
        { month: 'Jul', bookings: 680000,  sales: 640000 },
        { month: 'Aug', bookings: 590000,  sales: 555000 },
        { month: 'Sep', bookings: 870000,  sales: 830000 },
        { month: 'Oct', bookings: 950000,  sales: 910000 },
        { month: 'Nov', bookings: 710000,  sales: 680000 },
        { month: 'Dec', bookings: 540000,  sales: 510000 },
    ],
    2023: [
        { month: 'Jan', bookings: 810000,  sales: 740000 },
        { month: 'Feb', bookings: 550000,  sales: 510000 },
        { month: 'Mar', bookings: 680000,  sales: 620000 },
        { month: 'Apr', bookings: 720000,  sales: 670000 },
        { month: 'May', bookings: 840000,  sales: 790000 },
        { month: 'Jun', bookings: 690000,  sales: 650000 },
        { month: 'Jul', bookings: 600000,  sales: 560000 },
        { month: 'Aug', bookings: 520000,  sales: 490000 },
        { month: 'Sep', bookings: 760000,  sales: 720000 },
        { month: 'Oct', bookings: 870000,  sales: 840000 },
        { month: 'Nov', bookings: 640000,  sales: 610000 },
        { month: 'Dec', bookings: 490000,  sales: 460000 },
    ],
    2022: [
        { month: 'Jan', bookings: 680000,  sales: 620000 },
        { month: 'Feb', bookings: 450000,  sales: 410000 },
        { month: 'Mar', bookings: 560000,  sales: 510000 },
        { month: 'Apr', bookings: 610000,  sales: 570000 },
        { month: 'May', bookings: 720000,  sales: 680000 },
        { month: 'Jun', bookings: 590000,  sales: 550000 },
        { month: 'Jul', bookings: 510000,  sales: 475000 },
        { month: 'Aug', bookings: 440000,  sales: 410000 },
        { month: 'Sep', bookings: 640000,  sales: 600000 },
        { month: 'Oct', bookings: 730000,  sales: 700000 },
        { month: 'Nov', bookings: 550000,  sales: 520000 },
        { month: 'Dec', bookings: 410000,  sales: 380000 },
    ],
};

// Alias for current year — used by any component that doesn't need year selection
export const MONTHLY_SALES_DATA = MONTHLY_SALES_DATA_BY_YEAR[2025];

// Backlog — orders booked but not yet invoiced/shipped
// Source: ERP (products.getLeadTime will inform scheduled ship dates when wired)
export const BACKLOG_DATA = {
    total: 2_845_000,
    items: [
        { dealer: 'RJE Business Interiors',  project: 'Downtown Campus Ph.2',       value: 485000, scheduledShip: '2025-09-15', vertical: 'Corporate',   status: 'In Production' },
        { dealer: 'Business Furniture LLC',  project: 'Lawrence Township Ph.2',     value: 320000, scheduledShip: '2025-09-28', vertical: 'Education',   status: 'Scheduled' },
        { dealer: 'OfficeWorks',             project: 'Meridian HQ Expansion',      value: 295000, scheduledShip: '2025-10-06', vertical: 'Corporate',   status: 'Scheduled' },
        { dealer: 'Corporate Design Inc',    project: 'Parkview Medical Center',    value: 410000, scheduledShip: '2025-10-14', vertical: 'Healthcare',  status: 'In Production' },
        { dealer: 'LOTH Inc.',               project: 'State Archives Renovation',  value: 275000, scheduledShip: '2025-10-22', vertical: 'Government',  status: 'Pending Release' },
        { dealer: 'Sharp School Services',   project: 'Westfield K-8 STEM Wing',    value: 190000, scheduledShip: '2025-11-03', vertical: 'Education',   status: 'Scheduled' },
        { dealer: 'Braden Business Systems', project: 'Regional HQ Refresh',        value: 225000, scheduledShip: '2025-11-10', vertical: 'Corporate',   status: 'Pending Release' },
        { dealer: 'CVC',                     project: 'Operations Center Ph.2',     value: 180000, scheduledShip: '2025-11-17', vertical: 'Corporate',   status: 'Scheduled' },
        { dealer: 'One Eleven Design',       project: 'Embassy Suites Lobby',       value: 265000, scheduledShip: '2025-12-01', vertical: 'Hospitality', status: 'In Production' },
        { dealer: "Schroeder's",             project: 'Clinic Network Rollout',     value: 200000, scheduledShip: '2025-12-08', vertical: 'Healthcare',  status: 'Pending Release' },
    ],
};

export const SALES_VERTICALS_DATA = [
    { label: 'Healthcare',  value: 2900104, color: VERTICAL_COLORS.Healthcare  },
    { label: 'Education',   value: 1045589, color: VERTICAL_COLORS.Education   },
    { label: 'Hospitality', value: 1045589, color: VERTICAL_COLORS.Hospitality },
    { label: 'Corporate',   value: 1045589, color: VERTICAL_COLORS.Corporate   },
    { label: 'Government',  value: 1045589, color: VERTICAL_COLORS.Government  },
    { label: 'Other',       value:  500000, color: VERTICAL_COLORS.Other       },
];

// Dealership's largest end-user customers. Unlike the rep view (which ranks
// dealer partners), this ranks the dealer's own end-user accounts and ties the
// multiple projects from each account together into one customer total.
export const END_USER_RANK_DATA = [
    {
        id: 'eu-1',
        name: 'State University',
        vertical: 'Education',
        bookings: 430000,
        sales: 405000,
        projects: [
            { projectName: 'University Commons Refresh', amount: 120000 },
            { projectName: 'STEM Wing Expansion', amount: 190000 },
            { projectName: 'Library Learning Commons', amount: 95000 },
        ],
    },
    {
        id: 'eu-2',
        name: 'Midwest Health',
        vertical: 'Healthcare',
        bookings: 470000,
        sales: 505000,
        projects: [
            { projectName: 'Parkview Clinic Network', amount: 410000 },
            { projectName: 'Medical Wing Remodel', amount: 95000 },
        ],
    },
    {
        id: 'eu-3',
        name: 'OneMain Financial',
        vertical: 'Corporate',
        bookings: 388000,
        sales: 360296,
        projects: [
            { projectName: 'HQ Standards Rollout', amount: 137262 },
            { projectName: 'Operations Center Ph.2', amount: 180000 },
            { projectName: 'Downtown Branch', amount: 43034 },
        ],
    },
    {
        id: 'eu-4',
        name: 'Metro Hospitality',
        vertical: 'Hospitality',
        bookings: 360000,
        sales: 335000,
        projects: [
            { projectName: 'Embassy Suites Lobby', amount: 265000 },
            { projectName: 'Hotel Lobby Seating', amount: 70000 },
        ],
    },
    {
        id: 'eu-5',
        name: 'ABC Corporation',
        vertical: 'Corporate',
        bookings: 300000,
        sales: 345000,
        projects: [
            { projectName: 'HQ Expansion Ph.2', amount: 295000 },
            { projectName: 'New Office Furnishings', amount: 50000 },
        ],
    },
    {
        id: 'eu-6',
        name: 'City of Lawrence',
        vertical: 'Government',
        bookings: 295000,
        sales: 318034,
        projects: [
            { projectName: 'State Archives Renovation', amount: 275000 },
            { projectName: 'Township LECC', amount: 43034 },
        ],
    },
    {
        id: 'eu-7',
        name: 'GlobalTech',
        vertical: 'Corporate',
        bookings: 310000,
        sales: 276000,
        projects: [
            { projectName: 'Corporate Expansion Towers', amount: 180000 },
            { projectName: 'Innovation Wing', amount: 96000 },
        ],
    },
    {
        id: 'eu-8',
        name: 'Innovate Labs',
        vertical: 'Corporate',
        bookings: 150000,
        sales: 130000,
        projects: [
            { projectName: 'Lab Phase 2', amount: 88000 },
            { projectName: 'Startup Collaboration Space', amount: 42000 },
        ],
    },
];

// The signed-in dealer user's OWN reward earnings (not a leaderboard).
// Dealer salespeople earn 3% and dealer designers earn 1% of an order's net on
// claimed orders. Each entry's `amount` is the reward already earned on that
// order. Keyed by quarter.
export const MY_REWARDS_DATA = {
    '2026-Q1': [
        { project: 'OneMain Financial HQ Standards', orderNumber: 'SO-104588', net: 137262, amount: 4117.86 },
        { project: 'Lawrence Township LECC', orderNumber: 'SO-104592', net: 43034, amount: 1291.02 },
        { project: 'Startup Collaboration Space', orderNumber: 'SO-104610', net: 42000, amount: 1260.00 },
    ],
    '2025-Q4': [
        { project: 'Embassy Suites Lobby', orderNumber: 'SO-103981', net: 265000, amount: 7950.00 },
        { project: 'STEM Wing Expansion', orderNumber: 'SO-103877', net: 190000, amount: 5700.00 },
    ],
    '2025-Q3': [
        { project: 'Operations Center Ph.2', orderNumber: 'SO-103640', net: 180000, amount: 5400.00 },
        { project: 'Hotel Lobby Seating', orderNumber: 'SO-103702', net: 70000, amount: 2100.00 },
    ],
    '2025-Q2': [
        { project: 'University Commons Refresh', orderNumber: 'SO-103410', net: 120000, amount: 3600.00 },
        { project: 'Medical Wing Remodel', orderNumber: 'SO-103388', net: 95000, amount: 2850.00 },
    ],
    '2025-Q1': [
        { project: 'HQ Expansion Ph.2', orderNumber: 'SO-103120', net: 295000, amount: 8850.00 },
    ],
    '2024-Q4': [
        { project: 'State Archives Renovation', orderNumber: 'SO-102991', net: 275000, amount: 8250.00 },
        { project: 'New Office Furnishings', orderNumber: 'SO-102877', net: 50000, amount: 1500.00 },
    ],
};