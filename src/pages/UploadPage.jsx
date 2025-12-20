import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Plus, Calendar, ArrowRight, ArrowLeft, Check, Trophy, Hash, ChevronDown } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { getAllSlots, createSlot } from '../services/slotService';
import { getMatchesBySlot, createMatch } from '../services/matchService';
import { createPOV } from '../services/povService';
import { getAllPlayers } from '../services/povService';
import { YouTubeThumbnailPreview } from '../components/YouTubeThumbnailPreview';
import { getTodayInputFormat } from '../utils/dateUtils';
import { isValidYouTubeUrl, extractYouTubeId } from '../utils/youtubeUtils';
import { getMapName } from '../utils/mapUtils';

export function UploadPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(1);
    const [slots, setSlots] = useState([]);
    const [matches, setMatches] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Step 1: Slot data
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isCreatingSlot, setIsCreatingSlot] = useState(false);
    const [newSlot, setNewSlot] = useState({
        name: '',
        description: '',
        date: getTodayInputFormat()
    });

    // Step 2: Match data
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [isCreatingMatch, setIsCreatingMatch] = useState(false);
    const [newMatch, setNewMatch] = useState({
        matchNumber: 1,
        description: ''
    });

    // Step 3: POV data
    const [formData, setFormData] = useState({
        playerName: '',
        title: '',
        date: getTodayInputFormat(),
        youtubeUrl: ''
    });

    // Fixed player list
    const FIXED_PLAYERS = ['Nomore', 'Zebra', 'Onee', 'Revanth', 'Other'];

    // Load initial data
    useEffect(() => {
        loadSlots();

        // Pre-select from navigation state if coming from match detail page
        if (location.state?.slotId && location.state?.matchId) {
            loadPreselectedData(location.state.slotId, location.state.matchId, location.state?.playerName);
        }
    }, []);

    const loadPreselectedData = async (slotId, matchId, playerName) => {
        try {
            const { getSlotById } = await import('../services/slotService');
            const { getMatchById } = await import('../services/matchService');

            const [slotData, matchData] = await Promise.all([
                getSlotById(slotId),
                getMatchById(slotId, matchId)
            ]);

            setSelectedSlot(slotData);
            setSelectedMatch(matchData);

            // Pre-fill player name if provided
            if (playerName) {
                setFormData(prev => ({ ...prev, playerName: playerName }));
            }

            setCurrentStep(3);
        } catch (error) {
            console.error('Failed to load preselected data:', error);
            toast.error('Failed to load slot/match data');
        }
    };

    // Load matches when slot is selected
    useEffect(() => {
        if (selectedSlot?.id) {
            loadMatches(selectedSlot.id);
        }
    }, [selectedSlot]);

    const loadSlots = async () => {
        try {
            const data = await getAllSlots();
            setSlots(data);
        } catch (error) {
            console.error('Failed to load slots:', error);
        }
    };

    const loadMatches = async (slotId) => {
        try {
            const data = await getMatchesBySlot(slotId);
            setMatches(data);
            // Set next match number
            if (data.length > 0) {
                const maxMatchNumber = Math.max(...data.map(m => m.matchNumber || 0));
                setNewMatch(prev => ({ ...prev, matchNumber: maxMatchNumber + 1 }));
            }
        } catch (error) {
            console.error('Failed to load matches:', error);
        }
    };


    // Step 1: Create or select slot
    const handleCreateSlot = async () => {
        if (!newSlot.name.trim()) {
            toast.error('Please enter a slot name');
            return;
        }

        setIsSubmitting(true);
        try {
            const created = await createSlot(newSlot);
            setSelectedSlot(created);
            setIsCreatingSlot(false);
            setCurrentStep(2);
            await loadSlots();
            toast.success('Slot created!');
        } catch (error) {
            console.error('Failed to create slot:', error);
            toast.error('Failed to create slot');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectSlot = (slot) => {
        setSelectedSlot(slot);
        setCurrentStep(2);
    };

    // Step 2: Create or select match
    const handleCreateMatch = async () => {
        if (!selectedSlot?.id) return;

        setIsSubmitting(true);
        try {
            const created = await createMatch(selectedSlot.id, newMatch);
            setSelectedMatch(created);
            setIsCreatingMatch(false);
            setCurrentStep(3);
            toast.success('Match created!');
        } catch (error) {
            console.error('Failed to create match:', error);
            toast.error('Failed to create match');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectMatch = (match) => {
        setSelectedMatch(match);
        setCurrentStep(3);
    };

    // Step 3: Upload POV
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.playerName) {
            toast.error('Please select a player');
            return;
        }

        if (!formData.title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        if (!isValidYouTubeUrl(formData.youtubeUrl)) {
            toast.error('Please enter a valid YouTube URL');
            return;
        }

        setIsSubmitting(true);

        try {
            const finalPlayerName = formData.playerName;
            const videoId = extractYouTubeId(formData.youtubeUrl);

            const newPOV = {
                title: formData.title.trim(),
                playerName: finalPlayerName,
                date: new Date(formData.date).toISOString(),
                videoId,
                youtubeUrl: formData.youtubeUrl
            };

            await createPOV(selectedSlot.id, selectedMatch.id, newPOV);
            toast.success('POV uploaded successfully!');
            setShowSuccess(true);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload POV');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setCurrentStep(1);
        setSelectedSlot(null);
        setSelectedMatch(null);
        setFormData({
            playerName: '',
            title: '',
            date: getTodayInputFormat(),
            youtubeUrl: ''
        });
        setIsNewPlayer(false);
        setNewPlayerName('');
        setShowSuccess(false);
        setIsCreatingSlot(false);
        setIsCreatingMatch(false);
    };

    // Success Screen
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
                        Your POV has been successfully added to {selectedSlot?.name}, Match {selectedMatch?.matchNumber}
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
                            onClick={() => navigate(`/slots/${selectedSlot.id}/matches/${selectedMatch.id}`)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-primary-500/30"
                        >
                            View Match
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step Indicator
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map(step => (
                <div key={step} className="flex items-center gap-2">
                    <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${currentStep >= step
                            ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/30'
                            : 'bg-gray-200 dark:bg-dark-700 text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        {currentStep > step ? <Check className="w-5 h-5" /> : step}
                    </div>
                    <span className={`text-sm font-medium ${currentStep >= step ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {step === 1 ? 'Slot' : step === 2 ? 'Match' : 'POV'}
                    </span>
                    {step < 3 && (
                        <ArrowRight className={`w-4 h-4 ml-2 ${currentStep > step ? 'text-primary-600' : 'text-gray-300 dark:text-gray-600'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto animate-slide-up">
            <Toaster position="top-right" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Upload New POV
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Follow the steps to upload your gameplay recording
                </p>
            </div>

            <StepIndicator />

            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 md:p-8">

                    {/* STEP 1: Select/Create Slot */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <Trophy className="w-6 h-6 text-primary-600" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Select or Create Slot
                                </h2>
                            </div>

                            {!isCreatingSlot ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                                        {slots.map(slot => (
                                            <button
                                                key={slot.id}
                                                onClick={() => handleSelectSlot(slot)}
                                                className="text-left p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group"
                                            >
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                                    {slot.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {slot.matchCount || 0} matches · {slot.povCount || 0} POVs
                                                </p>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setIsCreatingSlot(true)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Create New Slot
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Slot Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newSlot.name}
                                            onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
                                            placeholder="e.g., 3k Semis, Finals"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={newSlot.description}
                                            onChange={(e) => setNewSlot({ ...newSlot, description: e.target.value })}
                                            placeholder="Optional description"
                                            rows={2}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newSlot.date}
                                            onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleCreateSlot}
                                            disabled={isSubmitting}
                                            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Creating...' : 'Create & Continue'}
                                        </button>
                                        <button
                                            onClick={() => setIsCreatingSlot(false)}
                                            disabled={isSubmitting}
                                            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Select/Create Match */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Hash className="w-6 h-6 text-primary-600" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Select or Create Match
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    <ArrowLeft className="w-4 h-4 inline mr-1" />
                                    Back
                                </button>
                            </div>

                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 border border-gray-300 dark:border-gray-600">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Slot: <span className="font-semibold text-gray-900 dark:text-white">{selectedSlot?.name}</span>
                                </p>
                            </div>

                            {!isCreatingMatch ? (
                                <>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {matches.map(match => (
                                            <button
                                                key={match.id}
                                                onClick={() => handleSelectMatch(match)}
                                                className="w-full text-left p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group"
                                            >
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                                    {getMapName(match.matchNumber)}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {match.povCount || 0} POVs uploaded
                                                </p>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setIsCreatingMatch(true)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Create New Match
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Map <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={newMatch.matchNumber}
                                            onChange={(e) => setNewMatch({ ...newMatch, matchNumber: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                            autoFocus
                                        >
                                            <option value="">Select a map</option>
                                            <option value="1">Erangle</option>
                                            <option value="2">Miramar</option>
                                            <option value="3">Rondo</option>
                                            <option value="4">Sanhok</option>
                                            <option value="5">Other</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleCreateMatch}
                                            disabled={isSubmitting}
                                            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Creating...' : 'Create & Continue'}
                                        </button>
                                        <button
                                            onClick={() => setIsCreatingMatch(false)}
                                            disabled={isSubmitting}
                                            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: Upload POV */}
                    {currentStep === 3 && (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Upload className="w-6 h-6 text-primary-600" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Upload POV Details
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(2)}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    <ArrowLeft className="w-4 h-4 inline mr-1" />
                                    Back
                                </button>
                            </div>

                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 space-y-1 border border-gray-300 dark:border-gray-600">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Slot: <span className="font-semibold text-gray-900 dark:text-white">{selectedSlot?.name}</span>
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Match: <span className="font-semibold text-gray-900 dark:text-white">{getMapName(selectedMatch?.matchNumber)}</span>
                                </p>
                            </div>

                            {/* Player Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Player Name
                                </label>
                                <select
                                    name="playerName"
                                    value={formData.playerName}
                                    onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                    required
                                >
                                    <option value="">Select a player</option>
                                    {FIXED_PLAYERS.map(player => (
                                        <option key={player} value={player}>{player}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    POV Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., My perspective"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
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
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
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
                                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                />
                                <YouTubeThumbnailPreview url={formData.youtubeUrl} />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600'
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
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}
