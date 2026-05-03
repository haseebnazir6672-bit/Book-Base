import express from 'express'
import { protect, librarianOnly, studentOnly, adminOrLibrarian } from '../middleware/authMiddleware.js'
import {
  borrowBook,
  returnBook,
  getBorrowRecords,
  getMyBorrowedBooks,
  getBorrowStats,
  studentBorrowBook,
  deleteBorrowRecord,
  checkOverdueAndBlock,
  markFineAsPaid
} from '../controllers/borrowController.js'

const router = express.Router()

// ---------- Librarian/Admin ----------
// POST /api/borrow/check-overdue  -> Check overdue and auto-block students
router.post('/check-overdue', protect, adminOrLibrarian, checkOverdueAndBlock)

// POST /api/borrow/issue        -> Librarian issues book
router.post('/issue', protect, librarianOnly, borrowBook)

// PUT  /api/borrow/return/:id   -> Librarian marks book as returned (and computes fine)
router.put('/return/:id', protect, librarianOnly, returnBook)

// PUT  /api/borrow/:id/mark-paid -> Librarian marks fine as paid
router.put('/:id/mark-paid', protect, adminOrLibrarian, markFineAsPaid)

// DELETE /api/borrow/:id        -> Librarian deletes borrow record
router.delete('/:id', protect, librarianOnly, deleteBorrowRecord)

// GET  /api/borrow              -> Librarian views all borrow records
router.get('/', protect, adminOrLibrarian, getBorrowRecords)

// GET  /api/borrow/stats        -> Librarian views stats (total, active, returned, overdue)
router.get('/stats', protect, adminOrLibrarian, getBorrowStats)

// ---------- Student ----------
// GET  /api/borrow/my-books     -> Student views their borrowed books
router.get('/my-books', protect, studentOnly, getMyBorrowedBooks)

// POST /api/borrow/student-borrow -> Student borrows book
router.post('/student-borrow', protect, studentOnly, studentBorrowBook)

export default router
