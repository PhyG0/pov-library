import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Search } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAllSlots, deleteSlot, createSlot } from '../services/slotService';
import { deletePOV } from '../services/povService';
import { getMapName } from '../utils/mapUtils';
import { SlotList } from '../components/SlotList';
import { POVList } from '../components/POVList';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { PubgLoader } from '../components/PubgLoader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { VideoModal } from '../components/VideoModal';
import { PasswordModal } from '../components/PasswordModal';
import { getTodayInputFormat } from '../utils/dateUtils';
import { SEO } from '../components/SEO';

export function SlotsPage() {
    const { filters, povs, refreshData } = useApp();
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

    // Video Modal State
    const [videoModal, setVideoModal] = useState({
        isOpen: false,
        videoId: null,
        title: '',
        povId: null
    });

    // Password Modal State
    const [passwordModal, setPasswordModal] = useState({
        isOpen: false,
        onSuccess: null
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

    const handleCreateSlot = (e) => {
        e.preventDefault();

        if (!newSlot.name.trim()) {
            toast.error('Please enter a slot name');
            return;
        }

        // Open password modal
        setPasswordModal({
            isOpen: true,
            onSuccess: performCreateSlot
        });
    };

    const performCreateSlot = async () => {
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

    // Filter slots based on search
    const filteredSlots = slots.filter(slot => {
        if (!filters.search) return true;

        const searchLower = filters.search.toLowerCase();

        // Match slot name
        if (slot.name.toLowerCase().includes(searchLower)) return true;

        // Match POVs inside this slot (by title, player name, or map name)
        const matchingPovs = povs.filter(pov => {
            if (pov.slotId !== slot.id) return false;

            const matchesText = pov.title?.toLowerCase().includes(searchLower) ||
                pov.playerName?.toLowerCase().includes(searchLower);

            const mapName = pov.matchNumber ? getMapName(pov.matchNumber).toLowerCase() : '';
            const matchesMap = mapName.includes(searchLower);

            return matchesText || matchesMap;
        });

        return matchingPovs.length > 0;
    });

    // Filter individual POVs for global search results
    const matchingPOVs = filters.search ? povs.filter(pov => {
        const searchLower = filters.search.toLowerCase();

        // Match by title or player name
        const matchesText = pov.title?.toLowerCase().includes(searchLower) ||
            pov.playerName?.toLowerCase().includes(searchLower);

        // Match by map name (derived from matchNumber)
        const mapName = pov.matchNumber ? getMapName(pov.matchNumber).toLowerCase() : '';
        const matchesMap = mapName.includes(searchLower);

        return matchesText || matchesMap;
    }) : [];

    // Group matching POVs by slot
    const povsGroupedBySlot = matchingPOVs.reduce((acc, pov) => {
        if (!pov.slotId) return acc;

        if (!acc[pov.slotId]) {
            const slot = slots.find(s => s.id === pov.slotId);
            acc[pov.slotId] = {
                slotName: slot?.name || 'Unknown Slot',
                povs: []
            };
        }
        acc[pov.slotId].povs.push(pov);
        return acc;
    }, {});

    // POV action handlers
    const handleDeletePOV = async (pov) => {
        try {
            await deletePOV(pov.slotId, pov.matchId, pov.id);
            await refreshData();
            toast.success('POV deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete POV');
            throw error; // Re-throw so POVCard can handle it
        }
    };

    const handlePlayPOV = (pov) => {
        setVideoModal({
            isOpen: true,
            videoId: pov.videoId,
            title: pov.title,
            povId: pov.id
        });
    };

    const closeVideoModal = () => {
        setVideoModal(prev => ({ ...prev, isOpen: false }));
    };

    // Sort slots
    const sortedSlots = [...filteredSlots].sort((a, b) => {
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
        <div className="animate-fade-in relative min-h-[calc(100vh-64px)] overflow-hidden">
            <div className="relative z-10">
                <SEO
                    title="Home"
                    description="View and manage your team's gameplay POVs and match recordings."
                />
                <Toaster position="top-right" />

                {/* Video Modal */}
                <VideoModal
                    isOpen={videoModal.isOpen}
                    onClose={closeVideoModal}
                    videoId={videoModal.videoId}
                    title={videoModal.title}
                    povId={videoModal.povId}
                />

                {/* Password Modal */}
                <PasswordModal
                    isOpen={passwordModal.isOpen}
                    onClose={() => setPasswordModal({ ...passwordModal, isOpen: false })}
                    onSuccess={passwordModal.onSuccess}
                />

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
                        <PubgLoader />
                    ) : slots.length === 0 ? (
                        <EmptyState
                            message="No Slots Created Yet"
                            actionText="Create Your First Slot"
                            actionLink="#"
                            onActionClick={() => setShowCreateDialog(true)}
                        />
                    ) : (
                        <>
                            {/* Search Results Summary */}
                            {filters.search && (sortedSlots.length > 0 || matchingPOVs.length > 0) && (
                                <div className="mb-6 px-4 py-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                                    <p className="text-sm text-primary-800 dark:text-primary-200">
                                        <span className="font-semibold">Search results for "{filters.search}":</span>
                                        {' '}Found {sortedSlots.length} {sortedSlots.length === 1 ? 'slot' : 'slots'}
                                        {matchingPOVs.length > 0 && ` and ${matchingPOVs.length} individual ${matchingPOVs.length === 1 ? 'POV' : 'POVs'}`}
                                    </p>
                                </div>
                            )}

                            {/* Matching Slots */}
                            {sortedSlots.length > 0 ? (
                                <SlotList
                                    slots={sortedSlots}
                                    onDeleteSlot={handleDeleteClick}
                                />
                            ) : filters.search ? (
                                // Empty search state
                                matchingPOVs.length === 0 && (
                                    <div className="text-center py-16">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                                            <Search className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            No results found
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            No slots or POVs match "{filters.search}"
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                            Try different keywords or check your spelling
                                        </p>
                                    </div>
                                )
                            ) : null}

                            {/* Individual POV Results */}
                            {filters.search && matchingPOVs.length > 0 && (
                                <div className="mt-12">
                                    <div className="flex items-center gap-3 mb-6">
                                        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">
                                            Individual POV Results
                                        </h2>
                                        <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                                            {matchingPOVs.length} {matchingPOVs.length === 1 ? 'POV' : 'POVs'}
                                        </span>
                                    </div>

                                    {/* Group POVs by Slot */}
                                    {Object.entries(povsGroupedBySlot).map(([slotId, { slotName, povs: slotPOVs }]) => (
                                        <div key={slotId} className="mb-8">
                                            <div className="mb-4">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                                    <span className="text-primary-500">📦</span>
                                                    {slotName}
                                                </h3>
                                            </div>
                                            <POVList
                                                povs={slotPOVs}
                                                onDeletePOV={handleDeletePOV}
                                                onPlayPOV={handlePlayPOV}
                                                searchTerm={filters.search}
                                                compact={true}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
