import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './ui/Icon';

/**
 * Error Fallback UI component
 * Displayed when a page crashes
 */
const ErrorFallback = ({ error, resetError }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoHome = () => {
    resetError();
    navigate('/');
  };

  const handleGoBack = () => {
    resetError();
    navigate(-1);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="flex items-center justify-center w-16 h-16 mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
        <Icon name="triangle-alert" className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Something went wrong
      </h2>

      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-4">
        An unexpected error occurred on this page. This has been logged for review.
      </p>

      {/* Error details - collapsed by default */}
      {error && (
        <details className="w-full max-w-md mb-6">
          <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            Show error details
          </summary>
          <pre className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32">
            {error.message || error.toString()}
            {'\n\nPath: ' + location.pathname}
          </pre>
        </details>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={resetError}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Icon name="loader-circle" className="w-4 h-4" />
          Try again
        </button>

        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Icon name="arrow-left" className="w-4 h-4" />
          Go back
        </button>

        <button
          onClick={handleGoHome}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Icon name="house" className="w-4 h-4" />
          Home
        </button>

        <button
          onClick={handleReload}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Reload page
        </button>
      </div>
    </div>
  );
};

/**
 * PageErrorBoundary - Catches rendering errors within a page
 *
 * Features:
 * - Catches JavaScript errors in child components
 * - Displays user-friendly error UI
 * - Provides retry, go back, and go home options
 * - Resets automatically when location changes
 *
 * Usage:
 * <PageErrorBoundary>
 *   <YourPageComponent />
 * </PageErrorBoundary>
 */
class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for monitoring/debugging
    console.error('PageErrorBoundary caught an error:', error, errorInfo);

    // You could send to error tracking service here
    // Example: errorTrackingService.log(error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    // Reset error state when location changes (user navigates away and back)
    if (this.state.hasError && this.props.location !== prevProps.location) {
      this.setState({ hasError: false, error: null });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

/**
 * HOC wrapper to inject location prop into class component
 * This enables automatic reset when route changes
 */
const PageErrorBoundaryWithLocation = (props) => {
  const location = useLocation();
  return <PageErrorBoundary {...props} location={location} />;
};

export default PageErrorBoundaryWithLocation;
