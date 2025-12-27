import React, {
    useState,
    useMemo,
    useCallback,
    useRef,
    useEffect,
    useLayoutEffect
} from 'react';
import { GlassCard, ScreenLayout } from '../../design-system/index.js';
import { SearchInput } from '../../components/common/SearchInput.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import {
    List,
    Grid,
    ArrowRight,
    Package,
    Armchair,
    MoreVertical,
    ChevronRight,
    Layers
} from 'lucide-react';
import { PRODUCTS_CATEGORIES_DATA, PRODUCT_DATA, FABRICS_DATA, JSI_MODELS, JSI_SERIES } from './data.js';
import { useIsDesktop } from '../../hooks/useResponsive.js';

// Map category keys to nav paths
const CATEGORY_NAV_MAP = {
    'benches': 'products/category/benches',
    'casegoods': 'products/category/casegoods',
    'conference-tables': 'products/category/conference-tables',
    'guest': 'products/category/guest',
    'lounge': 'products/category/lounge',
    'swivels': 'products/category/swivels',
    'training-tables': 'products/category/training-tables'
};

// Build series data with category info for direct navigation
const buildSeriesData = () => {
    const seriesData = [];
    Object.entries(PRODUCT_DATA).forEach(([categoryKey, categoryData]) => {
        (categoryData.products || []).forEach(product => {
            // Avoid duplicates (some series appear in multiple categories)
            if (!seriesData.find(s => s.name === product.name)) {
                seriesData.push({
                    name: product.name,
                    categoryKey,
                    categoryName: categoryData.name,
                    nav: `${CATEGORY_NAV_MAP[categoryKey]}/${product.id}`
                });
            }
        });
    });
    return seriesData.sort((a, b) => a.name.localeCompare(b.name));
};

const SERIES_DATA = buildSeriesData();

// Map category keys to display names
const CATEGORY_KEY_MAP = {
    'benches': 'Benches',
    'casegoods': 'Casegoods',
    'conference-tables': 'Conference Tables',
    'guest': 'Guest',
    'lounge': 'Lounge',
    'swivels': 'Swivels',
    'training-tables': 'Training Tables'
};

// Build a mapping of series name -> category names for search
const buildSeriesCategoryMap = () => {
    const map = {};
    Object.entries(PRODUCT_DATA).forEach(([categoryKey, categoryData]) => {
        const categoryName = CATEGORY_KEY_MAP[categoryKey] || categoryData.name;
        (categoryData.products || []).forEach(product => {
            const seriesName = product.name.toLowerCase();
            if (!map[seriesName]) map[seriesName] = [];
            if (!map[seriesName].includes(categoryName)) {
                map[seriesName].push(categoryName);
            }
        });
    });
    return map;
};

const SERIES_CATEGORY_MAP = buildSeriesCategoryMap();

