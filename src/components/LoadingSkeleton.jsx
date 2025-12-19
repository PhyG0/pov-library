import React from 'react';

export function LoadingSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-white dark:bg-dark-800 rounded-xl overflow-hidden shadow-md animate-pulse"
                >
                    {/* Thumbnail skeleton */}
                    <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 animate-shimmer"></div>

                    {/* Content skeleton */}
                    <div className="p-4 space-y-3">
                        {/* Title */}
                        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded animate-shimmer"></div>

                        {/* Player name */}
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3 animate-shimmer"></div>

                        {/* Date */}
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 animate-shimmer"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
