import React, { useState } from 'react';
import { Play, Trash2, X } from 'lucide-react';
import { getYouTubeThumbnail } from '../utils/youtubeUtils';
import { getMapThumbnail } from '../utils/mapUtils';
import { formatDate } from '../utils/dateUtils';
import { HighlightText } from './HighlightText';

export function POVCard({ pov, onDelete, onPlay, searchTerm }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);



    const handleDelete = (e) => {
        e.stopPropagation();
        setShowDeleteDialog(true);
        setDeletePassword('');
        setDeleteError('');
    };

    const handleConfirmDelete = async (e) => {
        e.stopPropagation();
        const requiredPassword = import.meta.env.VITE_DELETE_PASSWORD || 'yes-delete';
        if (deletePassword === requiredPassword) {
            setIsDeleting(true);
            try {
                await onDelete(pov);
                setShowDeleteDialog(false);
            } catch (error) {
                setDeleteError('Failed to delete POV');
            } finally {
                setIsDeleting(false);
            }
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
                        onError={(e) => {
                            if (!e.target.dataset.fallback) {
                                e.target.dataset.fallback = "true";
                                // Fallback to map thumbnail
                                const matchNum = pov.matchNumber || 5;
                                e.target.src = getMapThumbnail(matchNum);
                            }
                        }}
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
                    <div className="flex items-start justify-between gap-2 mb-2">
                        {/* Title */}
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-lg">
                            <HighlightText text={pov.title} highlight={searchTerm} />
                        </h3>

                        <button
                            onClick={handleDelete}
                            className="p-1.5 -mr-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            aria-label="Delete POV"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Player name */}
                    <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">
                        <HighlightText text={pov.playerName} highlight={searchTerm} />
                    </p>

                    {/* Date */}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(pov.date)}
                    </p>
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
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}