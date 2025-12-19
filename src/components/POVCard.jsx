import React, { useState } from 'react';
import { Play, Copy, Trash2, Check } from 'lucide-react';
import { getYouTubeThumbnail, getYouTubeWatchUrl } from '../utils/youtubeUtils';
import { formatDate } from '../utils/dateUtils';

export function POVCard({ pov, onDelete, onPlay }) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async (e) => {
        e.stopPropagation();
        const url = getYouTubeWatchUrl(pov.videoId);
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(pov);
    };

    const handleCardClick = () => {
        if (onPlay) {
            onPlay(pov);
        }
    };

    return (
        <div className="group bg-white dark:bg-dark-800 rounded-xl overflow-hidden shadow-md card-hover cursor-pointer transition-all">
            {/* Thumbnail with overlay */}
            <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img
                    src={getYouTubeThumbnail(pov.videoId, 'hqdefault')}
                    alt={pov.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onClick={handleCardClick}
                />

                {/* Play overlay */}
                <div
                    onClick={handleCardClick}
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center"
                >
                    <div className="w-16 h-16 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 flex items-center justify-center shadow-2xl">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-lg">
                    {pov.title}
                </h3>

                {/* Player name */}
                <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">
                    {pov.playerName}
                </p>

                {/* Date */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {formatDate(pov.date)}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={handleCopyLink}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                Copy Link
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleDelete}
                        className="px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                        aria-label="Delete POV"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
