import React, { useState, useEffect } from 'react';
import { extractYouTubeId, getYouTubeThumbnail } from '../utils/youtubeUtils';

import { getMapThumbnail } from '../utils/mapUtils';

export function YouTubeThumbnailPreview({ url, matchNumber }) {
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!url || url.trim() === '') {
            setThumbnailUrl(null);
            setError(false);
            return;
        }

        setLoading(true);
        setError(false);

        const videoId = extractYouTubeId(url);

        if (videoId) {
            const thumbnail = getYouTubeThumbnail(videoId, 'hqdefault');
            setThumbnailUrl(thumbnail);
            setLoading(false);
        } else {
            setThumbnailUrl(null);
            setError(true);
            setLoading(false);
        }
    }, [url]);

    if (!url || url.trim() === '') {
        return null;
    }

    if (loading) {
        return (
            <div className="mt-4 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 animate-pulse">
                <div className="aspect-video w-full"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">
                    Invalid YouTube URL. Please enter a valid YouTube link.
                </p>
            </div>
        );
    }

    if (thumbnailUrl) {
        return (
            <div className="mt-4 rounded-xl overflow-hidden shadow-lg animate-slide-up">
                <img
                    src={thumbnailUrl}
                    alt="YouTube thumbnail preview"
                    width="100%"
                    height="100%"
                    className="w-full aspect-video object-cover"
                    onError={(e) => {
                        if (!e.target.dataset.fallback && matchNumber) {
                            e.target.dataset.fallback = "true";
                            e.target.src = getMapThumbnail(matchNumber);
                        } else {
                            setError(true);
                        }
                    }}
                />
                <div className="bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800 px-4 py-2">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                        ✓ Valid YouTube URL
                    </p>
                </div>
            </div>
        );
    }

    return null;
}
