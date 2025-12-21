import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Calendar } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { getSlotById } from '../services/slotService';
import { getMatchesBySlot, createMatch, deleteMatch } from '../services/matchService';
import { MatchList } from '../components/MatchList';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmptyState } from '../components/EmptyState';
import { PubgLoader } from '../components/PubgLoader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PasswordModal } from '../components/PasswordModal';
import { formatDate } from '../utils/dateUtils';

export function SlotDetailPage() {
    const { slotId } = useParams();
    const navigate = useNavigate();

    const [slot, setSlot] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [matchToDelete, setMatchToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [passwordModal, setPasswordModal] = useState({
        isOpen: false,
        onSuccess: null
    });

    const [newMatch, setNewMatch] = useState({
        matchNumber: 1,
        description: ''
    });

    useEffect(() => {
        loadData();
    }, [slotId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [slotData, matchesData] = await Promise.all([
                getSlotById(slotId),
                getMatchesBySlot(slotId)
            ]);
            setSlot(slotData);
            setMatches(matchesData);

            // Set next match number
            if (matchesData.length > 0) {
                const maxMatchNumber = Math.max(...matchesData.map(m => m.matchNumber || 0));
                setNewMatch(prev => ({ ...prev, matchNumber: maxMatchNumber + 1 }));
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load slot details');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMatch = (e) => {
        e.preventDefault();

        // Open password modal
        setPasswordModal({
            isOpen: true,
            onSuccess: performCreateMatch
        });
    };

    const performCreateMatch = async () => {
        setIsCreating(true);
        try {
            await createMatch(slotId, newMatch);
            toast.success('Match created successfully!');
            setShowCreateDialog(false);
            await loadData();
        } catch (error) {
            console.error('Failed to create match:', error);
            toast.error('Failed to create match');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteClick = (match) => {
        setMatchToDelete(match);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!matchToDelete) return;

        setIsDeleting(true);
        try {
            await deleteMatch(slotId, matchToDelete.id);
            toast.success('Match deleted successfully');
            setShowDeleteConfirm(false);
            await loadData();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete match');
        } finally {
            setIsDeleting(false);
            setMatchToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <PubgLoader />
            </div>
        );
    }

    if (!slot) {
        return null;
    }

    return (
        <div className="animate-fade-in relative">
            <Toaster position="top-right" />

            {/* Breadcrumb */}
            <Breadcrumb items={[{ label: slot.name }]} />

            {/* Create Match Dialog */}
            {showCreateDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Create New Match
                        </h3>
                        <form onSubmit={handleCreateMatch} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Map <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newMatch.matchNumber}
                                    onChange={(e) => setNewMatch({ ...newMatch, matchNumber: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                    disabled={isCreating}
                                    autoFocus
                                >
                                    <option value="">Select a map</option>
                                    <option value="1">Erangle</option>
                                    <option value="2">Miramar</option>
                                    <option value="3">Rondo</option>
                                    <option value="4">Sanhok</option>
                                    <option value="5">Other</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? 'Creating...' : 'Create Match'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateDialog(false)}
                                    disabled={isCreating}
                                    className="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => !isDeleting && setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Match"
                message={`Are you sure you want to delete Match ${matchToDelete?.matchNumber}? This will also delete all POVs in this match.`}
                confirmText="Delete"
                danger={true}
                isLoading={isDeleting}
            />

            {/* Password Modal */}
            <PasswordModal
                isOpen={passwordModal.isOpen}
                onClose={() => setPasswordModal({ ...passwordModal, isOpen: false })}
                onSuccess={passwordModal.onSuccess}
            />

            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 mb-2">
                            {slot.name}
                        </h1>
                        {slot.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {slot.description}
                            </p>
                        )}
                        {slot.date && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(slot.date)}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowCreateDialog(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Match</span>
                    </button>
                </div>
            </div>

            {/* Matches List */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Matches</h2>
                {matches.length === 0 ? (
                    <EmptyState
                        message="No Matches Yet"
                        actionText="Create First Match"
                        actionLink="#"
                        onActionClick={() => setShowCreateDialog(true)}
                    />
                ) : (
                    <MatchList
                        matches={matches}
                        slotId={slotId}
                        onDeleteMatch={handleDeleteClick}
                    />
                )}
            </div>
        </div>
    );
}
