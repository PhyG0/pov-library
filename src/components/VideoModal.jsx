import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { addComment, getComments } from '../services/povService';

export function VideoModal({ isOpen, onClose, videoId, title, povId, slotId, matchId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Fetch comments when modal opens
    useEffect(() => {
        if (isOpen && povId && slotId && matchId) {
            fetchComments();
        } else {
            setComments([]);
        }
    }, [isOpen, povId, slotId, matchId]);

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const fetchedComments = await getComments(slotId, matchId, povId);
            setComments(fetchedComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Failed to load comments');
        } finally {
            setLoadingComments(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            await addComment(slotId, matchId, povId, newComment.trim());
            setNewComment('');
            fetchComments(); // Refresh list
            toast.success('Comment posted!');
        } catch (error) {
            console.error('Error posting comment:', error);
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 p-0 sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-gray-800 w-full h-full sm:h-auto sm:max-h-[90vh] lg:max-h-[85vh] sm:rounded-xl shadow-2xl sm:max-w-7xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white line-clamp-1 pr-2">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Container for Video + Comments */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
                    {/* Video Player Section */}
                    <div className="w-full lg:flex-1 bg-black flex items-center justify-center relative aspect-video lg:aspect-auto lg:min-h-[500px]">
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title={title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full absolute inset-0"
                        />
                    </div>

                    {/* Comments Section */}
                    {povId && (
                        <div className="w-full lg:w-96 xl:w-[420px] flex flex-col bg-gray-50 dark:bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 flex-1 lg:max-h-none">
                            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                    Comments ({comments.length})
                                </h3>
                            </div>

                            {/* Comments List */}
                            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
                                {loadingComments ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            No comments yet. Be the first!
                                        </p>
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="space-y-1.5 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                                        >
                                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white truncate">
                                                    {comment.author}
                                                </span>
                                                <span className="text-gray-400 text-xs ml-auto shrink-0">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 pl-9 break-words">
                                                {comment.text}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Comment Input */}
                            <form
                                onSubmit={handleSubmitComment}
                                className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0"
                            >
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                        disabled={submitting}
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting || !newComment.trim()}
                                        className="p-2 sm:p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md active:scale-95 shrink-0"
                                        aria-label="Send comment"
                                    >
                                        {submitting ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                        ) : (
                                            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
