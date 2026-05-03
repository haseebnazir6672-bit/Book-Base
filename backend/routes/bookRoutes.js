import express from 'express'
import { protect, librarianOnly, adminOrLibrarian } from '../middleware/authMiddleware.js'
import { upload } from '../config/cloudinary.js'
import {
  addBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  getBookStats,
  bulkAddBooks
} from '../controllers/bookController.js'

const router = express.Router()

// Everyone authenticated can get books
router.get('/', protect, getBooks)
router.get('/:id', protect, getBook)

// Librarian or Admin
router.get('/stats/all', protect, adminOrLibrarian, getBookStats)
router.post('/', protect, adminOrLibrarian, upload.fields([{ name: 'bookImage', maxCount: 1 }, { name: 'bookPdf', maxCount: 1 }]), addBook)
router.post('/bulk', protect, adminOrLibrarian, bulkAddBooks)
router.put('/:id', protect, adminOrLibrarian, upload.fields([{ name: 'bookImage', maxCount: 1 }, { name: 'bookPdf', maxCount: 1 }]), updateBook)
router.delete('/:id', protect, adminOrLibrarian, deleteBook)

export default router
