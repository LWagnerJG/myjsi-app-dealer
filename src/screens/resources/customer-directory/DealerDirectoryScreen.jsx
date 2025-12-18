import React, { useEffect } from 'react';

// Customer Directory now redirects to Projects/Customers tab
// This keeps the routing simple and consolidates customer management
export const CustomerDirectoryScreen = ({ onNavigate, setProjectsTabOverride }) => {
    useEffect(() => {
        // Set the projects tab to customers and navigate
        if (setProjectsTabOverride) {
            setProjectsTabOverride('customers');
        }
        onNavigate?.('projects');
    }, [onNavigate, setProjectsTabOverride]);

    // Show a brief loading state while redirecting
    return (
        <div className="flex items-center justify-center h-full">
            <span className="text-gray-500">Loading customers...</span>
        </div>
    );
};

export default CustomerDirectoryScreen;
