// Shared responsive hook for consistent breakpoint handling across all screens
import { useState, useEffect } from 'react';

export const BREAKPOINTS = {
    mobile: 0,
    tablet: 640,
    desktop: 768,
    wide: 1024,
};

export const useIsDesktop = () => {
    const [isDesktop, setIsDesktop] = useState(() => 
        typeof window !== 'undefined' && window.innerWidth >= BREAKPOINTS.desktop
    );
    
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= BREAKPOINTS.desktop);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return isDesktop;
};

export const useBreakpoint = () => {
    const [breakpoint, setBreakpoint] = useState(() => {
        if (typeof window === 'undefined') return 'mobile';
        const w = window.innerWidth;
        if (w >= BREAKPOINTS.wide) return 'wide';
        if (w >= BREAKPOINTS.desktop) return 'desktop';
        if (w >= BREAKPOINTS.tablet) return 'tablet';
        return 'mobile';
    });
    
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            if (w >= BREAKPOINTS.wide) setBreakpoint('wide');
            else if (w >= BREAKPOINTS.desktop) setBreakpoint('desktop');
            else if (w >= BREAKPOINTS.tablet) setBreakpoint('tablet');
            else setBreakpoint('mobile');
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return breakpoint;
};

// Helper to get responsive value based on current breakpoint
export const useResponsiveValue = (values) => {
    const breakpoint = useBreakpoint();
    return values[breakpoint] ?? values.mobile ?? values.desktop ?? Object.values(values)[0];
};
