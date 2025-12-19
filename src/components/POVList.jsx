import React, { useState } from 'react';
import { groupPOVsByDate } from '../utils/dateUtils';
import { POVCard } from './POVCard';
import { User, ChevronDown, ChevronRight } from 'lucide-react';

function PlayerGroup({ player, povs, onDeletePOV, onPlayPOV }) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="pl-0 md:pl-4 border-l-0 md:border-l-2 border-transparent md:border-primary-100 dark:md:border-primary-900/30">
            {/* Player Sub-header (Clickable) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 mb-4 w-full text-left group hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors -ml-2"
            >
                <div className="p-1.5 bg-primary-100 dark:bg-primary-900/50 rounded-lg text-primary-600 dark:text-primary-400">
                    <User className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex-1">
                    {player}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md mr-2">
                    {povs.length}
                </span>
                {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                )}
            </button>

            {/* POV grid */}
            {isExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
                    {povs.map((pov) => (
                        <POVCard key={pov.id} pov={pov} onDelete={onDeletePOV} onPlay={onPlayPOV} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function POVList({ povs, onDeletePOV, onPlayPOV }) {
    const groupedPOVs = groupPOVsByDate(povs);
    const dateGroups = Object.entries(groupedPOVs).sort((a, b) =>
        new Date(b[1][0].date) - new Date(a[1][0].date)
    );

    if (dateGroups.length === 0) {
        return null;
    }

    // Helper to group by player
    const groupByPlayer = (list) => {
        const groups = {};
        list.forEach(pov => {
            const player = pov.playerName || 'Unknown Player';
            if (!groups[player]) groups[player] = [];
            groups[player].push(pov);
        });
        return groups;
    };

    return (
        <div className="space-y-12">
            {dateGroups.map(([date, datePOVs]) => {
                const playerGroups = groupByPlayer(datePOVs);
                const players = Object.keys(playerGroups).sort();

                return (
                    <div key={date} className="animate-slide-up">
                        {/* Date header */}
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
                                {date}
                            </h2>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                                {datePOVs.length} Total
                            </span>
                        </div>

                        {/* Player Groups */}
                        <div className="space-y-8">
                            {players.map(player => (
                                <PlayerGroup
                                    key={player}
                                    player={player}
                                    povs={playerGroups[player]}
                                    onDeletePOV={onDeletePOV}
                                    onPlayPOV={onPlayPOV}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
