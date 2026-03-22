import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, Send, X } from 'lucide-react';

interface RatingModalProps {
    otherName: string;
    onClose: () => void;
    onSubmit: (rating: number, review: string) => void;
    readOnly?: boolean;
    initialRating?: number;
    initialReview?: string;
}

export default function RatingModal({ otherName, onClose, onSubmit, readOnly, initialRating = 0, initialReview = '' }: RatingModalProps) {
    const [rating, setRating] = useState(initialRating);
    const [review, setReview] = useState(initialReview);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0 || readOnly) return;
        setLoading(true);
        await onSubmit(rating, review);
        setLoading(false);
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />

                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    <X className="w-5 h-5 text-neutral-500" />
                </button>

                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-3xl flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
                        <Star className="w-10 h-10 fill-current" />
                    </div>

                    <div>
                        <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                            {readOnly ? 'Your Review' : 'How was your session?'}
                        </h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                            {readOnly ? 'Review details for your session with' : 'Rate your experience with'} <span className="font-bold text-purple-500">{otherName}</span>
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 py-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onMouseEnter={() => !readOnly && setHover(star)}
                                onMouseLeave={() => !readOnly && setHover(0)}
                                onClick={() => !readOnly && setRating(star)}
                                className={`transition-transform p-1 ${readOnly ? 'cursor-default' : 'active:scale-95'}`}
                            >
                                <Star
                                    className={`w-10 h-10 transition-all ${star <= (hover || rating)
                                        ? 'fill-yellow-400 text-yellow-400 scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                                        : 'text-neutral-300 dark:text-neutral-700'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2 text-left">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Write a review (optional)</label>
                        <textarea
                            value={review}
                            onChange={(e) => !readOnly && setReview(e.target.value)}
                            readOnly={readOnly}
                            placeholder={readOnly ? "No review provided." : "What did you learn? How helpful was it?"}
                            className={`w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all min-h-[100px] resize-none ${readOnly ? 'cursor-default' : ''}`}
                        />
                    </div>

                    {!readOnly && (
                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0 || loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl py-4 font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    Submit Review
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
