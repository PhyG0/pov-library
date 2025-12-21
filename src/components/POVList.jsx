import React from 'react';
import { groupPOVsByDate } from '../utils/dateUtils';
import { POVCard } from './POVCard';

export function POVList({ povs, onDeletePOV, onPlayPOV, searchTerm, compact = false }) {
    const groupedPOVs = groupPOVsByDate(povs);
    const dateGroups = Object.entries(groupedPOVs).sort((a, b) =>
        new Date(b[1][0].date) - new Date(a[1][0].date)
    );

    if (dateGroups.length === 0) {
        return null;
    }

    return (
        <div className="space-y-8">
            {dateGroups.map(([date, datePOVs]) => (
                <div key={date} className="animate-slide-up">
                    {/* Date header */}
                    <div className={`flex items-center gap-3 mb-6 ${compact ? '' : 'border-b border-gray-200 dark:border-gray-700 pb-2'}`}>
                        {compact ? (
                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                {date}
                            </h4>
                        ) : (
                            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
                                {date}
                            </h2>
                        )}
                        {!compact && (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                                {datePOVs.length}
                            </span>
                        )}
                    </div>

                    {/* POV grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {datePOVs.map((pov) => (
                            <POVCard key={pov.id} pov={pov} onDelete={onDeletePOV} onPlay={onPlayPOV} searchTerm={searchTerm} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
