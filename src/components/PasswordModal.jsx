import React, { useState } from 'react';
import { Lock, X, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function PasswordModal({ isOpen, onClose, onSuccess, title = "Admin Access Required" }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const correctPassword = import.meta.env.VITE_CREATE_PASSWORD;

        // If no password is set in env, we might want to fail safe or allow. 
        // Assuming secure by default: if env is missing, deny.
        if (!correctPassword) {
            console.error('VITE_CREATE_PASSWORD is not set in environment');
            toast.error('System configuration error: Password not set');
            return;
        }

        if (password === correctPassword) {
            onSuccess();
            onClose();
            setPassword('');
            setError(false);
        } else {
            setError(true);
            toast.error('Incorrect password');
            // Shake effect could be added here
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-gray-800 transform transition-all scale-100">

                {/* Header */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                        <Lock className="w-4 h-4 text-primary-600" />
                        {title}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Enter Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all ${error
                                ? 'border-red-500 focus:ring-red-200'
                                : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500/20 focus:border-primary-500'
                                } dark:text-white`}
                            placeholder="••••••••"
                            autoFocus
                        />
                        {error && (
                            <p className="text-xs text-red-500 mt-1 animate-pulse">
                                Incorrect password, please try again.
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 active:scale-[0.98] transition-all"
                    >
                        <span>Confirm</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
