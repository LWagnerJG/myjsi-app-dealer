import React from 'react';
import { Home, Briefcase, Package, Users, PieChart, Settings } from 'lucide-react';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';
import { useModalState } from '../../hooks/useModalState.js';

export const NavigationShell = ({ currentScreen, onNavigate, theme }) => {
    const { isModalOpen } = useModalState();
    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'projects', icon: Briefcase, label: 'Projects' },
        { id: 'orders', icon: Package, label: 'Orders' },
        { id: 'sales', icon: PieChart, label: 'Sales' },
        { id: 'resources/dealer-directory', icon: Users, label: 'Directory' },
    ];

    const isActive = (id) => {
        if (id === 'home' && currentScreen === 'home') return true;
        if (id !== 'home' && currentScreen.startsWith(id)) return true;
        return false;
    };

    return (
        <>
            {/* Desktop Sidebar - Floating Glass Pill */}
            <div 
                className={`hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col gap-2 transition-opacity duration-200 ${isModalOpen ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ zIndex: DESIGN_TOKENS.zIndex.navigation }}
            >
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/20 p-2 rounded-[2rem] flex flex-col gap-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group ${isActive(item.id)
                                    ? 'bg-black text-white shadow-lg scale-110'
                                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />

                            {/* Tooltip */}
                            <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl translate-x-2 group-hover:translate-x-0 duration-200">
                                {item.label}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile Bottom Tab Bar - Floating Pill Style */}
            <div 
                className={`lg:hidden fixed left-4 right-4 transition-all duration-300 ${isModalOpen ? 'opacity-0 pointer-events-none translate-y-8' : ''}`}
                style={{ 
                    bottom: 'max(16px, env(safe-area-inset-bottom))',
                    zIndex: DESIGN_TOKENS.zIndex.navigation 
                }}
            >
                <div 
                    className="flex justify-around items-center px-2 py-2 rounded-full"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.04)'
                    }}
                >
                    {navItems.slice(0, 4).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`p-3 rounded-full transition-all duration-200 ${isActive(item.id)
                                    ? 'bg-black text-white shadow-lg'
                                    : 'text-gray-400 active:bg-gray-100 active:text-gray-700'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                        </button>
                    ))}
                    <button
                        onClick={() => onNavigate('settings')}
                        className="p-3 rounded-full transition-all duration-200 text-gray-400 active:bg-gray-100 active:text-gray-700"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </>
    );
};
