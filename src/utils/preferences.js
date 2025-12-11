/**
 * User Preferences Utility
 * Handles storing and retrieving user preferences from localStorage
 */

const PREFERENCES_KEY = 'zylmia_user_preferences';
const PREFERENCES_SET_KEY = 'zylmia_preferences_set';

/**
 * Available preference options
 */
export const PREFERENCE_OPTIONS = {
    origins: [
        { id: 'hollywood', label: 'Hollywood', flag: '🇺🇸', languages: ['en'], regions: ['US'] },
        { id: 'indian', label: 'Indian', flag: '🇮🇳', languages: ['hi', 'ta', 'te', 'ml', 'bn', 'kn', 'mr', 'pa'], regions: ['IN'] },
        { id: 'japanese', label: 'Japanese', flag: '🇯🇵', languages: ['ja'], regions: ['JP'] },
        { id: 'chinese', label: 'Chinese', flag: '🇨🇳', languages: ['zh', 'cn'], regions: ['CN', 'TW', 'HK'] },
        { id: 'korean', label: 'Korean', flag: '🇰🇷', languages: ['ko'], regions: ['KR'] },
        { id: 'british', label: 'British', flag: '🇬🇧', languages: ['en'], regions: ['GB'] },
        { id: 'french', label: 'French', flag: '🇫🇷', languages: ['fr'], regions: ['FR'] },
        { id: 'spanish', label: 'Spanish', flag: '🇪🇸', languages: ['es'], regions: ['ES', 'MX', 'AR'] },
        { id: 'german', label: 'German', flag: '🇩🇪', languages: ['de'], regions: ['DE'] },
        { id: 'thai', label: 'Thai', flag: '🇹🇭', languages: ['th'], regions: ['TH'] },
        { id: 'turkish', label: 'Turkish', flag: '🇹🇷', languages: ['tr'], regions: ['TR'] },
    ],
    genres: [
        { id: 28, label: 'Action', icon: '💥' },
        { id: 12, label: 'Adventure', icon: '🗺️' },
        { id: 16, label: 'Animation', icon: '🎨' },
        { id: 35, label: 'Comedy', icon: '😂' },
        { id: 80, label: 'Crime', icon: '🔪' },
        { id: 99, label: 'Documentary', icon: '📹' },
        { id: 18, label: 'Drama', icon: '🎭' },
        { id: 10751, label: 'Family', icon: '👨‍👩‍👧‍👦' },
        { id: 14, label: 'Fantasy', icon: '🧙' },
        { id: 36, label: 'History', icon: '📜' },
        { id: 27, label: 'Horror', icon: '👻' },
        { id: 10402, label: 'Music', icon: '🎵' },
        { id: 9648, label: 'Mystery', icon: '🔍' },
        { id: 10749, label: 'Romance', icon: '💕' },
        { id: 878, label: 'Sci-Fi', icon: '🚀' },
        { id: 10770, label: 'TV Movie', icon: '📺' },
        { id: 53, label: 'Thriller', icon: '😰' },
        { id: 10752, label: 'War', icon: '⚔️' },
        { id: 37, label: 'Western', icon: '🤠' },
    ]
};

/**
 * Default preferences - all options selected
 */
export const getDefaultPreferences = () => ({
    origins: PREFERENCE_OPTIONS.origins.map(o => o.id),
    genres: PREFERENCE_OPTIONS.genres.map(g => g.id),
    showPopularReleases: true, // Always true, can't be disabled
});

/**
 * Check if preferences have been set by the user
 */
export const hasPreferencesSet = () => {
    try {
        return localStorage.getItem(PREFERENCES_SET_KEY) === 'true';
    } catch (error) {
        console.error('Error checking preferences status:', error);
        return false;
    }
};

/**
 * Get user preferences from localStorage
 */
export const getPreferences = () => {
    try {
        const stored = localStorage.getItem(PREFERENCES_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error reading preferences:', error);
    }
    return getDefaultPreferences();
};

/**
 * Save user preferences to localStorage
 */
export const savePreferences = (preferences) => {
    try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
        localStorage.setItem(PREFERENCES_SET_KEY, 'true');
        return true;
    } catch (error) {
        console.error('Error saving preferences:', error);
        return false;
    }
};

/**
 * Clear user preferences
 */
export const clearPreferences = () => {
    try {
        localStorage.removeItem(PREFERENCES_KEY);
        localStorage.removeItem(PREFERENCES_SET_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing preferences:', error);
        return false;
    }
};

/**
 * Get TMDB API params based on user preferences
 */
export const getPreferenceFilters = (preferences) => {
    const filters = {};

    // Get selected genre IDs
    if (preferences.genres && preferences.genres.length > 0) {
        filters.with_genres = preferences.genres.join('|');
    }

    // Get selected origin languages
    if (preferences.origins && preferences.origins.length > 0) {
        const selectedOrigins = PREFERENCE_OPTIONS.origins.filter(o =>
            preferences.origins.includes(o.id)
        );

        // Collect all languages from selected origins
        const languages = [...new Set(selectedOrigins.flatMap(o => o.languages))];
        if (languages.length > 0) {
            filters.with_original_language = languages.join('|');
        }
    }

    return filters;
};

/**
 * Filter content based on preferences
 */
export const filterByPreferences = (items, preferences) => {
    if (!items || !Array.isArray(items)) return [];
    if (!preferences) return items;

    return items.filter(item => {
        // Check genre match
        if (preferences.genres && preferences.genres.length > 0) {
            const itemGenres = item.genre_ids || [];
            const hasMatchingGenre = itemGenres.some(g => preferences.genres.includes(g));
            if (!hasMatchingGenre && itemGenres.length > 0) return false;
        }

        // Check origin/language match
        if (preferences.origins && preferences.origins.length > 0) {
            const selectedOrigins = PREFERENCE_OPTIONS.origins.filter(o =>
                preferences.origins.includes(o.id)
            );
            const allowedLanguages = [...new Set(selectedOrigins.flatMap(o => o.languages))];

            if (!allowedLanguages.includes(item.original_language)) {
                return false;
            }
        }

        return true;
    });
};

export default {
    PREFERENCE_OPTIONS,
    getDefaultPreferences,
    hasPreferencesSet,
    getPreferences,
    savePreferences,
    clearPreferences,
    getPreferenceFilters,
    filterByPreferences
};
