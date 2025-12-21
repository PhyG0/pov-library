import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Upload, Search, X, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Navigation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { filters, updateFilters } = useApp();
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const searchInputRef = useRef(null);
    const mobileSearchInputRef = useRef(null);

    const isActive = (path) => location.pathname === path;

    const handleSearchChange = (e) => {
        updateFilters({ search: e.target.value });
    };

    const handleClearSearch = () => {
        updateFilters({ search: '' });
        searchInputRef.current?.focus();
    };

    const handleClearMobileSearch = () => {
        updateFilters({ search: '' });
        mobileSearchInputRef.current?.focus();
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Focus search with "/" key
            if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // Clear search with Escape
            if (e.key === 'Escape' && filters.search) {
                updateFilters({ search: '' });
                searchInputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filters.search, updateFilters]);



    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/upload', label: 'Upload', icon: Upload },
    ];

    return (
        <>
            {/* Desktop Navigation - Top Bar */}
            <nav className="hidden md:block bg-white/80 dark:bg-gray-900/60 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/50 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and brand */}
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-primary-500 to-indigo-600 text-white p-1.5 rounded-lg shadow-lg shadow-primary-500/20">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white tracking-tight hover:opacity-80 transition-opacity">
                                Eclipse <span className="text-primary-600 dark:text-primary-400">POV</span>
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-lg mx-8">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search players, matches, or titles... (Press /)"
                                    value={filters.search}
                                    onChange={handleSearchChange}
                                    className="w-full bg-gray-100/50 dark:bg-gray-800/50 border-none ring-1 ring-gray-200 dark:ring-white/10 rounded-lg py-2 pl-9 pr-9 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:bg-white dark:focus:bg-gray-900 transition-all"
                                />
                                {filters.search && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Navigation links */}
                        <div className="flex items-center gap-1">
                            {navItems.map(({ path, label, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(path)
                                        ? 'bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-white'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation - Bottom Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-2xl border-t border-gray-200 dark:border-white/5 z-50">
                <div className="flex justify-around items-center h-16">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${isActive(path)
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive(path) ? 'scale-110' : ''}`} />
                            <span className="text-xs mt-1 font-medium">{label}</span>
                            {isActive(path) && (
                                <div className="absolute top-0 left-0 right-0 h-1 bg-primary-600 dark:bg-primary-400"></div>
                            )}
                        </Link>
                    ))}

                    {/* Mobile Search Button */}
                    <button
                        onClick={() => setShowMobileSearch(!showMobileSearch)}
                        className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${showMobileSearch
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        <Search className={`w-6 h-6 ${showMobileSearch ? 'scale-110' : ''}`} />
                        <span className="text-xs mt-1 font-medium">Search</span>
                        {showMobileSearch && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary-600 dark:bg-primary-400"></div>
                        )}
                    </button>
                </div>

                {/* Mobile Search Input */}
                {showMobileSearch && (
                    <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                ref={mobileSearchInputRef}
                                type="text"
                                value={filters.search || ''}
                                onChange={handleSearchChange}
                                placeholder="Search slots, players, maps..."
                                className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                autoFocus
                            />
                            {filters.search && (
                                <button
                                    onClick={handleClearMobileSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
