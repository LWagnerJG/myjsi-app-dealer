// Sample Discounts specific data - Dealer version
// Renamed from "Sample Discounts" to "Discounts" for dealer view

// Dealer-specific discount categories (3 cards only for dealers)
export const DEALER_DISCOUNT_DATA = [
    {
        id: 'DR-240101',
        Title: 'Showroom Samples',
        category: 'showroom',
        Discount: 60,
        SSANumber: 'SSA DR-240101',
        description: 'Samples for your dealer showroom display. Standard finishes and popular configurations available at showroom pricing.'
    },
    {
        id: 'WE-240215',
        Title: 'A&D Samples',
        category: 'ad-samples',
        Discount: 55,
        SSANumber: 'SSA WE-240215',
        description: 'Samples for architects and designers. Finish chips, fabric swatches, and small-scale models for specification support.'
    },
    {
        id: 'DF-240320',
        Title: 'Personal Use Samples',
        category: 'personal-use',
        Discount: 50,
        SSANumber: 'SSA DF-240320',
        description: 'Samples for dealer personal use. Limited to one per item per year.'
    }
];

// Legacy data for backward compatibility
export const SAMPLE_DISCOUNTS_DATA = DEALER_DISCOUNT_DATA;

export const DISCOUNT_CATEGORIES = [
    'all',
    'showroom',
    'ad-samples',
    'personal-use'
];

export const SAMPLE_DISCOUNT_RANGES = [
    { min: 0, max: 20, label: 'Up to 20%' },
    { min: 21, max: 30, label: '21-30%' },
    { min: 31, max: 40, label: '31-40%' },
    { min: 41, max: 100, label: '40%+' }
];