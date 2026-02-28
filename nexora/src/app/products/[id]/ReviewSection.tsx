"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user?: { id: string; name: string; image: string | null } | null;
}

interface Props {
  productId: string;
  reviews: Review[];
  avgRating: number;
}

export default function ReviewSection({ productId, reviews: initialReviews, avgRating }: Props) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setReviews([data.data, ...reviews]);
      setComment("");
      setRating(5);
      setSuccess("Review submitted!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">
        Reviews ({reviews.length})
        <span className="ml-2 text-lg font-normal text-yellow-400">★ {avgRating.toFixed(1)}</span>
      </h2>

      {/* Write review form */}
      {session?.user && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
          <h3 className="font-semibold">Write a Review</h3>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl transition ${star <= rating ? "text-yellow-400" : "text-slate-600"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
            rows={3}
            required
            minLength={5}
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-400">{success}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {/* Review list */}
      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <p className="text-slate-400">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
                    {review.user?.name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{review.user?.name || "Anonymous"}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-xs ${star <= review.rating ? "text-yellow-400" : "text-slate-600"}`}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
