import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    danger = false,
    isLoading = false
}) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !isLoading) onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            return () => window.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose, isLoading]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={!isLoading ? onClose : undefined}
            ></div>

            {/* Dialog */}
            <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                {danger && (
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {title}
                </h3>

                {/* Message */}
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg font-medium text-white transition-all transform hover:scale-105 flex items-center gap-2 ${danger
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-primary-600 hover:bg-primary-700'
                            } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {isLoading && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
