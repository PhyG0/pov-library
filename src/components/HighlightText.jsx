import React from 'react';

/**
 * Component that highlights matching text within a string
 * @param {string} text - The full text to display
 * @param {string} highlight - The text to highlight
 * @returns {JSX.Element} Text with highlighted matches
 */
export function HighlightText({ text, highlight }) {
    if (!highlight || !text) {
        return <>{text}</>;
    }

    // Escape special regex characters in highlight term
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) =>
                regex.test(part) ? (
                    <span
                        key={index}
                        className="bg-yellow-200 dark:bg-yellow-700/50 text-gray-900 dark:text-gray-100 font-semibold px-0.5 rounded"
                    >
                        {part}
                    </span>
                ) : (
                    <React.Fragment key={index}>{part}</React.Fragment>
                )
            )}
        </>
    );
}
