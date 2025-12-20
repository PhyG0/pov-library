import React, { useState } from 'react';
import { Calendar, Trash2, ChevronRight, Trophy, X } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

export function SlotCard({ slot, onDelete }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const navigate = useNavigate();

    const handleCardClick = () => {
        if (!showDeleteDialog) {
            navigate(`/slots/${slot.id}`);
        }
    };

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
            if (onDelete) {
                await onDelete(slot);
            }
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

    return (
        <>
            <div
                onClick={handleCardClick}
                className="group relative bg-white dark:bg-dark-800 rounded-lg shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer hover:border-primary-400 dark:hover:border-primary-500"
            >
                {/* Gradient accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-indigo-500"></div>

                <div className="p-4 sm:p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                                    {slot.name}
                                </h3>
                            </div>
                            {slot.description && (
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                    {slot.description}
                                </p>
                            )}
                        </div>

                        {/* Delete button */}
                        {!showDeleteDialog && (
                            <button
                                onClick={handleDelete}
                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 sm:p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 flex-shrink-0"
                                title="Delete slot"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        <div className="px-2 sm:px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs sm:text-sm font-medium">
                            {slot.matchCount || 0} {slot.matchCount === 1 ? 'Match' : 'Matches'}
                        </div>
                        <div className="px-2 sm:px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs sm:text-sm font-medium">
                            {slot.povCount || 0} {slot.povCount === 1 ? 'POV' : 'POVs'}
                        </div>
                    </div>

                    {/* Date */}
                    {slot.date && (
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{formatDate(slot.date)}</span>
                        </div>
                    )}

                    {/* View more indicator */}
                    <div className="mt-3 flex items-center justify-end text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                    </div>
                </div>
            </div>

            {/* Delete Password Dialog */}
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
                                    Delete Slot
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    This will delete all matches and POVs in this slot.
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
