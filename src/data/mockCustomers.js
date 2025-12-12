// Mock Customers Data for MyJSI Dealer App
// This replaces the "Installations" concept with a richer Customer microsite experience

// ============================================
// TYPE DEFINITIONS (for reference)
// ============================================
/*
Customer {
  id: string
  name: string (End User company name)
  location: { city: string, state: string }
  vertical: 'Corporate' | 'Healthcare' | 'HigherEd' | 'Government' | 'Hospitality' | 'Other'
  activeProjectIds?: string[]
  standardsPrograms: StandardsProgram[]
  approvedMaterials: ApprovedMaterials
  orders: { current: Order[], history: Order[] }
  installs: InstallPhoto[]
  documents: DocumentLink[]
  contacts: Contact[]
  image?: string (hero image for card)
}

StandardsProgram {
  id: string
  title: string
  code: string (e.g., "GH-130605")
  status: 'Draft' | 'Active' | 'Expiring' | 'Expired'
  startDate: string (ISO)
  endDate: string (ISO)
  summary: string
  poRequirementText?: string
  purchasingAwarenessRequired: boolean
  purchasingNotifiedAt?: string (ISO)
  specialNotes?: string[]
  specialMaterials?: string[] (material ids)
  attachments: DocumentLink[]
  lastUpdated: string (ISO)
  ownerName?: string
}

ApprovedMaterials {
  laminates: Material[]
  metals: Material[]
  upholstery: Material[]
  woods: Material[]
  paintPlastic?: Material[]
}

Material {
  id: string
  name: string
  code: string
  vendor?: string
  usageTags: string[]
  linkedStandardsProgramCodes?: string[]
  swatchHex?: string
  swatchImageUrl?: string
}

Order {
  id: string
  orderNumber: string
  type: 'SO' | 'PO' | 'Quote'
  status: 'Entered' | 'Acknowledged' | 'In Production' | 'Shipped' | 'Delivered' | 'Installed'
  amount?: number
  eta?: string (ISO)
  ackPdfUrl?: string
  invoicePdfUrl?: string
  createdAt?: string
  completedAt?: string
  lineItems?: OrderLineItem[]
}

InstallPhoto {
  id: string
  url: string
  caption?: string
  spaceType?: 'Office' | 'Lobby' | 'Patient' | 'Classroom' | 'Conference' | 'Other'
  date?: string
}

DocumentLink {
  id: string
  title: string
  type: 'pdf' | 'doc' | 'link'
  url: string
}

Contact {
  id: string
  name: string
  role: string
  email?: string
  phone?: string
  visibility: 'dealer' | 'internal' (hide internal from dealers)
}
*/

// ============================================
// MOCK DATA
// ============================================

