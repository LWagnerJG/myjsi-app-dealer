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
    Filter
} from 'lucide-react';
import { PRODUCTS_CATEGORIES_DATA, PRODUCT_DATA, FABRICS_DATA, JSI_MODELS } from './data.js';
import { useIsDesktop } from '../../hooks/useResponsive.js';

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
        return (
            <GlassCard
                theme={theme}
                className={`overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] ${className}`}
                onClick={handleClick}
                style={{ padding: 0, backgroundColor: '#f8f7f5' }}
            >
                {/* Image strip at top - clean layout, no dividers */}
                <div 
                    className="flex w-full overflow-hidden"
                    style={{ 
                        height: isDesktop ? '120px' : '90px',
                        backgroundColor: '#f8f7f5',
                        gap: 0
                    }}
                >
                    {category.images?.slice(0, isDesktop ? 3 : 2).map((img, index) => (
                        <div 
                            key={index} 
                            className="flex-1 overflow-hidden"
                            style={{ 
                                backgroundColor: '#f8f7f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <img
                                src={img}
                                alt={`${category.name} example ${index + 1}`}
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                                style={{ 
                                    padding: '8px',
                                    backgroundColor: '#f8f7f5'
                                }}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
                {/* Text content below */}
                <div 
                    className="px-4 py-3"
                    style={{ backgroundColor: '#ffffff' }}
                >
                    <h2 
                        className="font-semibold" 
                        style={{ 
                            color: theme.colors.textPrimary,
                            fontSize: isDesktop ? '1rem' : '0.9375rem',
                            marginBottom: '2px'
                        }}
                    >
                        {category.name}
                    </h2>
                    {category.description && (
                        <p 
                            className="text-xs" 
                            style={{ 
                                color: theme.colors.textSecondary,
                                lineHeight: '1.4'
                            }}
                        >
                            {category.description}
                        </p>
                    )}
                </div>
            </GlassCard>
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
    const [viewMode, setViewMode] = useState('grid');
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef(null);
    const isDesktop = useIsDesktop();

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            setIsScrolled(scrollContainerRef.current.scrollTop > 10);
        }
    }, []);

    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return PRODUCTS_CATEGORIES_DATA || [];

        const lowerSearch = searchTerm.toLowerCase();
        return PRODUCTS_CATEGORIES_DATA.filter(category =>
            category.name.toLowerCase().includes(lowerSearch) ||
            category.description?.toLowerCase().includes(lowerSearch)
        );
    }, [searchTerm]);

    const handleCategoryClick = useCallback((category) => {
        if (category.nav) {
            onNavigate(category.nav);
        }
    }, [onNavigate]);

    const toggleViewMode = useCallback(() => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    }, []);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    // Responsive content max-width
    const contentMaxWidth = isDesktop ? 'max-w-5xl mx-auto w-full' : '';

    const header = ({ isScrolled }) => (
        <div className="flex items-center space-x-3 py-4 w-full">
            <StandardSearchBar
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search products..."
                theme={theme}
                className="flex-grow"
            />
            <ViewModeToggle
                viewMode={viewMode}
                onToggle={toggleViewMode}
                theme={theme}
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
                            ? (isDesktop ? 'grid grid-cols-2 lg:grid-cols-3 gap-5' : 'grid grid-cols-1 gap-3')
                            : (isDesktop ? 'grid grid-cols-2 gap-3' : 'space-y-2')
                    } 
                    style={{ 
                        paddingTop: isDesktop ? '0' : '4px',
                        paddingLeft: isDesktop ? '0' : '0',
                        paddingRight: isDesktop ? '0' : '0'
                    }}
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