import { isDateInRange } from './dateUtils';

/**
 * Filter POVs by search query (searches in title and player name)
 */
export function filterBySearch(povs, searchQuery) {
    if (!searchQuery || searchQuery.trim() === '') return povs;

    const query = searchQuery.toLowerCase().trim();
    return povs.filter(pov =>
        pov.title?.toLowerCase().includes(query) ||
        pov.playerName?.toLowerCase().includes(query)
    );
}

/**
 * Filter POVs by player names
 */
export function filterByPlayers(povs, playerNames) {
    if (!playerNames || playerNames.length === 0) return povs;

    return povs.filter(pov => playerNames.includes(pov.playerName));
}

/**
 * Filter POVs by date range
 */
export function filterByDateRange(povs, fromDate, toDate) {
    if (!fromDate && !toDate) return povs;

    return povs.filter(pov => isDateInRange(pov.date, fromDate, toDate));
}

/**
 * Apply all filters to POVs
 */
export function applyFilters(povs, filters) {
    let filtered = [...povs];

    // Apply search filter
    if (filters.search) {
        filtered = filterBySearch(filtered, filters.search);
    }

    // Apply player filter
    if (filters.players && filters.players.length > 0) {
        filtered = filterByPlayers(filtered, filters.players);
    }

    // Apply date range filter
    if (filters.dateFrom || filters.dateTo) {
        filtered = filterByDateRange(filtered, filters.dateFrom, filters.dateTo);
    }

    return filtered;
}

/**
 * Sort POVs
 */
export function sortPOVs(povs, sortBy) {
    const sorted = [...povs];

    switch (sortBy) {
        case 'newest':
            return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));

        case 'oldest':
            return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));

        case 'player-az':
            return sorted.sort((a, b) => a.playerName.localeCompare(b.playerName));

        case 'player-za':
            return sorted.sort((a, b) => b.playerName.localeCompare(a.playerName));

        default:
            return sorted;
    }
}

/**
 * Count active filters
 */
export function countActiveFilters(filters) {
    let count = 0;

    if (filters.search && filters.search.trim() !== '') count++;
    if (filters.players && filters.players.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;

    return count;
}
