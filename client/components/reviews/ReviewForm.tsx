'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/StarRating';
import { api } from '@/lib/api';
import { Loader2, Camera, X } from 'lucide-react';

interface ReviewFormProps {
  orderId: string;
  providerName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ orderId, providerName, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/reviews', {
        orderId,
        rating,
        comment,
      });
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-card rounded-xl border p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <h3 className="font-semibold text-lg">Review Submitted!</h3>
        <p className="text-muted-foreground mt-2">
          Thank you for reviewing {providerName}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Rate {providerName}</h3>
        {onCancel && (
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground mb-2">How was your experience?</p>
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onRate={setRating}
            className="justify-center"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Your review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others about your experience with this provider..."
            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[120px] resize-none"
            required
            minLength={10}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {comment.length}/500 characters (minimum 10)
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
