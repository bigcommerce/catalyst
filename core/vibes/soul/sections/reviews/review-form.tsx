'use client';

import { clsx } from 'clsx';
import { Star } from 'lucide-react';
import { useState, useTransition } from 'react';

interface ReviewFormProps {
  productId: number;
  onSubmit: (data: ReviewFormData) => Promise<{ status: 'success' | 'error'; message: string }>;
  requireEmail?: boolean;
  labels: {
    title: string;
    ratingLabel: string;
    titleLabel: string;
    titlePlaceholder: string;
    reviewLabel: string;
    reviewPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    submitButton: string;
    submittingButton: string;
    cancelButton: string;
  };
  onCancel?: () => void;
}

export interface ReviewFormData {
  productEntityId: number;
  author: string;
  title: string;
  text: string;
  rating: number;
  email?: string;
}

export function ReviewForm({
  productId,
  onSubmit,
  requireEmail = false,
  labels,
  onCancel,
}: ReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    author: '',
    title: '',
    text: '',
    email: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Client-side validation
    if (rating === 0) {
      setMessage({ type: 'error', text: 'Please select a rating' });

      return;
    }

    if (!formData.author.trim()) {
      setMessage({ type: 'error', text: 'Please enter your name' });

      return;
    }

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a review title' });

      return;
    }

    if (!formData.text.trim()) {
      setMessage({ type: 'error', text: 'Please enter your review' });

      return;
    }

    if (requireEmail && !formData.email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email' });

      return;
    }

    startTransition(async () => {
      const result = await onSubmit({
        productEntityId: productId,
        author: formData.author,
        title: formData.title,
        text: formData.text,
        rating,
        ...(formData.email && { email: formData.email }),
      });

      setMessage({ type: result.status, text: result.message });

      if (result.status === 'success') {
        // Reset form on success
        setRating(0);
        setFormData({ author: '', title: '', text: '', email: '' });

        // Close form after 2 seconds
        if (onCancel) {
          setTimeout(() => {
            onCancel();
          }, 2000);
        }
      }
    });
  };

  return (
    <div className="rounded-xl border border-contrast-100 bg-background p-6 @xl:p-8">
      <h3 className="mb-6 text-xl font-medium">{labels.title}</h3>

      <form onSubmit={handleSubmit}>
        {/* Rating Input */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            {labels.ratingLabel}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                aria-label={`Rate ${star} out of 5 stars`}
              >
                <Star
                  className={clsx(
                    'h-8 w-8 transition-colors',
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-none text-contrast-300',
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Title */}
        <div className="mb-6">
          <label htmlFor="review-title" className="mb-2 block text-sm font-medium text-foreground">
            {labels.titleLabel}
          </label>
          <input
            id="review-title"
            type="text"
            className="w-full rounded-lg border border-contrast-200 bg-background px-4 py-3 text-foreground transition-colors focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder={labels.titlePlaceholder}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={isPending}
            required
          />
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <label htmlFor="review-text" className="mb-2 block text-sm font-medium text-foreground">
            {labels.reviewLabel}
          </label>
          <textarea
            id="review-text"
            rows={5}
            className="w-full rounded-lg border border-contrast-200 bg-background px-4 py-3 text-foreground transition-colors focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder={labels.reviewPlaceholder}
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            disabled={isPending}
            required
          />
        </div>

        {/* Author Name */}
        <div className="mb-6">
          <label htmlFor="review-author" className="mb-2 block text-sm font-medium text-foreground">
            {labels.nameLabel}
          </label>
          <input
            id="review-author"
            type="text"
            className="w-full rounded-lg border border-contrast-200 bg-background px-4 py-3 text-foreground transition-colors focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder={labels.namePlaceholder}
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            disabled={isPending}
            required
          />
        </div>

        {/* Email (optional or required based on store settings) */}
        {requireEmail && (
          <div className="mb-6">
            <label htmlFor="review-email" className="mb-2 block text-sm font-medium text-foreground">
              {labels.emailLabel}
            </label>
            <input
              id="review-email"
              type="email"
              className="w-full rounded-lg border border-contrast-200 bg-background px-4 py-3 text-foreground transition-colors focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder={labels.emailPlaceholder}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isPending}
              required
            />
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div
            className={clsx(
              'mb-6 rounded-lg p-4',
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800',
            )}
          >
            {message.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className={clsx(
              'rounded-full border border-foreground bg-foreground px-8 py-3 font-medium text-background transition-colors hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20',
              isPending && 'cursor-not-allowed opacity-50',
            )}
          >
            {isPending ? labels.submittingButton : labels.submitButton}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="rounded-full border border-contrast-200 px-8 py-3 font-medium text-foreground transition-colors hover:bg-contrast-100 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              {labels.cancelButton}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
