import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Inbox } from 'lucide-react';

export function EmptyState({ message, actionText, actionLink, onActionClick }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center mb-6 animate-pulse-slow">
                <Inbox className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {message || 'No POVs yet'}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
                Start building your collection by uploading your first gameplay POV.
            </p>

            {onActionClick ? (
                <button
                    onClick={onActionClick}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                >
                    <Upload className="w-5 h-5" />
                    {actionText || 'Upload POV'}
                </button>
            ) : actionLink && (
                <Link
                    to={actionLink}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                >
                    <Upload className="w-5 h-5" />
                    {actionText || 'Upload POV'}
                </Link>
            )}
        </div>
    );
}
