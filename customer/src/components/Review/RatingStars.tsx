import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
    rating: number;
    max?: number;
    size?: number;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    max = 5,
    size = 16,
    interactive = false,
    onRatingChange,
}) => {
    const stars = [];

    for (let i = 1; i <= max; i++) {
        const isFull = i <= rating;
        const isHalf = !isFull && i - 0.5 <= rating;

        stars.push(
            <button
                key={i}
                type="button"
                disabled={!interactive}
                onClick={() => interactive && onRatingChange?.(i)}
                className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            >
                {isFull ? (
                    <Star size={size} className="fill-yellow-400 text-yellow-400" />
                ) : isHalf ? (
                    <StarHalf size={size} className="fill-yellow-400 text-yellow-400" />
                ) : (
                    <Star size={size} className="text-gray-300" />
                )}
            </button>
        );
    }

    return <div className="flex gap-1">{stars}</div>;
};

export default RatingStars;
