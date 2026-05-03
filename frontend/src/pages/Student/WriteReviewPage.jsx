import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiArrowLeft, HiStar } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

function WriteReviewPage({ borrowedBooks, onAddReview }) {
  const navigate = useNavigate()

  const [selectedBook, setSelectedBook] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!selectedBook) {
      toast.error('Please select a book to review')
      return
    }

    if (rating === 0) {
      toast.error('Please provide a rating')
      return
    }

    if (!comment.trim()) {
      toast.error('Please write a review comment')
      return
    }

    // Call the parent function to save the review in state
    onAddReview({ book: selectedBook, rating, comment })
    
    toast.success('Thank you! Your review has been submitted.')
    navigate('/student/library')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-8">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <motion.button
            onClick={() => navigate('/student/library')}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-slate-700 shadow-sm transition hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <HiArrowLeft size={20} />
            Back to Library
          </motion.button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Write a Review
          </h1>
        </div>

        {/* Review Form */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Book Selection */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Select a Book You've Borrowed
              </label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">-- Choose a Book --</option>
                {borrowedBooks.map((book) => (
                  <option key={book.id || book._id} value={book.title}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <HiStar
                      size={32}
                      className={`transition ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                placeholder="What did you think of this book? Did it help with your studies?"
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Submit Review
              </button>
            </div>

          </form>
        </motion.article>

      </div>
    </div>
  )
}

export default WriteReviewPage
