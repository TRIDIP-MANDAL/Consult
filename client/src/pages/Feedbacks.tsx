import React, { useState } from 'react';
import { FeedbackCard, type FeedbackData } from '../component/cards/Feedback.tsx';
import useUser from '../lib/UserState.ts';
import { callApi } from '../config/api.ts';
import Loading from '../component/Loading.tsx';
import { ConfirmationModal } from '../component/ConfirmationModal.tsx';

interface FeedbackModalProps {
    mode: 'create' | 'update';
    initialContent?: string;
    initialRating?: number;
    feedbackId?: string;
    onClose: () => void;
    onSuccess: (content: string, rating: number) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ mode, initialContent = '', initialRating, feedbackId, onClose, onSuccess }) => {
    const [content, setContent] = useState(initialContent);
    const [rating, setRating] = useState(initialRating);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating) { setError('Rating is required.'); return; }
        if (!content.trim()) { setError('Feedback content cannot be empty.'); return; }
        if (content.length > 300) { setError('Feedback must be under 300 characters.'); return; }
        setSaving(true);
        setError('');
        console.log(`Rating ${rating} content ${content}`)
        try {
            let res: { success: boolean; message: string };
            if (mode === 'create') {
                res = await callApi('/feedback/create', 'POST', { content, rating });
            } else {
                res = await callApi(`/feedback/update/${feedbackId}`, 'PATCH', { content, rating });
            }
            if (res.success) {
                onSuccess(content, rating);
            } else {
                setError(res.message || 'Something went wrong.');
            }
        } catch {
            setError('Unable to submit feedback. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        // Frozen background overlay
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeInScale_0.2s_ease-out]">
                {/* Coloured top stripe */}
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400" />

                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {mode === 'create' ? '✍️ Share Your Experience' : '✏️ Update Your Feedback'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {mode === 'create'
                                    ? 'Tell the community about your experience on this platform.'
                                    : 'Edit your existing feedback below.'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Rating Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Your Rating <span className="text-red-400">*</span>
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => ( // this might be reusable for mentor fdbck
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => { setRating(star); setError(''); }}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                        aria-label={`Rate ${star}`}
                                    >
                                        <svg
                                            className={`w-8 h-8 transition-colors ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Textarea */}
                        <div>
                            <label htmlFor="feedback-content" className="block text-sm font-semibold text-gray-700 mb-2">
                                Your Feedback <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                id="feedback-content"
                                rows={5}
                                value={content}
                                onChange={(e) => { setContent(e.target.value); setError(''); }}
                                placeholder="Share your honest experience with the community…"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white resize-none transition"
                                disabled={saving}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <span className={`text-xs ${content.length > 300 ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>
                                    {content.length} / 300
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {saving && (
                            <div className="flex justify-center">
                                <Loading text={mode === 'create' ? 'Submitting feedback…' : 'Saving changes…'} size="sml" />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || content.length > 300}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                            >
                                {saving ? '…' : mode === 'create' ? 'Submit Feedback' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ─── Success Toast ────────────────────────────────────────────────────────────
const SuccessToast: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border border-green-200 text-green-700 rounded-2xl px-5 py-4 shadow-xl animate-[slideInRight_0.3s_ease-out]">
        <svg className="w-5 h-5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="font-semibold text-sm">{message}</span>
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Feedbacks: React.FC = () => {
    const isloggedin = useUser((state) => state.isloggedin);

    const [modalOpen, setModalOpen] = useState(false);
    const [toast, setToast] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [myFeedback, setMyFeedback] = useState<FeedbackData | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const LIMIT = 6;

    // ── Fetch a page of feedbacks ─────────────────────────────────────────────
    const fetchFeedbacks = async (pageNum: number, append = false) => {
        try {
            if (append) setLoadingMore(true);
            else setLoading(true);

            const res = await callApi(`/feedback/fetchall?page=${pageNum}&limit=${LIMIT}&order=desc`, 'GET');
            
            console.log("Rep om fdbck api call", res)
            if (res.success) {
                // Page 1: server sends back myFeedback separately (the pinned-to-top user row)
                if (pageNum === 1 && res.myFeedback) {
                    setMyFeedback(res.myFeedback);
                }
                setFeedbacks((prev) => append ? [...prev, ...res.feedbacks] : res.feedbacks);
                setHasMore(res.hasMore);
                setPage(pageNum);
            }
        } catch (err) {
            console.error('Failed to fetch feedbacks:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Fetch on mount
    React.useEffect(() => {
        fetchFeedbacks(1);
    }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleSuccess = (newContent: string, newRating: number) => {
        if (myFeedback) {
            // Update locally — no refetch needed
            setMyFeedback((prev) => prev ? { ...prev, content: newContent, rating: newRating } : prev);
            showToast('Feedback updated successfully!');
        } else {
            // Refetch page 1 so the new feedback appears and myFeedback is populated
            fetchFeedbacks(1);
            showToast('Feedback submitted! Thank you ');
        }
        setModalOpen(false);
    };

    const handleDelete = async () => {
        if (!myFeedback?.id) return;
        try {
            const res = await callApi(`/feedback/delete/${myFeedback.id}`, 'DELETE');
            if (res.success) {
                setMyFeedback(null);
                setShowDeleteConfirm(false);
                showToast('Feedback deleted successfully!');
                fetchFeedbacks(1);
            } else {
                alert(res.message || 'Error deleting feedback');
            }
        } catch (error) {
            console.error('Delete error', error);
            alert('Unable to delete feedback. Please try again.');
        }
    };

    const handleLoadMore = () => {
        fetchFeedbacks(page + 1, true);
    };

    // All feedbacks to display: myFeedback pinned first, then the rest
    const allFeedbacks = myFeedback? [myFeedback, ...feedbacks] : feedbacks;

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            {toast && <SuccessToast message={toast} />}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                title="Delete Feedback"
                message="Are you sure you want to delete your feedback? This action cannot be undone."
                confirmText="Yes, Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            {/* Feedback Modal */}
            {modalOpen && (
                <FeedbackModal
                    mode={myFeedback ? 'update' : 'create'}
                    initialContent={myFeedback?.content ?? ''}
                    initialRating={myFeedback?.rating ?? undefined}
                    feedbackId={myFeedback?.id}
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}

            <div className="max-w-7xl mx-auto">
                <div className="relative text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
                        What Our Users Say
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-500">
                        Read real experiences from professionals who have transformed their careers using our platform.
                    </p>

                    {/* Write / Update Feedback button — only for logged-in users */}
                    {isloggedin && (
                        <div className="mt-6 md:mt-0 md:absolute md:top-2 md:right-0 flex justify-center gap-3">
                            {myFeedback ? (
                                <>
                                    <button
                                        onClick={() => setModalOpen(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Update Feedback
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white font-semibold rounded-xl shadow-md hover:bg-red-600 hover:shadow-lg transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Write Feedback
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Loading skeleton */}
                {loading ? (
                    <Loading text="Loading feedbacks…" size="mdm" />
                ) : allFeedbacks?.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <svg className="w-14 h-14 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M21 16a2 2 0 01-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z" />
                        </svg>
                        <p className="text-lg font-medium">No feedbacks yet.</p>
                        <p className="text-sm mt-1">Be the first to share your experience!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {allFeedbacks.map((feedback, index) => (
                            <FeedbackCard key={`feedback_${index}`} feedback={feedback} />
                        ))}
                    </div>
                )}

                {/* Load More */}
                {!loading && hasMore && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-60 transition-colors duration-200"
                        >
                            {loadingMore ? 'Loading…' : 'Load More Feedbacks'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feedbacks;
