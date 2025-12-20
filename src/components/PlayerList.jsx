import React from 'react';
import { PlayerCard } from './PlayerCard';

export function PlayerList({ players, slotId, matchId }) {
    if (!players || players.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
                <PlayerCard
                    key={player.playerName}
                    player={player}
                    slotId={slotId}
                    matchId={matchId}
                />
            ))}
        </div>
    );
}
