import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Inbox } from 'lucide-react';

export function EmptyState({ message, actionText, actionLink, onActionClick }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-48 h-48 mb-6 relative group">
                <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                <img
                    src="/images/empty-state.png"
                    alt="No POVs Found"
                    className="w-full h-full object-contain relative z-10 drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                />
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