const CategoryCard = React.memo(({
    category,
    theme,
    viewMode,
    onClick,
    isDesktop,
    className = ''
}) => {
    const handleClick = useCallback(() => {
        onClick(category);
    }, [category, onClick]);

    if (viewMode === 'grid') {
        // Show 3 images - they float naturally on a clean background
        const images = category.images?.slice(0, 3) || [];
        
        return (
            <div
                className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] ${className}`}
                onClick={handleClick}
                style={{ 
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
            >
                {/* Images float on white - no boxes, just products */}
                <div 
                    className="flex items-end justify-evenly"
                    style={{ 
                        padding: isDesktop ? '40px 32px 28px' : '28px 16px 20px',
                        minHeight: isDesktop ? '200px' : '160px'
                    }}
                >
                    {images.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`${category.name} ${index + 1}`}
                            className="object-contain"
                            style={{ 
                                maxHeight: isDesktop ? '160px' : '125px',
                                maxWidth: isDesktop ? '32%' : '30%',
                                flex: '0 1 auto'
                            }}
                            loading="lazy"
                        />
                    ))}
                </div>
                {/* Category name */}
                <div 
                    className="px-4 pb-3.5"
                    style={{ paddingTop: '0' }}
                >
                    <h2 
                        className="font-semibold" 
                        style={{ 
                            color: theme.colors.textPrimary,
                            fontSize: isDesktop ? '0.9375rem' : '0.875rem'
                        }}
                    >
                        {category.name}
                    </h2>
                </div>
            </div>
        );
    }
    return (
        <GlassCard
            theme={theme}
            className={`p-3 cursor-pointer transform transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${className}`}
            onClick={handleClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <img
                        src={category.images?.[0]}
                        alt={category.name}
                        className="w-12 h-12 rounded-md object-cover"
                        loading="lazy"
                    />
                    <div>
                        <h3 className="font-semibold" style={{ color: theme.colors.textPrimary, fontSize: isDesktop ? '1rem' : '0.9375rem' }}>
                            {category.name}
                        </h3>
                        {category.description && isDesktop && (
                            <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                {category.description}
                            </p>
                        )}
                    </div>
                </div>
                <ArrowRight className="w-5 h-5" style={{ color: theme.colors.secondary }} />
            </div>
        </GlassCard>
    );
});
CategoryCard.displayName = 'CategoryCard';

const ViewModeToggle = React.memo(({ viewMode, onToggle, theme }) => (
    <button
        onClick={onToggle}
        className="p-3.5 rounded-full transition-all duration-200 transform active:scale-90"
        style={{
            backgroundColor: theme.colors.surface,
            border: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)'
        }}
        aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
    >
        {viewMode === 'grid' ? (
            <List className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
        ) : (
            <Grid className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
        )}
    </button>
));
ViewModeToggle.displayName = 'ViewModeToggle';

// Combined Options Menu - View mode toggle + Series quick navigation
const OptionsMenu = React.memo(({ viewMode, onToggleViewMode, onNavigateToSeries, theme, isDesktop }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSeriesClick = (series) => {
        setIsOpen(false);
        onNavigateToSeries(series);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3.5 rounded-full transition-all duration-200 transform active:scale-90"
                style={{
                    backgroundColor: theme.colors.surface,
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)'
                }}
                aria-label="Options menu"
            >
                <MoreVertical className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 rounded-xl overflow-hidden z-50"
                    style={{
                        backgroundColor: theme.colors.surface,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        width: isDesktop ? '260px' : '240px'
                    }}
                >
                    {/* View Mode Toggle - Only show on desktop */}
                    {isDesktop && (
                        <>
                            <button
                                onClick={() => {
                                    onToggleViewMode();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-black/5"
                            >
                                <div className="flex items-center">
                                    {viewMode === 'grid' ? (
                                        <List className="w-4 h-4 mr-3" style={{ color: theme.colors.textSecondary }} />
                                    ) : (
                                        <Grid className="w-4 h-4 mr-3" style={{ color: theme.colors.textSecondary }} />
                                    )}
                                    <span className="text-sm" style={{ color: theme.colors.textPrimary }}>
                                        {viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
                                    </span>
                                </div>
                            </button>

                            {/* Divider */}
                            <div style={{ height: 1, backgroundColor: theme.colors.border }} />
                        </>
                    )}

                    {/* Browse Series Section */}
                    <div 
                        className="px-4 py-2.5 flex items-center"
                        style={{ backgroundColor: theme.colors.background }}
                    >
                        <Layers className="w-3.5 h-3.5 mr-2" style={{ color: theme.colors.textSecondary }} />
                        <span 
                            className="text-xs font-semibold uppercase tracking-wide"
                            style={{ color: theme.colors.textSecondary }}
                        >
                            Jump to Series
                        </span>
                    </div>

                    {/* Series List */}
                    <div 
                        className="overflow-y-auto scrollbar-hide"
                        style={{ 
                            maxHeight: '280px'
                        }}
                    >
                        {SERIES_DATA.map(series => (
                            <button
                                key={series.name}
                                onClick={() => handleSeriesClick(series)}
                                className="w-full flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-black/5"
                            >
                                <div className="flex flex-col items-start">
                                    <span 
                                        className="text-sm font-medium"
                                        style={{ color: theme.colors.textPrimary }}
                                    >
                                        {series.name}
                                    </span>
                                    <span 
                                        className="text-xs"
                                        style={{ color: theme.colors.textSecondary }}
                                    >
                                        {series.categoryName}
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});
OptionsMenu.displayName = 'OptionsMenu';

const StickyHeader = React.memo(({
    isScrolled,
    theme,
    viewMode,
    onToggleViewMode,
    searchTerm,
    onSearchChange,
    isDesktop
}) => (
    <div
        className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''
            }`}
        style={{
            backgroundColor: isScrolled ? `${theme.colors.background}e0` : 'transparent',
            backdropFilter: isScrolled ? 'blur(12px)' : 'none',
            WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
            borderBottom: `1px solid ${isScrolled ? theme.colors.border + '40' : 'transparent'}`,
            padding: '16px'
        }}
    >
        <div 
            className="flex items-center space-x-3"
            style={{
                maxWidth: isDesktop ? '72rem' : '100%',
                margin: isDesktop ? '0 auto' : '0',
            }}
        >
            <StandardSearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Search products..."
                theme={theme}
                className="flex-grow"
            />
            <ViewModeToggle
                viewMode={viewMode}
                onToggle={onToggleViewMode}
                theme={theme}
            />
        </div>
    </div>
));
StickyHeader.displayName = 'StickyHeader';

