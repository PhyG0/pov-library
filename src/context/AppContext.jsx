import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllPOVs, getAllPlayers, getStatistics } from '../services/povService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { applyFilters, sortPOVs } from '../utils/filterUtils';

const AppContext = createContext();

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}

export function AppProvider({ children }) {
    // Theme state
    const [theme, setTheme] = useLocalStorage('theme', 'dark');

    // View mode state
    const [viewMode, setViewMode] = useLocalStorage('viewMode', 'grid');

    // POVs data
    const [povs, setPovs] = useState([]);
    const [players, setPlayers] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [filters, setFilters] = useState({
        search: '',
        players: [],
        dateFrom: null,
        dateTo: null
    });

    // Sort state
    const [sortBy, setSortBy] = useState('newest');

    // Bulk selection state
    const [selectedPOVs, setSelectedPOVs] = useState([]);

    // Load POVs on mount
    useEffect(() => {
        loadData();
    }, []);

    // Apply theme to body
    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    // Load all data
    const loadData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const [povsData, playersData, statsData] = await Promise.all([
                getAllPOVs(),
                getAllPlayers(),
                getStatistics()
            ]);
            setPovs(povsData);
            setPlayers(playersData);
            setStatistics(statsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Refresh data (after adding/deleting POVs)
    const refreshData = async () => {
        await loadData(false);
        setSelectedPOVs([]); // Clear selection after refresh
    };

    // Toggle theme
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Get filtered and sorted POVs
    const getFilteredPOVs = () => {
        let filtered = applyFilters(povs, filters);
        return sortPOVs(filtered, sortBy);
    };

    // Update filters
    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            search: '',
            players: [],
            dateFrom: null,
            dateTo: null
        });
    };

    // Toggle POV selection for bulk actions
    const togglePOVSelection = (povId) => {
        setSelectedPOVs(prev =>
            prev.includes(povId)
                ? prev.filter(id => id !== povId)
                : [...prev, povId]
        );
    };

    // Select all POVs
    const selectAllPOVs = (povIds) => {
        setSelectedPOVs(povIds);
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedPOVs([]);
    };

    const value = {
        // Theme
        theme,
        toggleTheme,

        // View mode
        viewMode,
        setViewMode,

        // Data
        povs,
        players,
        statistics,
        loading,
        refreshData,

        // Filtering & sorting
        filters,
        updateFilters,
        clearFilters,
        sortBy,
        setSortBy,
        getFilteredPOVs,

        // Bulk selection
        selectedPOVs,
        togglePOVSelection,
        selectAllPOVs,
        clearSelection
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