export const MOCK_CUSTOMERS = [
  {
    id: 'cust-001',
    name: 'Acme Corp HQ',
    location: { city: 'Indianapolis', state: 'IN' },
    vertical: 'Corporate',
    activeProjectIds: ['proj-acme-lobby'],
    image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg',
    standardsPrograms: [
      {
        id: 'std-001',
        title: 'Acme Corporate Standards 2024',
        code: 'AC-240115',
        status: 'Active',
        startDate: '2024-01-15',
        endDate: '2026-01-14',
        summary: 'Enterprise-wide furniture standards for all Acme Corp facilities. Includes Vision casegoods, Arwyn seating, and approved finish palette.',
        poRequirementText: 'All POs must reference Program Code AC-240115',
        purchasingAwarenessRequired: true,
        purchasingNotifiedAt: '2024-01-20',
        specialNotes: [
          'Upcharge waived for Aria mechanism on Arwyn chairs',
          'Custom laminate color #AC-2024 approved at standard lead time',
          'Extended warranty coverage (10 years) included'
        ],
        specialMaterials: ['mat-lam-001', 'mat-met-001'],
        attachments: [
          { id: 'doc-std-001-a', title: 'Program Overview.pdf', type: 'pdf', url: '#' },
          { id: 'doc-std-001-b', title: 'Approved Finishes Schedule.pdf', type: 'pdf', url: '#' }
        ],
        lastUpdated: '2024-06-10',
        ownerName: 'Sarah Mitchell (JSI)'
      },
      {
        id: 'std-002',
        title: 'Executive Suite Special Pricing',
        code: 'AC-240220',
        status: 'Active',
        startDate: '2024-02-20',
        endDate: '2024-12-31',
        summary: 'Special pricing for C-suite and executive conference areas.',
        poRequirementText: 'Reference AC-240220 for executive pricing tier',
        purchasingAwarenessRequired: false,
        specialNotes: ['Applies to floors 20-25 only'],
        specialMaterials: [],
        attachments: [],
        lastUpdated: '2024-02-20',
        ownerName: 'Sarah Mitchell (JSI)'
      }
    ],
    approvedMaterials: {
      laminates: [
        { id: 'mat-lam-001', name: 'Acme Cloud', code: 'AC-2024', vendor: 'Wilsonart', usageTags: ['Worksurface', 'Storage'], linkedStandardsProgramCodes: ['AC-240115'], swatchHex: '#E8E4DE' },
        { id: 'mat-lam-002', name: 'Smoky Walnut', code: 'WNT-445', vendor: 'Formica', usageTags: ['Worksurface'], linkedStandardsProgramCodes: ['AC-240115'], swatchHex: '#5C4A3A' },
        { id: 'mat-lam-003', name: 'Crisp Linen', code: 'LIN-100', vendor: 'Wilsonart', usageTags: ['Storage', 'Panels'], linkedStandardsProgramCodes: ['AC-240115'], swatchHex: '#F5F2EB' }
      ],
      metals: [
        { id: 'mat-met-001', name: 'Satin Nickel', code: 'SN-200', usageTags: ['Hardware', 'Legs'], linkedStandardsProgramCodes: ['AC-240115'], swatchHex: '#A8A8A8' },
        { id: 'mat-met-002', name: 'Matte Black', code: 'MB-100', usageTags: ['Hardware', 'Frames'], linkedStandardsProgramCodes: ['AC-240115'], swatchHex: '#2C2C2C' }
      ],
      upholstery: [
        { id: 'mat-uph-001', name: 'Acme Blue', code: 'ACM-BLU', vendor: 'Designtex', usageTags: ['Task Seating', 'Guest'], linkedStandardsProgramCodes: ['AC-240115'], swatchHex: '#2E5A8B' },
        { id: 'mat-uph-002', name: 'Warm Gray', code: 'GRY-422', vendor: 'Maharam', usageTags: ['Lounge', 'Guest'], linkedStandardsProgramCodes: ['AC-240115'], swatchHex: '#8B8580' },
        { id: 'mat-uph-003', name: 'Natural Wool', code: 'NWL-101', vendor: 'Knoll Textiles', usageTags: ['Executive'], linkedStandardsProgramCodes: ['AC-240220'], swatchHex: '#D4CFC7' }
      ],
      woods: [
        { id: 'mat-wood-001', name: 'Walnut Veneer', code: 'WLN-V01', usageTags: ['Conference', 'Executive'], linkedStandardsProgramCodes: ['AC-240220'], swatchHex: '#6B4F3A' }
      ],
      paintPlastic: []
    },
    orders: {
      current: [
        { id: 'ord-001', orderNumber: 'SO-458920', type: 'SO', status: 'In Production', amount: 45000, eta: '2024-02-15', createdAt: '2024-01-20' },
        { id: 'ord-002', orderNumber: 'SO-458945', type: 'SO', status: 'Acknowledged', amount: 12500, eta: '2024-02-28', createdAt: '2024-01-25' }
      ],
      history: [
        { id: 'ord-003', orderNumber: 'SO-445120', type: 'SO', status: 'Installed', amount: 78000, completedAt: '2023-11-15', ackPdfUrl: '#', invoicePdfUrl: '#' },
        { id: 'ord-004', orderNumber: 'SO-442890', type: 'SO', status: 'Installed', amount: 32000, completedAt: '2023-09-20', ackPdfUrl: '#', invoicePdfUrl: '#' }
      ]
    },
    installs: [
      { id: 'inst-001', url: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg', caption: 'Main lobby reception area', spaceType: 'Lobby', date: '2023-11-15' },
      { id: 'inst-002', url: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg', caption: 'Executive lounge, floor 22', spaceType: 'Lobby', date: '2023-11-10' },
      { id: 'inst-003', url: 'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_finn_enviro_00004_aOu5872.jpg', caption: 'Open office workstations', spaceType: 'Office', date: '2023-09-20' }
    ],
    documents: [
      { id: 'doc-001', title: 'Master Finish Schedule', type: 'pdf', url: '#' },
      { id: 'doc-002', title: 'Typical Layouts - Floors 10-15', type: 'pdf', url: '#' },
      { id: 'doc-003', title: 'Warranty & Care Guide', type: 'pdf', url: '#' }
    ],
    contacts: [
      { id: 'con-001', name: 'Sarah Mitchell', role: 'JSI Account Rep', email: 'smitchell@jsi.com', phone: '317-555-0101', visibility: 'dealer' },
      { id: 'con-002', name: 'Marcus Chen', role: 'Facilities Manager', email: 'mchen@acme.com', phone: '317-555-0202', visibility: 'dealer' },
      { id: 'con-003', name: 'Internal Purchasing', role: 'Purchasing Contact', email: 'purchasing@acme.com', visibility: 'internal' }
    ]
  },
  {
    id: 'cust-002',
    name: 'Tech Park Offices',
    location: { city: 'Fishers', state: 'IN' },
    vertical: 'Corporate',
    activeProjectIds: [],
    image: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg',
    standardsPrograms: [
      {
        id: 'std-003',
        title: 'Tech Park Campus Standards',
        code: 'TP-230801',
        status: 'Active',
        startDate: '2023-08-01',
        endDate: '2025-07-31',
        summary: 'Multi-building campus furniture program for Tech Park development.',
        poRequirementText: 'Include TP-230801 on all purchase orders',
        purchasingAwarenessRequired: true,
        purchasingNotifiedAt: null,
        specialNotes: ['Height-adjustable desks required for all workstations'],
        specialMaterials: [],
        attachments: [],
        lastUpdated: '2023-08-01',
        ownerName: 'Tom Bradley (JSI)'
      }
    ],
    approvedMaterials: {
      laminates: [
        { id: 'mat-lam-010', name: 'Arctic White', code: 'AW-100', vendor: 'Wilsonart', usageTags: ['Worksurface'], linkedStandardsProgramCodes: ['TP-230801'], swatchHex: '#FAFAFA' }
      ],
      metals: [
        { id: 'mat-met-010', name: 'Silver', code: 'SLV-100', usageTags: ['Legs', 'Frames'], linkedStandardsProgramCodes: ['TP-230801'], swatchHex: '#C0C0C0' }
      ],
      upholstery: [
        { id: 'mat-uph-010', name: 'Tech Teal', code: 'TT-500', vendor: 'Designtex', usageTags: ['Task Seating'], linkedStandardsProgramCodes: ['TP-230801'], swatchHex: '#2A9D8F' }
      ],
      woods: [],
      paintPlastic: []
    },
    orders: {
      current: [
        { id: 'ord-010', orderNumber: 'SO-459100', type: 'SO', status: 'Shipped', amount: 28000, eta: '2024-01-30', createdAt: '2024-01-10' }
      ],
      history: [
        { id: 'ord-011', orderNumber: 'SO-450200', type: 'SO', status: 'Installed', amount: 95000, completedAt: '2023-10-15', ackPdfUrl: '#', invoicePdfUrl: '#' }
      ]
    },
    installs: [
      { id: 'inst-010', url: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg', caption: 'Building A lounge', spaceType: 'Lobby', date: '2023-10-15' }
    ],
    documents: [],
    contacts: [
      { id: 'con-010', name: 'Tom Bradley', role: 'JSI Account Rep', email: 'tbradley@jsi.com', phone: '317-555-0301', visibility: 'dealer' }
    ]
  },
  {
    id: 'cust-003',
    name: 'Midwest Health System',
    location: { city: 'Carmel', state: 'IN' },
    vertical: 'Healthcare',
    activeProjectIds: ['proj-mhs-wing'],
    image: 'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_finn_enviro_00004_aOu5872.jpg',
    standardsPrograms: [
      {
        id: 'std-004',
        title: 'MHS Patient Room Standards',
        code: 'MHS-PR-2024',
        status: 'Active',
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        summary: 'Standardized furniture for all patient rooms across MHS facilities.',
        poRequirementText: 'All patient furniture orders require MHS-PR-2024',
        purchasingAwarenessRequired: true,
        purchasingNotifiedAt: '2024-01-05',
        specialNotes: [
          'Antimicrobial finishes required on all surfaces',
          'Cleanable upholstery only (no fabric on patient seating)'
        ],
        specialMaterials: [],
        attachments: [
          { id: 'doc-std-004-a', title: 'Infection Control Guidelines.pdf', type: 'pdf', url: '#' }
        ],
        lastUpdated: '2024-01-05',
        ownerName: 'Jennifer Adams (JSI)'
      },
      {
        id: 'std-005',
        title: 'MHS Waiting Area Program',
        code: 'MHS-WA-2023',
        status: 'Expiring',
        startDate: '2023-01-01',
        endDate: '2024-03-31',
        summary: 'Waiting room and lobby furniture standards. Program expiring soon.',
        purchasingAwarenessRequired: false,
        specialNotes: [],
        specialMaterials: [],
        attachments: [],
        lastUpdated: '2023-01-01',
        ownerName: 'Jennifer Adams (JSI)'
      }
    ],
    approvedMaterials: {
      laminates: [
        { id: 'mat-lam-020', name: 'Clean White', code: 'CW-100', vendor: 'Wilsonart', usageTags: ['Patient', 'Nurse Station'], linkedStandardsProgramCodes: ['MHS-PR-2024'], swatchHex: '#FFFFFF' }
      ],
      metals: [],
      upholstery: [
        { id: 'mat-uph-020', name: 'Healthcare Vinyl - Sky', code: 'HV-SKY', vendor: 'CF Stinson', usageTags: ['Patient Seating', 'Guest'], linkedStandardsProgramCodes: ['MHS-PR-2024'], swatchHex: '#87CEEB' },
        { id: 'mat-uph-021', name: 'Healthcare Vinyl - Sage', code: 'HV-SAG', vendor: 'CF Stinson', usageTags: ['Waiting'], linkedStandardsProgramCodes: ['MHS-WA-2023'], swatchHex: '#9CAF88' }
      ],
      woods: [],
      paintPlastic: []
    },
    orders: {
      current: [],
      history: [
        { id: 'ord-020', orderNumber: 'SO-455800', type: 'SO', status: 'Installed', amount: 120000, completedAt: '2023-12-01', ackPdfUrl: '#', invoicePdfUrl: '#' }
      ]
    },
    installs: [
      { id: 'inst-020', url: 'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_finn_enviro_00004_aOu5872.jpg', caption: 'East Wing waiting area', spaceType: 'Patient', date: '2023-12-01' }
    ],
    documents: [
      { id: 'doc-020', title: 'Infection Control Guidelines', type: 'pdf', url: '#' }
    ],
    contacts: [
      { id: 'con-020', name: 'Jennifer Adams', role: 'JSI Healthcare Specialist', email: 'jadams@jsi.com', phone: '317-555-0401', visibility: 'dealer' }
    ]
  },
  {
    id: 'cust-004',
    name: 'State University Library',
    location: { city: 'Bloomington', state: 'IN' },
    vertical: 'HigherEd',
    activeProjectIds: [],
    image: 'https://webresources.jsifurniture.com/production/uploads/jsi_coldjet_install_00001.jpg',
    standardsPrograms: [],
    approvedMaterials: {
      laminates: [],
      metals: [],
      upholstery: [],
      woods: [],
      paintPlastic: []
    },
    orders: {
      current: [],
      history: [
        { id: 'ord-030', orderNumber: 'SO-448500', type: 'SO', status: 'Installed', amount: 65000, completedAt: '2023-08-15', ackPdfUrl: '#', invoicePdfUrl: '#' }
      ]
    },
    installs: [
      { id: 'inst-030', url: 'https://webresources.jsifurniture.com/production/uploads/jsi_coldjet_install_00001.jpg', caption: 'Study commons renovation', spaceType: 'Classroom', date: '2023-08-15' }
    ],
    documents: [],
    contacts: []
  }
];

// Helper function to get customer by ID
export const getCustomerById = (id) => MOCK_CUSTOMERS.find(c => c.id === id);

// Helper function to get standards program by ID within a customer
export const getStandardsProgram = (customerId, programId) => {
  const customer = getCustomerById(customerId);
  if (!customer) return null;
  return customer.standardsPrograms.find(p => p.id === programId);
};

// Customer request submissions (stored locally for demo)
export const CUSTOMER_REQUESTS = [];

// Add a customer request (for "Request New Customer" flow)
export const addCustomerRequest = (request) => {
  CUSTOMER_REQUESTS.push({
    id: `req-${Date.now()}`,
    ...request,
    status: 'Pending',
    submittedAt: new Date().toISOString()
  });
};

// Viewer role for permission checking
export const VIEWER_ROLE = 'dealer'; // 'dealer' | 'internal'

// Filter chips for customer list
export const CUSTOMER_FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'active-standards', label: 'Active Standards' },
  { key: 'current-orders', label: 'Has Orders' },
  { key: 'recently-installed', label: 'Recently Installed' }
];

// Space types for install photos
export const SPACE_TYPES = ['All', 'Office', 'Lobby', 'Patient', 'Classroom', 'Conference', 'Other'];

// Material categories
export const MATERIAL_CATEGORIES = [
  { key: 'laminates', label: 'Laminates' },
  { key: 'metals', label: 'Metals' },
  { key: 'upholstery', label: 'Upholstery' },
  { key: 'woods', label: 'Woods' },
  { key: 'paintPlastic', label: 'Paint/Plastic' }
];

// Status badge colors
export const STATUS_COLORS = {
  'Draft': { bg: '#F3F4F6', text: '#6B7280' },
  'Active': { bg: '#D1FAE5', text: '#059669' },
  'Expiring': { bg: '#FEF3C7', text: '#D97706' },
  'Expired': { bg: '#FEE2E2', text: '#DC2626' },
  'Entered': { bg: '#EDE9FE', text: '#7C3AED' },
  'Acknowledged': { bg: '#DBEAFE', text: '#2563EB' },
  'In Production': { bg: '#FEF3C7', text: '#D97706' },
  'Shipped': { bg: '#D1FAE5', text: '#059669' },
  'Delivered': { bg: '#D1FAE5', text: '#059669' },
  'Installed': { bg: '#D1FAE5', text: '#065F46' },
  'Pending': { bg: '#FEF3C7', text: '#D97706' }
};

export default MOCK_CUSTOMERS;
