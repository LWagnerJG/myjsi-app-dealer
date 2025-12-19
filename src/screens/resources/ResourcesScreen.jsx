import React, { useMemo, useEffect } from 'react';
import {
    Database, Search, Share2, FileText, DollarSign, Calendar, Percent,
    Palette, Package, Users, MapPin, MonitorPlay, Wrench, Clock, ChevronRight,
    ScanLine
} from 'lucide-react';
import { RESOURCES_DATA } from './data.js';
import { GlassCard, ScreenLayout } from '../../design-system/index.js';
import { DEFAULT_HOME_APPS, allApps } from '../../data.jsx';

// Cleaner, more descriptive sublabels
const sublabelMap = {
    'Lead Times': 'View current production schedules',
    'Discontinued Finishes Database': 'Search legacy finishes',
    'Request COM Yardage': 'Submit fabric requirements',
    'Search Fabrics': 'Browse textile options',
    'Commission Rates': 'View rep commission rates',
    'Contracts': 'Pricing and contract info',
    'Dealer Directory': 'Find dealer contacts',
    'Customers': 'Customer directory',
    'Discounts': 'Sample pricing info',
    'Install Instructions': 'Assembly guides',
    'Loaner Pool': 'Browse sample furniture',
    'Request Field Visit': 'Schedule a site visit',
    'Social Media': 'Marketing assets',
    'Presentations': 'Sales deck library',
    'Tradeshows': 'Upcoming events',
    'New Dealer Sign-Up': 'Onboard new dealers',
    'Scan': 'Receive and confirm deliveries'
};

// Clean category names (remove redundant "Resources")
const cleanCategoryName = (name) => {
    return name
        .replace(' Resources', '')
        .replace('Dealer Tools', 'Tools');
};

const CORE_LABELS = {
    orders: 'Orders',
    sales: 'Sales',
    products: 'Products',
    projects: 'Projects',
    community: 'Community',
    samples: 'Samples',
    replacements: 'Replacements'
};

export const ResourcesScreen = ({ theme, onNavigate, homeApps }) => {
    // Compute core app fallbacks (apps removed from home but part of default set, excluding 'resources')
    const coreFallbackItems = useMemo(() => {
        const currentSet = new Set(homeApps || []);
        return DEFAULT_HOME_APPS
            .filter(r => r !== 'resources' && !currentSet.has(r))
            .map(route => ({ label: CORE_LABELS[route] || route, nav: route }))
            .sort((a,b)=>a.label.localeCompare(b.label));
    }, [homeApps]);

    const resourceCategories = useMemo(() => {
        const base = RESOURCES_DATA || [];
        if (coreFallbackItems.length === 0) return base;
        return [
            ...base,
            { category: 'Core Apps', items: coreFallbackItems }
        ];
    }, [coreFallbackItems]);

    useEffect(() => {
        if (document.getElementById('resources-no-scrollbar-style')) return;
        const style = document.createElement('style');
        style.id = 'resources-no-scrollbar-style';
        style.innerHTML = `.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .no-scrollbar::-webkit-scrollbar { display: none; }`;
        document.head.appendChild(style);
    }, []);

    const getResourceIcon = (label) => {
        if (label.includes('Lead Times')) return Clock;
        if (label.includes('Commission')) return DollarSign;
        if (label.includes('Contract')) return FileText;
        if (label.includes('Social')) return Share2;
        if (label.includes('Sample') || label.includes('Discount')) return Percent;
        if (label.includes('Search Fabrics')) return Search;
        if (label.includes('Discontinued')) return Palette;
        if (label.includes('Loaner')) return Package;
        if (label.includes('Dealer') || label.includes('Customer')) return Users;
        if (label.includes('Field Visit')) return MapPin;
        if (label.includes('Presentations')) return MonitorPlay;
        if (label.includes('Install')) return Wrench;
        if (label.includes('Tradeshow')) return Calendar;
        if (label.includes('Tradeshows')) return Calendar;
        if (label === 'Scan') return ScanLine;
        if (Object.values(CORE_LABELS).includes(label)) return Database;
        return Database;
    };

    const Row = ({ item, isLast }) => {
        const Icon = getResourceIcon(item.label);
        const sub = sublabelMap[item.label] || (Object.values(CORE_LABELS).includes(item.label) ? 'Main app' : '');
        
        return (
            <button
                onClick={() => onNavigate(item.nav)}
                className="w-full px-3 py-2.5 text-left flex items-center gap-3 transition-colors hover:bg-black/[0.02] active:scale-[0.99]"
                style={{
                    borderBottom: isLast ? 'none' : `1px solid ${theme.colors.border}20`
                }}
            >
                <div
                    className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: theme.colors.subtle }}
                >
                    <Icon className="w-4 h-4" style={{ color: theme.colors.accent }} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[13px]" style={{ color: theme.colors.textPrimary }}>
                        {item.label}
                    </h4>
                    {sub && (
                        <p className="text-[11px] truncate" style={{ color: theme.colors.textSecondary }}>
                            {sub}
                        </p>
                    )}
                </div>
                <ChevronRight
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: theme.colors.border }}
                />
            </button>
        );
    };

    const CategoryCard = ({ category }) => (
        <GlassCard theme={theme} className="p-1 overflow-hidden" variant="elevated">
            <h3 
                className="text-[11px] font-semibold uppercase tracking-wider px-3 py-2" 
                style={{ color: theme.colors.textSecondary }}
            >
                {cleanCategoryName(category.category)}
            </h3>
            <div>
                {category.items?.map((item, idx) => (
                    <Row 
                        key={item.nav + item.label} 
                        item={item} 
                        isLast={idx === category.items.length - 1} 
                    />
                ))}
            </div>
        </GlassCard>
    );

    return (
        <ScreenLayout
            theme={theme}
            maxWidth="default"
            padding={true}
            paddingBottom="8rem"
            gap="0.75rem"
        >
            {/* Title - no subtitle needed */}
            <h1 className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
                Resources
            </h1>
            
            {/* Categories */}
            {resourceCategories.map((cat) => (
                <CategoryCard key={cat.category} category={cat} />
            ))}
        </ScreenLayout>
    );
};
