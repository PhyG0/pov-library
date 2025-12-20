import React from 'react';

export function PubgLoader() {
    return (
        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
            <div className="relative">
                {/* Smoke Effect */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-8 h-32 flex justify-center overflow-visible pointer-events-none">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-[smoke_2s_ease-out_infinite] opacity-0 absolute bottom-0"></div>
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-[smoke_2.5s_ease-out_infinite_0.2s] opacity-0 absolute bottom-0"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-[smoke_1.8s_ease-out_infinite_0.4s] opacity-0 absolute bottom-0"></div>
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-[smoke_2.2s_ease-out_infinite_0.6s] opacity-0 absolute bottom-0"></div>
                </div>

                {/* Airdrop Crate */}
                <div className="relative z-10 w-24 h-24 bg-red-600 rounded-lg shadow-2xl transform transition-transform hover:scale-105 duration-300">
                    {/* Blue Tarp Top */}
                    <div className="absolute top-0 inset-x-0 h-8 bg-blue-700 rounded-t-lg opacity-90"></div>

                    {/* Straps */}
                    <div className="absolute top-0 bottom-0 left-6 w-2 bg-black/20"></div>
                    <div className="absolute top-0 bottom-0 right-6 w-2 bg-black/20"></div>
                    <div className="absolute top-10 inset-x-0 h-2 bg-black/20"></div>

                    {/* Parachute strings (visual only) */}
                    <div className="absolute bottom-full left-0 w-px h-12 bg-gray-400 origin-bottom -rotate-12"></div>
                    <div className="absolute bottom-full right-0 w-px h-12 bg-gray-400 origin-bottom rotate-12"></div>
                </div>

                {/* Shadow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-20 h-2 bg-black/20 rounded-full blur-sm mt-4"></div>
            </div>

            {/* Loading Text */}
            <div className="mt-12 text-center">
                <h3 className="text-2xl font-black uppercase tracking-widest text-gray-900 dark:text-white mb-2">
                    Loading Matches
                </h3>
                <div className="flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
            </div>

        </div>
    );
}
