import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/review.service';
import type { Review } from '../../types/review.types';
import WriteReviewModal from './WriteReviewModal';
import RatingStars from './RatingStars';
import { format } from 'date-fns';

interface ProductReviewsProps {
    productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadReviews();
    }, [productId]);

    const loadReviews = async () => {
        try {
            const response: any = await reviewService.getByProduct(productId);
            if (response && response.recordList) {
                setReviews(response.recordList);
            } else if (Array.isArray(response)) {
                setReviews(response);
            } else {
                setReviews([]);
            }
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-primary">
                    Reviews ({Array.isArray(reviews) ? reviews.length : 0})
                </h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                >
                    Write a Review
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-secondary/50">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                    <div className="text-center py-12 bg-primary/5 rounded-2xl">
                        <p className="text-secondary mb-2">No reviews yet</p>
                        <p className="text-sm text-secondary/50">Be the first to share your thoughts!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-background p-6 rounded-xl border border-primary/10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center font-bold text-secondary">
                                        U
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-primary">User</h4>
                                        <p className="text-xs text-secondary/50">
                                            {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <RatingStars rating={review.rating} size={16} />
                            </div>
                            <p className="text-secondary leading-relaxed">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <WriteReviewModal
                    productId={productId}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        loadReviews(); // Refresh list to verify it shows up (logic might need improvement if mod approval is required immediately, usually it's pending)
                    }}
                />
            )}
        </div>
    );
};

export default ProductReviews;
