import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Upload, Search, X } from 'lucide-react';
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
            <nav className="hidden md:block bg-white dark:bg-dark-800 shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and brand */}
                        <div className="flex items-center gap-3">
                            <img src="/images/logo.png" alt="Eclipse POV Logo" className="w-10 h-10 object-contain" />
                            <Link to="/" className="text-2xl font-bold gradient-text hover:opacity-80 transition-opacity">
                                Eclipse POV
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-lg mx-8">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search players, matches, or titles... (Press / to focus)"
                                    value={filters.search}
                                    onChange={handleSearchChange}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-full py-2 pl-10 pr-10 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                                />
                                {filters.search && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Navigation links */}
                        <div className="flex items-center gap-2">
                            {navItems.map(({ path, label, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isActive(path)
                                        ? 'bg-primary-600 text-white shadow-lg'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation - Bottom Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-800 shadow-2xl border-t border-gray-200 dark:border-gray-700 z-50">
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
