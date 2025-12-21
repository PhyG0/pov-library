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
            className="group relative bg-white/90 dark:bg-gray-900/60 backdrop-blur-md rounded-lg shadow-sm hover:shadow-xl border border-white/20 dark:border-white/10 transition-all duration-300 cursor-pointer hover:border-primary-400/50 dark:hover:border-primary-500/50 overflow-hidden"
        >
            <div className="p-3 flex items-center justify-between">
                {/* Left: Icon & Name */}
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500/20 group-hover:ring-primary-500/40 transition-all">
                        <User className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {player.playerName}
                    </h4>
                </div>

                {/* Right: Stats Badge & Arrow */}
                <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 group-hover:border-primary-500/30 transition-colors">
                        <Video className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {player.povCount}
                        </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors transform group-hover:translate-x-0.5" />
                </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
}
