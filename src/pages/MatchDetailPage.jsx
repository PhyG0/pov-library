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
import { PubgLoader } from '../components/PubgLoader';
import { getMapName, getMapImage } from '../utils/mapUtils';

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
                <PubgLoader />
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
            {/* Header */}
            <div
                className="mb-8 relative rounded-2xl overflow-hidden shadow-2xl group"
            >
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                    style={{
                        backgroundImage: `url(${match ? getMapImage(match.matchNumber) : ''})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

                <div className="relative z-10 p-6 sm:p-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">
                                {mapName}
                            </h1>
                            <div className="flex items-center gap-3 text-gray-300">
                                <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10">
                                    {players.length} {players.length === 1 ? 'Player' : 'Players'}
                                </span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full" />
                                <span className="text-sm font-medium">
                                    {players.reduce((sum, p) => sum + p.povCount, 0)} Total POVs
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/upload', { state: { slotId, matchId } })}
                            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-primary-600/30 hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Upload POV</span>
                        </button>
                    </div>
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
