import React, { useState } from 'react';
import { Trash2, ChevronRight, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMapName, getMapImage } from '../utils/mapUtils';

export function MatchCard({ match, slotId, onDelete }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const navigate = useNavigate();

    const handleCardClick = () => {
        if (!showDeleteDialog) {
            navigate(`/slots/${slotId}/matches/${match.id}`);
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
                await onDelete(match);
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

    const mapName = getMapName(match.matchNumber);
    const mapImage = getMapImage(match.matchNumber);

    return (
        <>
            <div
                onClick={handleCardClick}
                className="group relative rounded-lg shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 overflow-hidden"
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url(${mapImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className="p-4 sm:p-5 relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-base sm:text-lg font-bold text-white truncate shadow-sm">
                                    {mapName}
                                </h4>
                            </div>
                        </div>

                        {/* Delete button */}
                        {!showDeleteDialog && (
                            <button
                                onClick={handleDelete}
                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 sm:p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 flex-shrink-0"
                                title="Delete match"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="font-medium text-primary-300">
                                {match.povCount || 0} POV{match.povCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                        {match.players && match.players.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">{match.players.join(', ')}</span>
                            </div>
                        )}
                    </div>

                    {/* View indicator */}
                    <div className="mt-3 flex items-center justify-end text-primary-300 text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>View Players</span>
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
                                    Delete Match
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    This will delete all POVs in this match.
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
