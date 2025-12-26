// Enhanced Samples related data with comprehensive finish and material categories
export const FINISH_CATEGORIES = [
    { id: 'tfl', name: 'TFL', description: 'Thermally Fused Laminate' },
    { id: 'hpl', name: 'HPL', description: 'High Pressure Laminate' },
    { id: 'wood', name: 'Wood', description: 'Natural wood finishes' },
    { id: 'textiles', name: 'Textiles', description: 'Upholstery fabrics and materials' },
    { id: 'metal', name: 'Metal', description: 'Metal surface treatments' },
    { id: 'solid-surface', name: 'Solid Surface', description: 'Solid surface materials' },
    { id: 'polyurethane', name: 'Polyurethane', description: 'Polymer finish coatings' },
    { id: 'glass', name: 'Glass', description: 'Glass surface options' },
    { id: 'plastic', name: 'Plastic', description: 'Plastic material finishes' },
    { id: 'leather', name: 'Leather', description: 'Premium leather options' },
];

export const SAMPLE_CATEGORIES = [
    { id: 'finishes', name: 'Finishes' },
    { id: 'textiles', name: 'Textiles' },
    { id: 'hardware', name: 'Hardware' },
];

// Helper for building finish entries using actual public root images
const TFL = (code, name, file, finishType = 'solid') => ({
    id: `tfl-${code.toLowerCase()}`,
    name,
    category: 'tfl',
    finishType,
    color: '#E5E5E5',
    image: `/${file}`,
    code,
    description: `${name} laminate`
});

export const FINISH_SAMPLES = [
    TFL('ALB','Alabaster','jsi_finish_ALB_Alabaster_Laminate.jpg'),
    TFL('BBL','Bridal Blanco','jsi_finish_BBL_BridalBlanco_Laminate.jpg'),
    TFL('BEL','Belair','jsi_finish_BEL_Belair_Laminate.jpg'),
    TFL('BLK','Black','jsi_finish_BLK_Black_Laminate.jpg'),
    TFL('BRD','Brickdust','jsi_finish_BRD_Brickdust_Laminate.jpg'),
    TFL('CLY','Clay','jsi_finish_CLY_Clay_Laminate.jpg'),
    TFL('CSK','Cask','jsi_finish_CSK_Cask_Laminate.jpg'),
    TFL('DWH','Designer White','jsi_finish_DWH_DesignerWhite_Laminate.jpg'),
    TFL('EGR','Egret','jsi_finish_EGR_Egret_Laminate.jpg'),
    TFL('FAW','Fawn','jsi_finish_FAW_Fawn_Laminate.jpg'),
    TFL('FLN','Flint','jsi_finish_FLN_Flint_Laminate.jpg'),
    TFL('FLO','Florence Walnut','jsi_finish_FLO_FlorenceWalnut_Laminate.jpg','woodgrain'),
    TFL('LOF','Loft','jsi_finish_LOF_Loft_Laminate.jpg'),
    TFL('MCH','Mocha','jsi_finish_MCH_Mocha_Laminate.jpg','woodgrain'),
    TFL('MES','Mesa','jsi_finish_MES_Mesa_Laminate.jpg'),
    TFL('MIN','Mineral','jsi_finish_MIN_Mineral_Laminate.jpg','stone'),
    TFL('OBK','Outback','jsi_finish_OBK_Outback_Laminate.jpg','woodgrain'),
    TFL('PIL','Pilsner','jsi_finish_PIL_Pilsner_Laminate.jpg'),
    TFL('PIN','Pinnacle Walnut','jsi_finish_PIN_PinnacleWalnut_Laminate.jpg','woodgrain'),
    TFL('SHD','Shadow','jsi_finish_SHD_Shadow_Laminate.jpg','stone'),
    TFL('SLG','Slate Grey','jsi_finish_SLG_SlateGrey_Laminate.jpg','stone'),
    TFL('UMB','Umber','jsi_finish_UMB_Umber_Laminate.jpg'),
    TFL('VAL','Valley','jsi_finish_VAL_Valley_Laminate.jpg','woodgrain'),
    TFL('WEA','Weathered Ash','jsi_finish_WEA_WeatheredAsh_Laminate.jpg','woodgrain'),
    TFL('WLH','Walnut Heights','jsi_finish_WLH_WalnutHeights_Laminate.jpg','woodgrain'),
    TFL('ZEN','Zen Grey','jsi_finish_ZEN_ZenGrey_Laminate.jpg','solid'),
].map(s=>({ ...s, width:300, height:300, webp:s.image.replace(/\.jpg$/i,'.webp') }));

// Textile helper - JSI Fabric samples from Momentum and other textile partners
const TEXTILE = (code, name, collection, grade, color) => ({
    id: `textile-${code.toLowerCase()}`,
    name,
    category: 'textiles',
    collection,
    grade,
    color,
    image: `https://www.jsifurniture.com/images/textiles/${collection.toLowerCase().replace(/\s+/g,'-')}/${code.toLowerCase()}.jpg`,
    code,
    description: `${collection} - ${name} (Grade ${grade})`
});

