import React from 'react';
import { Clock } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { getYouTubeThumbnail } from '../utils/youtubeUtils';

export function RecentActivity({ povs }) {
    const recentPOVs = povs.slice(0, 5);

    if (recentPOVs.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Recent Activity
                </h3>
            </div>

            <div className="space-y-3">
                {recentPOVs.map((pov) => (
                    <div
                        key={pov.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${pov.videoId}`, '_blank')}
                    >
                        {/* Thumbnail */}
                        <img
                            src={getYouTubeThumbnail(pov.videoId, 'default')}
                            alt={pov.title}
                            className="w-20 h-14 object-cover rounded"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                                {pov.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {pov.playerName} • {formatDate(pov.date, 'MMM dd')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
