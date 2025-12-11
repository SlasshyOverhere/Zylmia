/**
 * Region Utilities
 * Handles user location detection and timezone conversion
 */

// Cache key for localStorage
const REGION_CACHE_KEY = 'zylmia_region_info';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Get cached region info
 */
const getCachedRegion = () => {
    try {
        const cached = localStorage.getItem(REGION_CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return data;
            }
        }
    } catch (e) {
        console.error('Failed to get cached region:', e);
    }
    return null;
};

/**
 * Cache region info
 */
const cacheRegion = (data) => {
    try {
        localStorage.setItem(REGION_CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.error('Failed to cache region:', e);
    }
};

/**
 * Get user's region info via IP geolocation
 * Returns: { code, name, city, timezone }
 */
export const getRegionInfo = async () => {
    // Check cache first
    const cached = getCachedRegion();
    if (cached) return cached;

    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        const regionInfo = {
            code: data.country_code || 'US',
            name: data.country_name || 'United States',
            city: data.city || '',
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            utcOffset: data.utc_offset || '+00:00'
        };

        cacheRegion(regionInfo);
        return regionInfo;
    } catch (error) {
        console.error('Failed to detect region:', error);
        // Fallback to browser timezone
        return {
            code: 'US',
            name: 'Unknown',
            city: '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            utcOffset: '+00:00'
        };
    }
};

/**
 * Convert a date string to user's local time
 * TMDB dates are in YYYY-MM-DD format (no time), so we assume midnight in the region
 */
export const toLocalReleaseDate = (dateStr, timezone) => {
    if (!dateStr) return null;

    try {
        // Parse the date (YYYY-MM-DD)
        const [year, month, day] = dateStr.split('-').map(Number);

        // Create date at midnight in the specified timezone
        // Using the timezone to format and then parse back
        const date = new Date(year, month - 1, day);

        return date;
    } catch (e) {
        console.error('Failed to convert date:', e);
        return new Date(dateStr);
    }
};

/**
 * Format date for display in user's locale
 */
export const formatLocalDate = (dateStr, options = {}) => {
    if (!dateStr) return 'TBA';

    const defaultOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...options
    };

    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, defaultOptions);
    } catch (e) {
        return 'TBA';
    }
};

/**
 * Check if a release date is in the past
 */
export const isReleased = (dateStr) => {
    if (!dateStr) return false;
    const releaseDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return releaseDate < today;
};

/**
 * Check if a release is today
 */
export const isReleasingToday = (dateStr) => {
    if (!dateStr) return false;
    const releaseDate = new Date(dateStr);
    const today = new Date();

    return (
        releaseDate.getFullYear() === today.getFullYear() &&
        releaseDate.getMonth() === today.getMonth() &&
        releaseDate.getDate() === today.getDate()
    );
};

/**
 * Get days until release
 */
export const getDaysUntilRelease = (dateStr) => {
    if (!dateStr) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const release = new Date(dateStr);
    release.setHours(0, 0, 0, 0);

    const diff = Math.ceil((release - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
};
