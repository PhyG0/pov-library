import React, { useState } from 'react';
import { Play, Copy, Trash2, Check, X } from 'lucide-react';
import { getYouTubeThumbnail, getYouTubeWatchUrl } from '../utils/youtubeUtils';
import { formatDate } from '../utils/dateUtils';

export function POVCard({ pov, onDelete, onPlay }) {
    const [copied, setCopied] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const handleCopyLink = async (e) => {
        e.stopPropagation();
        const url = getYouTubeWatchUrl(pov.videoId);
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setShowDeleteDialog(true);
        setDeletePassword('');
        setDeleteError('');
    };

    const handleConfirmDelete = (e) => {
        e.stopPropagation();
        if (deletePassword === 'yes-delete') {
            onDelete(pov);
            setShowDeleteDialog(false);
        } else {
            setDeleteError('Incorrect password.');
        }
    };

    const handleCancelDelete = (e) => {
        e.stopPropagation();
        setShowDeleteDialog(false);
        setDeletePassword('');
        setDeleteError('');
    };

    const handleCardClick = () => {
        if (onPlay && !showDeleteDialog) {
            onPlay(pov);
        }
    };

    return (
        <>
            <div className="group bg-white dark:bg-dark-800 rounded-xl overflow-hidden shadow-md card-hover cursor-pointer transition-all">
                {/* Thumbnail with overlay */}
                <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                        src={getYouTubeThumbnail(pov.videoId, 'hqdefault')}
                        alt={pov.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onClick={handleCardClick}
                    />

                    {/* Play overlay */}
                    <div
                        onClick={handleCardClick}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 flex items-center justify-center shadow-2xl">
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-lg">
                        {pov.title}
                    </h3>

                    {/* Player name */}
                    <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">
                        {pov.playerName}
                    </p>

                    {/* Date */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {formatDate(pov.date)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopyLink}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copy Link
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDelete}
                            className="px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                            aria-label="Delete POV"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={handleCancelDelete}
                >
                    <div
                        className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Confirm Delete
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    This action cannot be undone.
                                </p>
                            </div>
                            <button
                                onClick={handleCancelDelete}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Enter password to confirm:
                            </label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => {
                                    setDeletePassword(e.target.value);
                                    setDeleteError('');
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                                placeholder="Enter password"
                                autoFocus
                            />
                            {deleteError && (
                                <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                                    {deleteError}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}