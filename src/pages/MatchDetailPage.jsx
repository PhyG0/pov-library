import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { getSlotById } from '../services/slotService';
import { getMatchById } from '../services/matchService';
import { getPOVsByMatch } from '../services/povService';
import { PlayerList } from '../components/PlayerList';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { getMapName } from '../utils/mapUtils';

export function MatchDetailPage() {
    const { slotId, matchId } = useParams();
    const navigate = useNavigate();

    const [slot, setSlot] = useState(null);
    const [match, setMatch] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [slotId, matchId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [slotData, matchData, povsData] = await Promise.all([
                getSlotById(slotId),
                getMatchById(slotId, matchId),
                getPOVsByMatch(slotId, matchId)
            ]);
            setSlot(slotData);
            setMatch(matchData);

            // Group POVs by player
            const playerGroups = povsData.reduce((groups, pov) => {
                const playerName = pov.playerName;
                if (!groups[playerName]) {
                    groups[playerName] = [];
                }
                groups[playerName].push(pov);
                return groups;
            }, {});

            // Convert to array of player objects
            const playerList = Object.keys(playerGroups).map(playerName => ({
                playerName,
                povCount: playerGroups[playerName].length,
                povs: playerGroups[playerName]
            }));

            // Sort by player name
            playerList.sort((a, b) => a.playerName.localeCompare(b.playerName));

            setPlayers(playerList);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load match details');
            navigate(`/slots/${slotId}`);
        } finally {
            setLoading(false);
        }
    };

    const mapName = match ? getMapName(match.matchNumber) : '';

    if (loading) {
        return (
            <div className="animate-fade-in">
                <LoadingSkeleton />
            </div>
        );
    }

    if (!slot || !match) {
        return null;
    }

    return (
        <div className="animate-fade-in relative">
            <Toaster position="top-right" />

            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: slot.name, href: `/slots/${slotId}` },
                    { label: mapName }
                ]}
            />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 mb-2">
                            {mapName}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {players.length} {players.length === 1 ? 'player' : 'players'} · {players.reduce((sum, p) => sum + p.povCount, 0)} total POVs
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/upload', { state: { slotId, matchId } })}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Upload POV</span>
                    </button>
                </div>
            </div>

            {/* Players List */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Players</h2>
                {players.length === 0 ? (
                    <EmptyState
                        message="No POVs Uploaded Yet"
                        actionText="Upload First POV"
                        onActionClick={() => navigate('/upload', { state: { slotId, matchId } })}
                    />
                ) : (
                    <PlayerList
                        players={players}
                        slotId={slotId}
                        matchId={matchId}
                    />
                )}
            </div>
        </div>
    );
}
