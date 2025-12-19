import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-dark-900">
                    <div className="max-w-md w-full bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Oops! Something went wrong
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            We encountered an unexpected error. Please try reloading the page.
                        </p>

                        {this.state.error && (
                            <details className="text-left mb-6">
                                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                    Error details
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto text-red-600 dark:text-red-400">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
