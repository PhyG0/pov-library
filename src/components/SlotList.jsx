import React from 'react';
import { SlotCard } from './SlotCard';

export function SlotList({ slots, onDeleteSlot }) {
    if (!slots || slots.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map(slot => (
                <SlotCard
                    key={slot.id}
                    slot={slot}
                    onDelete={onDeleteSlot}
                />
            ))}
        </div>
    );
}
