import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Breadcrumb({ items }) {
    return (
        <nav className="flex items-center gap-2 text-sm mb-6">
            <Link
                to="/"
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
                <Home className="w-4 h-4" />
                <span>Slots</span>
            </Link>

            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    {item.href ? (
                        <Link
                            to={item.href}
                            className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 dark:text-white font-medium">
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}
