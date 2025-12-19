import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Calendar, ArrowRight, Check } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { createPOV } from '../services/povService';
import { YouTubeThumbnailPreview } from '../components/YouTubeThumbnailPreview';
import { getTodayInputFormat } from '../utils/dateUtils';
import { isValidYouTubeUrl, extractYouTubeId } from '../utils/youtubeUtils';

export function UploadPage() {
    const navigate = useNavigate();
    const { players, refreshData } = useApp();

    const [formData, setFormData] = useState({
        playerName: '',
        title: '',
        date: getTodayInputFormat(),
        youtubeUrl: ''
    });

    const [isNewPlayer, setIsNewPlayer] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setShowSuccess(false);
    };

    const handlePlayerSelect = (e) => {
        const value = e.target.value;
        if (value === 'new') {
            setIsNewPlayer(true);
            setFormData(prev => ({ ...prev, playerName: '' }));
        } else {
            setIsNewPlayer(false);
            setFormData(prev => ({ ...prev, playerName: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error('Please enter a game title');
            return;
        }

        if (isNewPlayer && !newPlayerName.trim()) {
            toast.error('Please enter a player name');
            return;
        }

        if (!isNewPlayer && !formData.playerName) {
            toast.error('Please select a player');
            return;
        }

        if (!isValidYouTubeUrl(formData.youtubeUrl)) {
            toast.error('Please enter a valid YouTube URL');
            return;
        }

        setIsSubmitting(true);

        try {
            const finalPlayerName = isNewPlayer ? newPlayerName.trim() : formData.playerName;
            const videoId = extractYouTubeId(formData.youtubeUrl);

            const newPOV = {
                title: formData.title.trim(),
                playerName: finalPlayerName,
                date: new Date(formData.date).toISOString(),
                videoId,
                youtubeUrl: formData.youtubeUrl,
            };

            await createPOV(newPOV);
            await refreshData();

            toast.success('POV uploaded successfully!');
            setShowSuccess(true);

            // Clear sensitive fields but keep date
            setFormData(prev => ({
                ...prev,
                title: '',
                youtubeUrl: ''
            }));

        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload POV. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setShowSuccess(false);
        setFormData({
            playerName: '',
            title: '',
            date: getTodayInputFormat(),
            youtubeUrl: ''
        });
        setIsNewPlayer(false);
        setNewPlayerName('');
    };

    if (showSuccess) {
        return (
            <div className="max-w-2xl mx-auto animate-fade-in">
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 mx-auto flex items-center justify-center mb-6">
                        <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Upload Complete!
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        Your POV has been successfully added to the collection.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleReset}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-xl font-medium transition-all"
                        >
                            <Upload className="w-5 h-5" />
                            Upload Another
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-primary-500/30"
                        >
                            View All POVs
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-slide-up">
            <Toaster position="top-right" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Upload New POV
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Add a new gameplay recording to the team collection.
                </p>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

                    {/* Player Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Player Name
                        </label>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                {!isNewPlayer ? (
                                    <select
                                        name="playerName"
                                        value={formData.playerName}
                                        onChange={handlePlayerSelect}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 transition-all"
                                    >
                                        <option value="" disabled>Select a player</option>
                                        {players.map(player => (
                                            <option key={player} value={player}>{player}</option>
                                        ))}
                                        <option value="new">+ Add New Player</option>
                                    </select>
                                ) : (
                                    <div className="flex gap-2 animate-fade-in">
                                        <input
                                            type="text"
                                            value={newPlayerName}
                                            onChange={(e) => setNewPlayerName(e.target.value)}
                                            placeholder="Enter new player name"
                                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsNewPlayer(false)}
                                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Game Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Game Title / Description
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Daily Scrims [3-5] - Erangle"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 transition-all"
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date Played
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 transition-all"
                            />
                        </div>
                    </div>

                    {/* YouTube URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            YouTube URL
                        </label>
                        <input
                            type="url"
                            name="youtubeUrl"
                            value={formData.youtubeUrl}
                            onChange={handleChange}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 transition-all"
                        />

                        {/* Thumbnail Preview */}
                        <YouTubeThumbnailPreview url={formData.youtubeUrl} />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-primary-500/30'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Upload POV
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