const EmptyState = React.memo(({ searchTerm, theme }) => (
    <GlassCard theme={theme} className="p-8 text-center">
        <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
        <p className="font-semibold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>
            No Products Found
        </p>
        <p style={{ color: theme.colors.textSecondary }}>
            No products match your search for "{searchTerm}"
        </p>
    </GlassCard>
));
EmptyState.displayName = 'EmptyState';

export const ProductsScreen = ({ theme, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const isDesktop = useIsDesktop();
    // Default to list view on mobile, grid on desktop
    const [viewMode, setViewMode] = useState(isDesktop ? 'grid' : 'list');
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef(null);

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            setIsScrolled(scrollContainerRef.current.scrollTop > 10);
        }
    }, []);

    const filteredCategories = useMemo(() => {
        let categories = PRODUCTS_CATEGORIES_DATA || [];

        // If no search term, return all categories
        if (!searchTerm.trim()) return categories;

        const lowerSearch = searchTerm.toLowerCase();
        
        return categories.filter(category => {
            // Check category name and description
            if (category.name.toLowerCase().includes(lowerSearch)) return true;
            if (category.description?.toLowerCase().includes(lowerSearch)) return true;
            
            // Check if search matches any series name in this category
            const matchingSeries = Object.entries(SERIES_CATEGORY_MAP).find(([seriesName, catNames]) => {
                return seriesName.includes(lowerSearch) && catNames.includes(category.name);
            });
            
            return !!matchingSeries;
        });
    }, [searchTerm]);

    const handleCategoryClick = useCallback((category) => {
        if (category.nav) {
            onNavigate(category.nav);
        }
    }, [onNavigate]);

    const toggleViewMode = useCallback(() => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    }, []);

    // Handle search change - StandardSearchBar passes value directly (not event)
    const handleSearchChange = useCallback((value) => {
        // Handle both direct value and event object
        const newValue = typeof value === 'string' ? value : (value?.target?.value ?? '');
        setSearchTerm(newValue);
    }, []);

    // Navigate to a specific series
    const handleNavigateToSeries = useCallback((series) => {
        if (series.nav) {
            onNavigate(series.nav);
        }
    }, [onNavigate]);

    // Responsive content max-width
    const contentMaxWidth = isDesktop ? 'max-w-5xl mx-auto w-full' : '';

    const header = ({ isScrolled }) => (
        <div className="flex items-center space-x-3 py-4 w-full">
            <StandardSearchBar
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search products or series..."
                theme={theme}
                className="flex-grow"
            />
            <OptionsMenu
                viewMode={viewMode}
                onToggleViewMode={toggleViewMode}
                onNavigateToSeries={handleNavigateToSeries}
                theme={theme}
                isDesktop={isDesktop}
            />
        </div>
    );

    return (
        <ScreenLayout
            theme={theme}
            header={header}
            maxWidth="wide"
            padding={true}
            paddingBottom="8rem"
        >
            {/* Page header for desktop */}
            {isDesktop && (
                <div className="mb-6 pt-2">
                    <h1 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>Products</h1>
                    <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                        Browse our furniture collections by category
                    </p>
                </div>
            )}
            
            {filteredCategories.length === 0 ? (
                <EmptyState searchTerm={searchTerm} theme={theme} />
            ) : (
                <div 
                    className={
                        viewMode === 'grid' 
                            ? (isDesktop ? 'grid grid-cols-2 lg:grid-cols-3 gap-4' : 'grid grid-cols-2 gap-2.5')
                            : (isDesktop ? 'grid grid-cols-2 gap-3' : 'space-y-2')
                    } 
                    style={{ paddingTop: '4px' }}
                >
                    {filteredCategories.map(category => (
                        <CategoryCard
                            key={category.name}
                            category={category}
                            theme={theme}
                            viewMode={viewMode}
                            onClick={handleCategoryClick}
                            isDesktop={isDesktop}
                        />
                    ))}
                </div>
            )}
        </ScreenLayout>
    );
};