import React, { useState } from 'react';
import { X } from 'lucide-react';
import { reviewService } from '../../services/review.service';
import RatingStars from './RatingStars';

interface WriteReviewModalProps {
    productId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
    productId,
    onClose,
    onSuccess,
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const userId = localStorage.getItem('USER_ID');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            setError('You must be logged in to review');
            return;
        }
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await reviewService.create({
                productId,
                userId,
                rating,
                comment,
            });
            onSuccess();
        } catch (err: any) {
            setError(err?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">Write a Review</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-gray-600 font-medium">Select Rating</span>
                        <RatingStars
                            rating={rating}
                            size={32}
                            interactive
                            onRatingChange={setRating}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Review
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                            placeholder="What did you like or dislike?"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WriteReviewModal;