// JSI Textile samples - Momentum Origin collection and others
export const TEXTILE_SAMPLES = [
    // Momentum: Origin Collection (Grade B)
    TEXTILE('VIN', 'Vintage', 'Momentum Origin', 'B', '#722F37'),
    TEXTILE('WHT', 'Wheat', 'Momentum Origin', 'B', '#C4A052'),
    TEXTILE('VCA', 'Vinca', 'Momentum Origin', 'B', '#3B5998'),
    TEXTILE('TWN', 'Twine', 'Momentum Origin', 'B', '#8B7355'),
    TEXTILE('TDE', 'Tide', 'Momentum Origin', 'B', '#4A8B8B'),
    TEXTILE('STL', 'Steel', 'Momentum Origin', 'B', '#5C5C5C'),
    TEXTILE('STY', 'Stately', 'Momentum Origin', 'B', '#6B3A3A'),
    TEXTILE('SPZ', 'Spritz', 'Momentum Origin', 'B', '#E67E22'),
    TEXTILE('SOD', 'Sodalite', 'Momentum Origin', 'B', '#2C3E50'),
    TEXTILE('SHL', 'Shale', 'Momentum Origin', 'B', '#6B6B6B'),
    TEXTILE('SED', 'Seed', 'Momentum Origin', 'B', '#8B7355'),
    TEXTILE('SAP', 'Sapphire', 'Momentum Origin', 'B', '#0F4C75'),
    TEXTILE('REG', 'Regal', 'Momentum Origin', 'B', '#4A0E0E'),
    TEXTILE('MNT', 'Mint', 'Momentum Origin', 'B', '#98D8C8'),
    TEXTILE('MKN', 'Mikan', 'Momentum Origin', 'B', '#C0392B'),
    TEXTILE('LME', 'Lime', 'Momentum Origin', 'B', '#7CB342'),
    TEXTILE('LAV', 'Lavender', 'Momentum Origin', 'B', '#9B59B6'),
    TEXTILE('JDE', 'Jade', 'Momentum Origin', 'B', '#1ABC9C'),
    TEXTILE('INK', 'Ink', 'Momentum Origin', 'B', '#2C3E50'),
    TEXTILE('HZL', 'Hazel', 'Momentum Origin', 'B', '#8D6E63'),
    TEXTILE('GRF', 'Graphite', 'Momentum Origin', 'B', '#424242'),
    TEXTILE('GRN', 'Grain', 'Momentum Origin', 'B', '#D4A574'),
    TEXTILE('FRN', 'Fern', 'Momentum Origin', 'B', '#27AE60'),
    TEXTILE('DEN', 'Denim', 'Momentum Origin', 'B', '#3498DB'),
    TEXTILE('CRM', 'Cream', 'Momentum Origin', 'B', '#F5F5DC'),
    TEXTILE('COR', 'Coral', 'Momentum Origin', 'B', '#E74C3C'),
    TEXTILE('COB', 'Cobalt', 'Momentum Origin', 'B', '#0047AB'),
    TEXTILE('CHR', 'Charcoal', 'Momentum Origin', 'B', '#36454F'),
    TEXTILE('CAN', 'Canyon', 'Momentum Origin', 'B', '#B7410E'),
    TEXTILE('BRK', 'Bark', 'Momentum Origin', 'B', '#5D4037'),
    // Momentum: Silica Collection (Grade C)
    TEXTILE('SIL-ASH', 'Ash', 'Momentum Silica', 'C', '#B2BEB5'),
    TEXTILE('SIL-CHI', 'Chinchilla', 'Momentum Silica', 'C', '#928E85'),
    TEXTILE('SIL-MID', 'Midnight', 'Momentum Silica', 'C', '#191970'),
    TEXTILE('SIL-PEW', 'Pewter', 'Momentum Silica', 'C', '#8F9494'),
    TEXTILE('SIL-SLT', 'Slate', 'Momentum Silica', 'C', '#708090'),
    TEXTILE('SIL-STM', 'Storm', 'Momentum Silica', 'C', '#4F666A'),
    // Crypton Fabrics (Grade D)
    TEXTILE('CRY-BLZ', 'Blaze', 'Crypton', 'D', '#DC143C'),
    TEXTILE('CRY-EMB', 'Ember', 'Crypton', 'D', '#8B4513'),
    TEXTILE('CRY-ICE', 'Ice', 'Crypton', 'D', '#E0FFFF'),
    TEXTILE('CRY-ONX', 'Onyx', 'Crypton', 'D', '#353839'),
    TEXTILE('CRY-PRL', 'Pearl', 'Crypton', 'D', '#FDEEF4'),
    TEXTILE('CRY-SND', 'Sand', 'Crypton', 'D', '#C2B280'),
];

// Legacy sample products (kept) + integrate finish samples + textile samples
export const SAMPLE_PRODUCTS = [
    { id: '2001', name: 'Vision Pull', image: 'https://i.imgur.com/8nL6YQf.png', color: '#B3B3B3', category: 'hardware' },
    { id: '2002', name: 'Forge Pull', image: 'https://i.imgur.com/8nL6YQf.png', color: '#414141', category: 'hardware' },
    { id: '2003', name: 'Brogan Pull', image: 'https://i.imgur.com/8nL6YQf.png', color: '#707070', category: 'hardware' },
    ...FINISH_SAMPLES.map(finish => ({
        id: finish.id,
        name: finish.name,
        image: finish.image,
        color: finish.color,
        category: 'finishes',
        subcategory: finish.category,
        code: finish.code,
        description: finish.description
    })),
    ...TEXTILE_SAMPLES.map(textile => ({
        id: textile.id,
        name: textile.name,
        image: textile.image,
        color: textile.color,
        category: 'textiles',
        collection: textile.collection,
        grade: textile.grade,
        code: textile.code,
        description: textile.description
    })),
];

export const SAMPLES_DATA = SAMPLE_PRODUCTS;