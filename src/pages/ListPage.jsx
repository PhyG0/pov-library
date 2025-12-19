import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { deletePOV } from '../services/povService';
import { POVList } from '../components/POVList';
import { FilterPanel } from '../components/FilterPanel';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { VideoModal } from '../components/VideoModal';

export function ListPage() {
    const {
        povs,
        getFilteredPOVs,
        loading,
        refreshData,
        sortBy,
        setSortBy
    } = useApp();

    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Video Modal State
    const [videoModal, setVideoModal] = useState({
        isOpen: false,
        videoId: null,
        title: ''
    });

    const filteredPOVs = getFilteredPOVs();

    // Handlers for single delete
    const handleDeleteClick = (pov) => {
        setDeleteId(pov.id);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            await deletePOV(deleteId);
            await refreshData();
            toast.success('POV deleted successfully');
            setShowDeleteConfirm(false); // Close AFTER success
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete POV');
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    // Handle Play POV
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

    return (
        <div className="animate-fade-in relative">
            <Toaster position="top-right" />

            {/* Video Modal */}
            <VideoModal
                isOpen={videoModal.isOpen}
                onClose={closeVideoModal}
                videoId={videoModal.videoId}
                title={videoModal.title}
                povId={videoModal.povId}
            />

            {/* Confirmation Dialogs */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => !isDeleting && setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="Delete POV"
                message="Are you sure you want to delete this POV? This action cannot be undone."
                confirmText="Delete"
                danger={true}
                isLoading={isDeleting}
            />

            {/* Hero Header */}
            {!loading && (
                <div className="mb-8 mt-4 animate-fade-in">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 mb-2">
                        POV Library
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {povs.length} {povs.length === 1 ? 'recording' : 'recordings'} curated for review
                    </p>
                </div>
            )}

            {/* Filters */}
            <FilterPanel />

            {/* Control Bar - Just Sorting */}
            <div className="flex flex-wrap items-center justify-end gap-4 mb-6">
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="player-az">Player Name (A-Z)</option>
                    <option value="player-za">Player Name (Z-A)</option>
                </select>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <LoadingSkeleton />
                ) : filteredPOVs.length === 0 ? (
                    povs.length === 0 ? (
                        <EmptyState
                            actionLink="/upload"
                            message="No POVs Uploaded Yet"
                        />
                    ) : (
                        <EmptyState
                            message="No matches found"
                            actionText="Clear Filters"
                            actionLink="#"
                        />
                    )
                ) : (
                    <POVList
                        povs={filteredPOVs}
                        onDeletePOV={handleDeleteClick}
                        onPlayPOV={handlePlayPOV}
                    />
                )}
            </div>
        </div>
    );
}
