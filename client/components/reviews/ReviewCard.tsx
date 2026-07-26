'use client';

import { Avatar } from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/StarRating';
import { formatDate } from '@/lib/utils';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment?: string;
    images?: string[];
    createdAt: string;
    reviewer: {
      id: string;
      profile?: {
        fullName: string;
        avatarUrl?: string;
      };
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-card rounded-xl border p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <Avatar
          src={review.reviewer.profile?.avatarUrl}
          name={review.reviewer.profile?.fullName}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium truncate">{review.reviewer.profile?.fullName || 'Anonymous'}</h4>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(review.createdAt)}
            </span>
          </div>
          <StarRating rating={review.rating} size="sm" className="mt-1" />
          
          {review.comment && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {review.comment}
            </p>
          )}

          {review.images && review.images.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {review.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Review image ${i + 1}`}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
