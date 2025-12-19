import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export function Layout() {
    useKeyboardShortcuts(); // Enable keyboard shortcuts globally

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
                <Outlet />
            </main>
        </div>
    );
}
