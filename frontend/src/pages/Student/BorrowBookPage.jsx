import { motion } from 'framer-motion'
import { HiArrowLeft, HiCheck, HiDocumentText } from 'react-icons/hi'
import BookCard from '../../components/common/BookCard'
import { reviews } from '../../data/mockData'

function BorrowBookPage({
  book,
  onConfirmBorrow,
  onBack,
  borrowedBooks,
}) {
  const alreadyBorrowed = borrowedBooks.some((item) => item.title === book.title)

  // Filter reviews for the current book
  const bookReviews = reviews.filter((review) => review.book === book.title)

  const handleConfirmBorrow = () => {
    if (!alreadyBorrowed) {
      onConfirmBorrow(book)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <motion.button
            onClick={onBack}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-slate-700 shadow-sm transition hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <HiArrowLeft size={20} />
            Back to Books
          </motion.button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Borrow Book Confirmation
          </h1>
        </div>

        {/* Book Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Book Details
            </h2>
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Book Card */}
              <div className="flex-1">
                <BookCard book={book} />
              </div>

              {/* Borrow Information */}
              <div className="flex-1 space-y-4">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Borrowing Information
                  </h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Book ID:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {book.bookId || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Borrow Date:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Due Date:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        3 days
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Due Soon (within 3 days)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-8"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Student Reviews
            </h2>
            <div className="space-y-4">
              {bookReviews.length > 0 ? (
                bookReviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-xl bg-slate-50 p-4 dark:bg-slate-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {review.reviewer}
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < Math.floor(review.rating)
                                ? 'text-yellow-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {review.comment}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400">
                    No reviews available for this book yet.
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Be the first to review after borrowing!
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col gap-4 sm:flex-row sm:justify-end"
        >
          <button
            onClick={onBack}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          {book.bookPdf && (
            <a
              href={book.bookPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-white transition hover:bg-emerald-700"
            >
              <HiDocumentText size={20} />
              Read Online
            </a>
          )}
          <button
            onClick={handleConfirmBorrow}
            disabled={alreadyBorrowed}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <HiCheck size={20} />
            {alreadyBorrowed ? 'Already Borrowed' : 'Confirm Borrow'}
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default BorrowBookPage