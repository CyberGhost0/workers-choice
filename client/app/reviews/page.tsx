'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewSummary } from '@/components/reviews/ReviewSummary';
import { StarRating } from '@/components/ui/StarRating';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { MessageSquare } from 'lucide-react';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'given' | 'received'>('all');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      if (filter === 'given') {
        const res = await api.get('/reviews/my-reviews');
        setReviews(res.data.reviews);
      } else if (filter === 'received' && user) {
        const res = await api.get(`/reviews/user/${user.id}`);
        setReviews(res.data.reviews);
      } else {
        // For 'all', get received reviews if logged in
        if (user) {
          const res = await api.get(`/reviews/user/${user.id}`);
          setReviews(res.data.reviews);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Reviews
            </h1>
            <p className="text-muted-foreground mt-1">
              Reviews and feedback from the community
            </p>
          </div>

          {/* Filters */}
          {user && (
            <div className="flex gap-2 mb-6">
              {(['all', 'given', 'received'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground border'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)} Reviews
                </button>
              ))}
            </div>
          )}

          {/* Reviews List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl border p-6 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                      <div className="h-16 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-card rounded-xl border p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg">No reviews yet</h3>
              <p className="text-muted-foreground mt-2">
                {filter === 'given' 
                  ? "You haven't given any reviews yet"
                  : filter === 'received'
                  ? "You haven't received any reviews yet"
                  : "No reviews to display"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
