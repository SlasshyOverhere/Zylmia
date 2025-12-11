import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Check, X, Sparkles, Film, Globe2,
    ArrowRight, RefreshCw, Star
} from 'lucide-react';
import {
    PREFERENCE_OPTIONS,
    getDefaultPreferences,
    savePreferences,
    getPreferences
} from '../../utils/preferences';

/**
 * Preference Chip Component
 */
const PreferenceChip = ({
    selected,
    onClick,
    children,
    icon,
    size = 'normal'
}) => {
    const sizeClasses = size === 'small'
        ? 'px-3 py-1.5 text-xs gap-1.5'
        : 'px-4 py-2.5 text-sm gap-2';

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
        relative flex items-center ${sizeClasses} rounded-xl font-medium
        transition-all duration-300 border
        ${selected
                    ? 'bg-gradient-to-r from-violet-600/30 to-purple-600/30 border-violet-500/50 text-white shadow-lg shadow-violet-500/20'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:border-white/20 hover:text-white'
                }
      `}
        >
            {icon && <span className="text-lg">{icon}</span>}
            {children}
            {selected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center"
                >
                    <Check size={10} className="text-white" />
                </motion.div>
            )}
        </motion.button>
    );
};

/**
 * Section Header
 */
const SectionHeader = ({ icon: Icon, title, subtitle, gradient }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient}`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-neutral-400">{subtitle}</p>
        </div>
    </div>
);

/**
 * Preferences Modal Component
 */
