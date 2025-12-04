// Error Boundary Component
// Catches JavaScript errors in child component tree and displays fallback UI
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Log to error reporting service
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            const { theme, fallback } = this.props;
            
            // Custom fallback component
            if (fallback) {
                return typeof fallback === 'function' 
                    ? fallback({ error: this.state.error, retry: this.handleRetry })
                    : fallback;
            }
            
            // Default error UI
            return (
                <div 
                    className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center"
                    style={{ backgroundColor: theme?.colors?.background || '#f8f8f8' }}
                >
                    <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: '#FEE2E220' }}
                    >
                        <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <h3 
                        className="text-base font-semibold mb-1"
                        style={{ color: theme?.colors?.textPrimary || '#111' }}
                    >
                        Something went wrong
                    </h3>
                    <p 
                        className="text-sm mb-4 max-w-xs"
                        style={{ color: theme?.colors?.textSecondary || '#666' }}
                    >
                        We're sorry, but something unexpected happened. Please try again.
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
                        style={{
                            backgroundColor: theme?.colors?.accent || '#AD8A77',
                            color: '#FFFFFF',
                        }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mt-4 text-left w-full max-w-md">
                            <summary 
                                className="text-xs cursor-pointer"
                                style={{ color: theme?.colors?.textSecondary || '#666' }}
                            >
                                Error details
                            </summary>
                            <pre 
                                className="mt-2 p-3 rounded-lg text-xs overflow-auto max-h-32"
                                style={{ 
                                    backgroundColor: theme?.colors?.subtle || '#f0f0f0',
                                    color: theme?.colors?.textSecondary || '#666',
                                }}
                            >
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

// Higher-order component for wrapping with error boundary
export const withErrorBoundary = (Component, fallback) => {
    return function WrappedComponent(props) {
        return (
            <ErrorBoundary theme={props.theme} fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
};

export default ErrorBoundary;
