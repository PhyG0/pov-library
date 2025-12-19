import React from 'react';
import { BarChart3, Users, Calendar, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function StatisticsDashboard() {
    const { statistics, loading } = useApp();

    if (loading || !statistics) {
        return null;
    }

    const { total, playerCounts, mostActiveDays } = statistics;
    const topPlayers = Object.entries(playerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Total POVs */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-8 h-8 opacity-80" />
                    <span className="text-3xl font-bold">{total}</span>
                </div>
                <p className="text-primary-100 font-medium">Total POVs</p>
            </div>

            {/* Top Player */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 opacity-80" />
                    <span className="text-3xl font-bold">
                        {topPlayers.length > 0 ? topPlayers[0][1] : 0}
                    </span>
                </div>
                <p className="text-purple-100 font-medium">
                    {topPlayers.length > 0 ? topPlayers[0][0] : 'No players yet'}
                </p>
            </div>

            {/* Most Active Day */}
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-8 h-8 opacity-80" />
                    <span className="text-3xl font-bold">
                        {mostActiveDays.length > 0 ? mostActiveDays[0].count : 0}
                    </span>
                </div>
                <p className="text-pink-100 font-medium">
                    {mostActiveDays.length > 0
                        ? `Most active: ${mostActiveDays[0].date.split('/')[0]}/${mostActiveDays[0].date.split('/')[1]}`
                        : 'No activity yet'}
                </p>
            </div>
        </div>
    );
}
