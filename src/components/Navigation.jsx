import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload } from 'lucide-react';

export function Navigation() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

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
                </div>
            </nav>
        </>
    );
}
