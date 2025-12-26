import React, { useState } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { LogOut, Home, Loader2 } from 'lucide-react';

// Clear all session data
const clearSessionData = () => {
    // Clear localStorage items related to session
    const sessionKeys = ['auth_token', 'user_data', 'session_id', 'refresh_token'];
    sessionKeys.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear any cookies (for session cookies)
    document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
};

export const LogoutScreen = ({ theme, onNavigate }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        
        try {
            // Clear all session data
            clearSessionData();
            
            // Small delay for UX feedback
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Navigate to home (or login page in a real app)
            onNavigate('home');
        } catch (error) {
            // Still navigate even if clearing fails
            onNavigate('home');
        }
    };

    const handleCancel = () => {
        onNavigate('home');
    };

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <PageTitle title="Sign Out" theme={theme} />
            <div className="flex-1 flex items-center justify-center px-4">
                <GlassCard theme={theme} className="p-8 text-center w-full max-w-md">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
                        <LogOut className="w-8 h-8" style={{ color: theme.colors.accent }} />
                    </div>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
                        Sign Out
                    </h2>
                    <p className="text-sm mb-8" style={{ color: theme.colors.textSecondary }}>
                        Are you sure you want to sign out of your account?
                    </p>
                    
                    <div className="space-y-3">
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-full font-semibold text-white transition-all duration-200 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#B85C5C' }}
                        >
                            {isLoggingOut ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Signing Out...</span>
                                </>
                            ) : (
                                <>
                                    <LogOut className="w-5 h-5" />
                                    <span>Yes, Sign Out</span>
                                </>
                            )}
                        </button>
                        
                        <button
                            onClick={handleCancel}
                            className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-full font-semibold transition-all duration-200 transform active:scale-95"
                            style={{ 
                                backgroundColor: theme.colors.subtle, 
                                color: theme.colors.textPrimary 
                            }}
                        >
                            <Home className="w-5 h-5" />
                            <span>Cancel</span>
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};