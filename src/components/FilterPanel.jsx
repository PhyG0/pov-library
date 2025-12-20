import React, { useState } from 'react';
import { Search, X, Calendar, Users, Filter, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayRange, getThisWeekRange, getThisMonthRange } from '../utils/dateUtils';
import { countActiveFilters } from '../utils/filterUtils';

export function FilterPanel() {
    const { filters, updateFilters, clearFilters, players } = useApp();
    const [isExpanded, setIsExpanded] = useState(false);
    const activeFilterCount = countActiveFilters(filters);

    const handleSearchChange = (e) => {
        updateFilters({ search: e.target.value });
    };

    const handlePlayerChange = (playerName) => {
        const currentPlayers = filters.players || [];
        const newPlayers = currentPlayers.includes(playerName)
            ? currentPlayers.filter(p => p !== playerName)
            : [...currentPlayers, playerName];
        updateFilters({ players: newPlayers });
    };

    const handleDateFromChange = (e) => {
        updateFilters({ dateFrom: e.target.value ? new Date(e.target.value) : null });
    };

    const handleDateToChange = (e) => {
        updateFilters({ dateTo: e.target.value ? new Date(e.target.value) : null });
    };

    const handleQuickFilter = (range) => {
        let dateRange;
        switch (range) {
            case 'today':
                dateRange = getTodayRange();
                break;
            case 'week':
                dateRange = getThisWeekRange();
                break;
            case 'month':
                dateRange = getThisMonthRange();
                break;
            default:
                return;
        }
        updateFilters({ dateFrom: dateRange.from, dateTo: dateRange.to });
    };

    return (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-4 mb-6 sticky top-4 z-10">
            {/* Search bar */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    id="pov-search-input"
                    type="text"
                    value={filters.search || ''}
                    onChange={handleSearchChange}
                    placeholder="Search by title or player name... (Ctrl+K)"
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                />
                {filters.search && (
                    <button
                        onClick={() => updateFilters({ search: '' })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Toggle filters button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-4"
            >
                <Filter className="w-4 h-4" />
                <span className="font-medium">
                    {isExpanded ? 'Hide' : 'Show'} Filters
                </span>
                {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {/* Expanded filters */}
            {isExpanded && (
                <div className="space-y-4 animate-slide-up">
                    {/* Quick filter buttons */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleQuickFilter('today')}
                            className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => handleQuickFilter('week')}
                            className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => handleQuickFilter('month')}
                            className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                        >
                            This Month
                        </button>
                    </div>

                    {/* Date range filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Calendar className="w-4 h-4" />
                                From Date
                            </label>
                            <input
                                type="date"
                                value={filters.dateFrom ? new Date(filters.dateFrom).toISOString().split('T')[0] : ''}
                                onChange={handleDateFromChange}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Calendar className="w-4 h-4" />
                                To Date
                            </label>
                            <input
                                type="date"
                                value={filters.dateTo ? new Date(filters.dateTo).toISOString().split('T')[0] : ''}
                                onChange={handleDateToChange}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Player filter */}
                    {players.length > 0 && (
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Users className="w-4 h-4" />
                                Filter by Player
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {players.map(player => (
                                    <label
                                        key={player}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters.players?.includes(player) || false}
                                            onChange={() => handlePlayerChange(player)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {player}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clear filters */}
                    {activeFilterCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium"
                        >
                            <X className="w-4 h-4" />
                            Clear All Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
