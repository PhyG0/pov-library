import React from 'react';
import { User, Video, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PlayerCard({ player, slotId, matchId }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/slots/${slotId}/matches/${matchId}/players/${encodeURIComponent(player.playerName)}`);
    };

    return (
        <div
            onClick={handleClick}
            className="group relative bg-white dark:bg-dark-800 rounded-lg shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer hover:border-primary-400 dark:hover:border-primary-500"
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full">
                            <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {player.playerName}
                            </h4>
                        </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Video className="w-4 h-4" />
                    <span>{player.povCount} {player.povCount === 1 ? 'POV' : 'POVs'}</span>
                </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
        </div>
    );
}
