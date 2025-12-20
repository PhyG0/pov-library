import React from 'react';
import { MatchCard } from './MatchCard';

export function MatchList({ matches, slotId, onDeleteMatch }) {
    if (!matches || matches.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(match => (
                <MatchCard
                    key={match.id}
                    match={match}
                    slotId={slotId}
                    onDelete={onDeleteMatch}
                />
            ))}
        </div>
    );
}
