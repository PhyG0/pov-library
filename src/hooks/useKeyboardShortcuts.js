import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for keyboard shortcuts
 */
export function useKeyboardShortcuts() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyPress = (event) => {
            // Ctrl+U or Cmd+U - Navigate to upload page
            if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
                event.preventDefault();
                navigate('/upload');
            }

            // Ctrl+K or Cmd+K - Focus search input
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                const searchInput = document.getElementById('pov-search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Escape - Clear focus or close modals
            if (event.key === 'Escape') {
                document.activeElement?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [navigate]);
}
