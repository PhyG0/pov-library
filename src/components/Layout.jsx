import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import HomeBg from '../assets/home-bg-pubg-v2.png';

export function Layout() {
    useKeyboardShortcuts(); // Enable keyboard shortcuts globally

    return (
        <div className="min-h-screen relative transition-colors">
            {/* Background Image Layer */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-gray-100/80 dark:from-gray-950/80 dark:to-black/80 z-10"></div>
                <img
                    src={HomeBg}
                    alt="Background"
                    className="w-full h-full object-cover object-center opacity-60 dark:opacity-50"
                />
            </div>

            <div className="relative z-10">
                <Navigation />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
