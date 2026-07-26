import { StarRating } from '@/components/ui/StarRating';

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: Record<number, number>;
}

export function ReviewSummary({ averageRating, totalReviews, ratingDistribution }: ReviewSummaryProps) {
  const distribution = ratingDistribution || {};
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="bg-card rounded-xl border p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Average Rating */}
        <div className="text-center sm:text-left">
          <p className="text-4xl font-bold">{averageRating.toFixed(1)}</p>
          <StarRating rating={averageRating} size="md" className="mt-1 justify-center sm:justify-start" />
          <p className="text-sm text-muted-foreground mt-1">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Distribution Bars */}
        {totalReviews > 0 && (
          <div className="flex-1 w-full space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-3">{stars}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
