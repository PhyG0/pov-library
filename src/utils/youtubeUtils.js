// YouTube URL utilities

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
export function extractYouTubeId(url) {
    if (!url) return null;

    // Regular YouTube URL: youtube.com/watch?v=VIDEO_ID
    const watchRegex = /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
    const watchMatch = url.match(watchRegex);
    if (watchMatch) return watchMatch[1];

    // Short URL: youtu.be/VIDEO_ID
    const shortRegex = /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const shortMatch = url.match(shortRegex);
    if (shortMatch) return shortMatch[1];

    // Embed URL: youtube.com/embed/VIDEO_ID
    const embedRegex = /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const embedMatch = url.match(embedRegex);
    if (embedMatch) return embedMatch[1];

    return null;
}

/**
 * Generate YouTube thumbnail URL from video ID
 */
export function getYouTubeThumbnail(videoId, quality = 'hqdefault') {
    if (!videoId) return null;
    // quality options: default, mqdefault, hqdefault, sddefault, maxresdefault
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Validate if a URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url) {
    return extractYouTubeId(url) !== null;
}

/**
 * Get YouTube watch URL from video ID
 */
export function getYouTubeWatchUrl(videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
}
