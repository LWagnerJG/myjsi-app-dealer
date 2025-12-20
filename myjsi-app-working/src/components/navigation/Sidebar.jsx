import React from 'react';
import { logoLight } from '../../data.jsx';
import { LogOut } from 'lucide-react';

export const Sidebar = ({
    theme,
    menuItems,
    currentScreen,
    onNavigate,
    isDarkMode,
    onToggleTheme
}) => {
    const filterStyle = isDarkMode ? 'brightness(0) invert(1)' : 'none';

    return (
        <div className="hidden md:flex flex-col w-64 h-full border-r z-30"
            style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border
            }}>
            {/* Logo Area */}
            <div className="p-6 flex items-center justify-center">
                <img
                    src={logoLight}
                    alt="MyJSI Logo"
                    className="h-8 w-auto object-contain"
                    style={{ filter: filterStyle }}
                />
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = currentScreen.startsWith(item.id);
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                            style={{
                                backgroundColor: isActive ? theme.colors.accent : 'transparent',
                                color: isActive ? '#FFFFFF' : theme.colors.textSecondary
                            }}
                        >
                            <item.icon
                                className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'group-hover:text-gray-900 dark:group-hover:text-white'
                                    }`}
                                style={{ color: isActive ? '#FFFFFF' : undefined }}
                            />
                            <span className={`font-medium text-sm ${isActive ? 'text-white' : 'group-hover:text-gray-900 dark:group-hover:text-white'
                                }`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
                <button
                    onClick={onToggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                    style={{ color: theme.colors.textSecondary }}
                >
                    <div className="w-5 h-5 flex items-center justify-center">
                        {isDarkMode ? '☀️' : '🌙'}
                    </div>
                    <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </div>
        </div>
    );
};
