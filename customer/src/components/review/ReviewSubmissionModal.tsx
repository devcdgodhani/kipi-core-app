import React, { useState } from 'react';
import { Star, X, Loader2, Camera, ShieldCheck, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { reviewService } from '../../services/review.service';

interface ReviewSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    orderId: string;
    onSuccess: () => void;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
    isOpen,
    onClose,
    productId,
    productName,
    orderId,
    onSuccess
}) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please assign a neural score (Rating)');
            return;
        }
        if (comment.trim().length < 10) {
            toast.error('Feedback must be at least 10 characters');
            return;
        }

        try {
            setLoading(true);
            await reviewService.submit({
                productId,
                orderId,
                rating,
                comment
            });
            toast.success('Sentiment stored. Awaiting moderation.', {
                icon: '🚀',
                style: {
                    borderRadius: '1rem',
                    background: '#111',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '900',
                    textTransform: 'uppercase'
                }
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-background rounded-[2.5rem] shadow-2xl border border-primary/10 overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header Backdrop */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/5 to-transparent -z-0" />

                <div className="relative z-10 p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-emerald-500/20">
                                <ShieldCheck size={12} />
                                Verified Purchase Protocol
                            </div>
                            <h2 className="text-2xl font-black text-primary tracking-tight uppercase">Share Sentiment</h2>
                            <p className="text-sm text-secondary/50 font-medium">Rating: {productName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-primary/5 rounded-2xl transition-all text-secondary/50 hover:text-primary"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Star Rating Interface */}
                        <div className="flex flex-col items-center justify-center py-6 bg-primary/5 rounded-3xl border border-primary/10">
                            <span className="text-[10px] font-black text-secondary/50 uppercase tracking-widest mb-4">Neural Score</span>
                            <div className="flex items-center gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        className="transform transition-all active:scale-90"
                                    >
                                        <Star
                                            size={40}
                                            className={`transition-all duration-300 ${star <= (hover || rating)
                                                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] scale-110'
                                                : 'text-secondary/20 hover:text-secondary/40'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="mt-4 text-xs font-black text-primary/40 uppercase tracking-widest">
                                {rating === 5 ? 'Exceptional Build' :
                                    rating === 4 ? 'Premium Quality' :
                                        rating === 3 ? 'Standard Alignment' :
                                            rating === 2 ? 'Sub-optimal' :
                                                rating === 1 ? 'Critical Failure' : 'Awaiting Assessment'}
                            </p>
                        </div>

                        {/* Commentary */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-2">
                                <label className="text-[10px] font-black text-secondary/50 uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare size={12} />
                                    Commentary
                                </label>
                                <span className="text-[10px] font-bold text-secondary/20 uppercase">{comment.length}/2000</span>
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Describe your encounter with this product..."
                                className="w-full h-32 px-6 py-4 bg-primary/5 border border-primary/10 rounded-3xl text-sm font-medium focus:outline-none focus:ring-2 ring-primary/5 focus:bg-background transition-all resize-none placeholder:text-secondary/20 text-primary"
                                maxLength={2000}
                            />
                        </div>

                        {/* Media Upload Placeholder (Neural Placeholder) */}
                        <div className="flex items-center justify-center p-6 border-2 border-dashed border-primary/10 rounded-3xl bg-primary/5 group hover:border-primary/20 transition-all cursor-not-allowed">
                            <div className="flex flex-col items-center gap-2">
                                <Camera size={24} className="text-secondary/20 group-hover:text-primary/40 transition-colors" />
                                <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">Media Protocol Coming Soon</span>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 bg-primary/5 text-secondary rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 transition-all"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                disabled={loading || rating === 0}
                                className="flex-[2] flex items-center justify-center gap-3 py-4 bg-primary text-background rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/20"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Initialize Submission'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
