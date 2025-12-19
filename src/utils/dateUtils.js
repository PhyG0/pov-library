import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

/**
 * Format date for display
 */
export function formatDate(date, formatString = 'MMM dd, yyyy') {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, formatString);
}

/**
 * Format date for grouping (e.g., "December 19, 2025")
 */
export function formatDateLong(date) {
    return formatDate(date, 'MMMM dd, yyyy');
}

/**
 * Get date range for "Today" filter
 */
export function getTodayRange() {
    const now = new Date();
    return {
        from: startOfDay(now),
        to: endOfDay(now)
    };
}

/**
 * Get date range for "This Week" filter
 */
export function getThisWeekRange() {
    const now = new Date();
    return {
        from: startOfWeek(now),
        to: endOfWeek(now)
    };
}

/**
 * Get date range for "This Month" filter
 */
export function getThisMonthRange() {
    const now = new Date();
    return {
        from: startOfMonth(now),
        to: endOfMonth(now)
    };
}

/**
 * Check if a date is within a range
 */
export function isDateInRange(date, from, to) {
    if (!date) return false;
    if (!from && !to) return true;

    const dateObj = date instanceof Date ? date : new Date(date);

    if (from && to) {
        return isWithinInterval(dateObj, { start: new Date(from), end: new Date(to) });
    }

    if (from) {
        return dateObj >= new Date(from);
    }

    if (to) {
        return dateObj <= new Date(to);
    }

    return true;
}

/**
 * Group POVs by date
 */
export function groupPOVsByDate(povs) {
    const grouped = {};

    povs.forEach(pov => {
        const dateKey = formatDateLong(pov.date);
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(pov);
    });

    return grouped;
}

/**
 * Get today's date formatted for date input (YYYY-MM-DD)
 */
export function getTodayInputFormat() {
    const today = new Date();
    return format(today, 'yyyy-MM-dd');
}
