import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { getSlotById } from '../services/slotService';
import { getMatchById } from '../services/matchService';
import { getPOVsByMatch, deletePOV } from '../services/povService';
import { POVList } from '../components/POVList';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmptyState } from '../components/EmptyState';
import { PubgLoader } from '../components/PubgLoader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { VideoModal } from '../components/VideoModal';
import { getMapName } from '../utils/mapUtils';
import { formatDate } from '../utils/dateUtils';
import { SEO } from '../components/SEO';

export function PlayerPOVPage() {
    const { slotId, matchId, playerName } = useParams();
    const navigate = useNavigate();

    const [slot, setSlot] = useState(null);
    const [match, setMatch] = useState(null);
    const [povs, setPovs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [povToDelete, setPovToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Video Modal State
    const [videoModal, setVideoModal] = useState({
        isOpen: false,
        videoId: null,
        title: '',
        povId: null
    });

    useEffect(() => {
        loadData();
    }, [slotId, matchId, playerName]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [slotData, matchData, allPovs] = await Promise.all([
                getSlotById(slotId),
                getMatchById(slotId, matchId),
                getPOVsByMatch(slotId, matchId)
            ]);

            setSlot(slotData);
            setMatch(matchData);

            // Filter POVs for this specific player
            const playerPovs = allPovs.filter(pov => pov.playerName === decodeURIComponent(playerName));
            setPovs(playerPovs);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load player POVs');
            navigate(`/slots/${slotId}/matches/${matchId}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (pov) => {
        setPovToDelete(pov);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!povToDelete) return;

        setIsDeleting(true);
        try {
            await deletePOV(slotId, matchId, povToDelete.id);
            toast.success('POV deleted successfully');
            setShowDeleteConfirm(false);
            await loadData();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete POV');
        } finally {
            setIsDeleting(false);
            setPovToDelete(null);
        }
    };

    const handlePlayPOV = (pov) => {
        setVideoModal({
            isOpen: true,
            videoId: pov.videoId,
            title: pov.title,
            povId: pov.id,
            slotId: slotId,
            matchId: matchId
        });
    };

    const closeVideoModal = () => {
        setVideoModal(prev => ({ ...prev, isOpen: false }));
    };

    const mapName = match ? getMapName(match.matchNumber) : '';
    const decodedPlayerName = decodeURIComponent(playerName);

    if (loading) {
        return (
            <div className="animate-fade-in">
                <PubgLoader />
            </div>
        );
    }

    if (!slot || !match) {
        return null;
    }

    return (
        <div className="animate-fade-in relative">
            <SEO
                title={`${decodedPlayerName} - ${slot.name} (${formatDate(slot.date)})`}
                description={`Watch ${decodedPlayerName}'s POVs from ${slot.name} - ${formatDate(slot.date)}`}
            />
            <Toaster position="top-right" />

            {/* Video Modal */}
            <VideoModal
                isOpen={videoModal.isOpen}
                onClose={closeVideoModal}
                videoId={videoModal.videoId}
                title={videoModal.title}
                povId={videoModal.povId}
                slotId={videoModal.slotId}
                matchId={videoModal.matchId}
            />

            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: slot.name, href: `/slots/${slotId}` },
                    { label: mapName, href: `/slots/${slotId}/matches/${matchId}` },
                    { label: decodedPlayerName }
                ]}
            />

            {/* Delete Confirmation */}
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

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 mb-2">
                            {decodedPlayerName}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {povs.length} {povs.length === 1 ? 'POV' : 'POVs'} in {mapName}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/upload', { state: { slotId, matchId, playerName: decodedPlayerName } })}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Upload POV</span>
                    </button>
                </div>
            </div>

            {/* POVs List */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">POVs</h2>
                {povs.length === 0 ? (
                    <EmptyState
                        message={`No POVs from ${decodedPlayerName} yet`}
                        actionText="Upload First POV"
                        onActionClick={() => navigate('/upload', { state: { slotId, matchId, playerName: decodedPlayerName } })}
                    />
                ) : (
                    <POVList
                        povs={povs}
                        onDeletePOV={handleDeleteClick}
                        onPlayPOV={handlePlayPOV}
                    />
                )}
            </div>
        </div>
    );
}
