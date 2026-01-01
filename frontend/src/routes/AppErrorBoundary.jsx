import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Surface the error for logging/monitoring
    console.error('Router rendering error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 text-gray-800 p-6">
          <h1 className="text-2xl font-bold">Oops, something went wrong</h1>
          <p className="text-sm text-gray-600 max-w-xl text-center">
            A rendering error occurred. If this keeps happening, please capture the steps and share the console log.
          </p>
          {this.state.error && (
            <pre className="bg-white border border-gray-200 rounded-md p-3 text-xs text-red-600 max-w-xl w-full overflow-auto">
              {this.state.error.toString()}
            </pre>
          )}
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
