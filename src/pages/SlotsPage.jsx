import React, { useState, useEffect } from 'react';
import { Plus, Trophy } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getAllSlots, deleteSlot, createSlot } from '../services/slotService';
import { SlotList } from '../components/SlotList';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getTodayInputFormat } from '../utils/dateUtils';

export function SlotsPage() {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [sortBy, setSortBy] = useState('newest');

    const [newSlot, setNewSlot] = useState({
        name: '',
        description: '',
        date: getTodayInputFormat()
    });

    const navigate = useNavigate();

    // Load slots
    useEffect(() => {
        loadSlots();
    }, []);

    const loadSlots = async () => {
        setLoading(true);
        try {
            const data = await getAllSlots();
            setSlots(data);
        } catch (error) {
            console.error('Failed to load slots:', error);
            toast.error('Failed to load slots');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSlot = async (e) => {
        e.preventDefault();

        if (!newSlot.name.trim()) {
            toast.error('Please enter a slot name');
            return;
        }

        setIsCreating(true);
        try {
            await createSlot(newSlot);
            toast.success('Slot created successfully!');
            setShowCreateDialog(false);
            setNewSlot({ name: '', description: '', date: getTodayInputFormat() });
            await loadSlots();
        } catch (error) {
            console.error('Failed to create slot:', error);
            toast.error('Failed to create slot');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteClick = (slot) => {
        setSlotToDelete(slot);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!slotToDelete) return;

        setIsDeleting(true);
        try {
            await deleteSlot(slotToDelete.id);
            toast.success('Slot deleted successfully');
            setShowDeleteConfirm(false);
            await loadSlots();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete slot');
        } finally {
            setIsDeleting(false);
            setSlotToDelete(null);
        }
    };

    // Sort slots
    const sortedSlots = [...slots].sort((a, b) => {
        switch (sortBy) {
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'name-az':
                return a.name.localeCompare(b.name);
            case 'name-za':
                return b.name.localeCompare(a.name);
            case 'newest':
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    return (
        <div className="animate-fade-in relative">
            <Toaster position="top-right" />

            {/* Create Dialog */}
            {showCreateDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Create New Slot
                        </h3>
                        <form onSubmit={handleCreateSlot} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Slot Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newSlot.name}
                                    onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
                                    placeholder="e.g., 3k Semis, Finals"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                    disabled={isCreating}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newSlot.description}
                                    onChange={(e) => setNewSlot({ ...newSlot, description: e.target.value })}
                                    placeholder="Optional description"
                                    rows={3}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none"
                                    disabled={isCreating}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={newSlot.date}
                                    onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                    disabled={isCreating}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? 'Creating...' : 'Create Slot'}
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
                title="Delete Slot"
                message={`Are you sure you want to delete "${slotToDelete?.name}"? This will also delete all matches and POVs within this slot.`}
                confirmText="Delete"
                danger={true}
                isLoading={isDeleting}
            />

            {/* Hero Header */}
            {!loading && (
                <div className="mb-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 mb-2 flex items-center gap-3">
                                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-primary-400" />
                                Eclipse
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {slots.length} {slots.length === 1 ? 'slot' : 'slots'} organized for review
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateDialog(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto"
                        >
                            <Plus className="w-5 h-5" />
                            <span>New Slot</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-end gap-3 mb-6">
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name-az">Name (A-Z)</option>
                    <option value="name-za">Name (Z-A)</option>
                </select>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <LoadingSkeleton />
                ) : slots.length === 0 ? (
                    <EmptyState
                        message="No Slots Created Yet"
                        actionText="Create Your First Slot"
                        actionLink="#"
                        onActionClick={() => setShowCreateDialog(true)}
                    />
                ) : (
                    <SlotList
                        slots={sortedSlots}
                        onDeleteSlot={handleDeleteClick}
                    />
                )}
            </div>
        </div>
    );
}