const PreferencesModal = ({
    isOpen,
    onClose,
    onSave,
    isFirstTime = false
}) => {
    const [selectedOrigins, setSelectedOrigins] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Load existing preferences when modal opens
    useEffect(() => {
        if (isOpen) {
            const prefs = getPreferences();
            setSelectedOrigins(prefs.origins || []);
            setSelectedGenres(prefs.genres || []);
            setStep(1);
        }
    }, [isOpen]);

    // Toggle selection handlers
    const toggleOrigin = (originId) => {
        setSelectedOrigins(prev =>
            prev.includes(originId)
                ? prev.filter(id => id !== originId)
                : [...prev, originId]
        );
    };

    const toggleGenre = (genreId) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        );
    };

    // Select/Deselect all handlers
    const selectAllOrigins = () => {
        setSelectedOrigins(PREFERENCE_OPTIONS.origins.map(o => o.id));
    };

    const selectAllGenres = () => {
        setSelectedGenres(PREFERENCE_OPTIONS.genres.map(g => g.id));
    };

    const clearAllOrigins = () => setSelectedOrigins([]);
    const clearAllGenres = () => setSelectedGenres([]);

    // Handle save
    const handleSave = () => {
        setIsSaving(true);

        const preferences = {
            origins: selectedOrigins.length > 0 ? selectedOrigins : PREFERENCE_OPTIONS.origins.map(o => o.id),
            genres: selectedGenres.length > 0 ? selectedGenres : PREFERENCE_OPTIONS.genres.map(g => g.id),
            showPopularReleases: true
        };

        savePreferences(preferences);

        setTimeout(() => {
            setIsSaving(false);
            if (onSave) onSave(preferences);
            if (onClose) onClose();
        }, 500);
    };

    // Check if can proceed
    const canProceed = step === 1 ? selectedOrigins.length > 0 : selectedGenres.length > 0;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    onClick={isFirstTime ? undefined : onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900/95 via-neutral-900/98 to-black/95 border border-white/10 shadow-2xl shadow-violet-500/10"
                >
                    {/* Decorative Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-violet-600/10 via-transparent to-transparent rounded-full blur-3xl" />
                        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-600/10 via-transparent to-transparent rounded-full blur-3xl" />
                    </div>

                    {/* Close Button (only if not first time) */}
                    {!isFirstTime && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <X size={20} />
                        </button>
                    )}

                    {/* Header */}
                    <div className="relative p-6 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                            <img
                                src="/logo.png"
                                alt="Zylmia"
                                className="w-12 h-12 rounded-2xl shadow-lg shadow-violet-500/30 object-cover"
                            />
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {isFirstTime ? 'Welcome to Zylmia!' : 'Preferences'}
                                </h2>
                                <p className="text-sm text-neutral-400">
                                    {isFirstTime
                                        ? 'Tell us what you love to watch'
                                        : 'Customize your upcoming releases feed'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center gap-2 mt-4">
                            <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-violet-500' : 'bg-white/10'}`} />
                            <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-violet-500' : 'bg-white/10'}`} />
                        </div>
                        <div className="flex justify-between text-xs text-neutral-500 mt-1">
                            <span className={step === 1 ? 'text-violet-400' : ''}>Origins</span>
                            <span className={step === 2 ? 'text-violet-400' : ''}>Genres</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative p-6 overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="origins"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <SectionHeader
                                        icon={Globe2}
                                        title="Select Origins"
                                        subtitle="Choose movie origins you're interested in"
                                        gradient="from-cyan-600 to-blue-600"
                                    />

                                    {/* Quick Actions */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <button
                                            onClick={selectAllOrigins}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={clearAllOrigins}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-neutral-400 hover:bg-white/10 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                        <span className="ml-auto text-xs text-neutral-500">
                                            {selectedOrigins.length} selected
                                        </span>
                                    </div>

                                    {/* Origins Grid */}
                                    <div className="flex flex-wrap gap-2">
                                        {PREFERENCE_OPTIONS.origins.map(origin => (
                                            <PreferenceChip
                                                key={origin.id}
                                                selected={selectedOrigins.includes(origin.id)}
                                                onClick={() => toggleOrigin(origin.id)}
                                                icon={origin.flag}
                                            >
                                                {origin.label}
                                            </PreferenceChip>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="genres"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <SectionHeader
                                        icon={Film}
                                        title="Select Genres"
                                        subtitle="Pick the genres you love"
                                        gradient="from-orange-600 to-amber-600"
                                    />

                                    {/* Quick Actions */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <button
                                            onClick={selectAllGenres}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={clearAllGenres}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-neutral-400 hover:bg-white/10 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                        <span className="ml-auto text-xs text-neutral-500">
                                            {selectedGenres.length} selected
                                        </span>
                                    </div>

                                    {/* Genres Grid */}
                                    <div className="flex flex-wrap gap-2">
                                        {PREFERENCE_OPTIONS.genres.map(genre => (
                                            <PreferenceChip
                                                key={genre.id}
                                                selected={selectedGenres.includes(genre.id)}
                                                onClick={() => toggleGenre(genre.id)}
                                                icon={genre.icon}
                                                size="small"
                                            >
                                                {genre.label}
                                            </PreferenceChip>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Info Banner */}
                    <div className="relative mx-6 mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-500/20">
                        <div className="flex items-start gap-3">
                            <Star className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <span className="text-amber-400 font-medium">Popular & Trending</span>
                                <span className="text-neutral-400"> will always be shown regardless of preferences</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="relative p-6 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between gap-4">
                            {/* Back Button */}
                            {step > 1 && (
                                <motion.button
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => setStep(step - 1)}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
                                >
                                    Back
                                </motion.button>
                            )}

                            <div className="flex-1" />

                            {/* Next/Save Button */}
                            {step < 2 ? (
                                <motion.button
                                    whileHover={{ scale: canProceed ? 1.02 : 1 }}
                                    whileTap={{ scale: canProceed ? 0.98 : 1 }}
                                    onClick={() => canProceed && setStep(step + 1)}
                                    disabled={!canProceed}
                                    className={`
                    relative px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2
                    transition-all duration-300 overflow-hidden
                    ${canProceed
                                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50'
                                            : 'bg-white/5 text-neutral-500 cursor-not-allowed'
                                        }
                  `}
                                >
                                    Next
                                    <ArrowRight size={16} />
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: canProceed ? 1.02 : 1 }}
                                    whileTap={{ scale: canProceed ? 0.98 : 1 }}
                                    onClick={handleSave}
                                    disabled={!canProceed || isSaving}
                                    className={`
                    relative px-8 py-2.5 rounded-xl font-semibold flex items-center gap-2
                    transition-all duration-300 overflow-hidden
                    ${canProceed
                                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50'
                                            : 'bg-white/5 text-neutral-500 cursor-not-allowed'
                                        }
                  `}
                                >
                                    {isSaving ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={16} />
                                            {isFirstTime ? 'Get Started' : 'Save Preferences'}
                                        </>
                                    )}
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PreferencesModal;
