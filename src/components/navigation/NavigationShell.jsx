import React from 'react';
import { Home, Briefcase, Package, Users, PieChart, Settings, MessageSquare, Database, Armchair, Box } from 'lucide-react';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';
import { useModalState } from '../../hooks/useModalState.js';

// All available navigation items - can be customized in Settings
export const ALL_NAV_ITEMS = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'projects', icon: Briefcase, label: 'Projects' },
    { id: 'orders', icon: Package, label: 'Orders' },
    { id: 'sales', icon: PieChart, label: 'Sales' },
    { id: 'samples', icon: Box, label: 'Samples' },
    { id: 'products', icon: Armchair, label: 'Products' },
    { id: 'community', icon: MessageSquare, label: 'Community' },
    { id: 'resources', icon: Database, label: 'Resources' },
    { id: 'resources/dealer-directory', icon: Users, label: 'Directory' },
];

export const NavigationShell = ({ currentScreen, onNavigate, theme, customNavItems }) => {
    const { isModalOpen } = useModalState();
    
    // Use custom nav items if provided, otherwise use default
    const navItems = customNavItems && customNavItems.length > 0 
        ? customNavItems.map(id => ALL_NAV_ITEMS.find(item => item.id === id)).filter(Boolean)
        : ALL_NAV_ITEMS.slice(0, 5); // Default: first 5 items

    const isActive = (id) => {
        if (id === 'home' && currentScreen === 'home') return true;
        if (id !== 'home' && currentScreen.startsWith(id)) return true;
        return false;
    };

    return (
        <>
            {/* Gradient blur background behind nav */}
            <div 
                className={`fixed left-0 right-0 pointer-events-none transition-opacity duration-300 ${isModalOpen ? 'opacity-0' : 'opacity-100'}`}
                style={{ 
                    bottom: 0,
                    height: '120px',
                    background: 'linear-gradient(to top, rgba(247,245,242,0.95) 0%, rgba(247,245,242,0.8) 40%, rgba(247,245,242,0) 100%)',
                    zIndex: DESIGN_TOKENS.zIndex.navigation - 1,
                }}
            />
            
            {/* Bottom Navigation Bar - Used on all screen sizes */}
            <div 
                className={`fixed left-4 right-4 transition-all duration-300 ${isModalOpen ? 'opacity-0 pointer-events-none translate-y-8' : ''}`}
                style={{ 
                    bottom: 'max(16px, env(safe-area-inset-bottom))',
                    zIndex: DESIGN_TOKENS.zIndex.navigation 
                }}
            >
                <div 
                    className="flex justify-around items-center px-2 py-2 rounded-full max-w-lg mx-auto"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.04)'
                    }}
                >
                    {navItems.slice(0, 5).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`p-3 rounded-full transition-all duration-200 ${isActive(item.id)
                                    ? 'bg-black text-white shadow-lg'
                                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-100 active:text-gray-700'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};
