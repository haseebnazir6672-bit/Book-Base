import express from 'express'
import {
  getProfile,
  updateProfile,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getDashboardStats,
  getLibrarians,
  blockStudent,
  unblockStudent,
  approveUser,
  rejectUser,
} from '../controllers/userController.js'
import { protect, adminOnly, adminOrLibrarian } from '../middleware/authMiddleware.js'
import { upload } from '../config/cloudinary.js'

const router = express.Router()

// -------- My Profile --------
// GET  /api/users/profile
router.get('/profile', protect, getProfile)
// PUT  /api/users/profile
router.put('/profile', protect, upload.single('profileImage'), updateProfile)

// GET /api/users/librarians (for students)
router.get('/librarians', protect, getLibrarians)

// -------- Admin: User Management --------
// POST /api/users/create     → Admin creates student, teacher, librarian
router.post('/create', protect, adminOnly, createUser)

// GET  /api/users            → Admin/Librarian lists users
router.get('/', protect, adminOrLibrarian, getUsers)

// PUT  /api/users/:id        → Admin updates any user
router.put('/:id', protect, adminOnly, updateUser)

// DELETE /api/users/:id      → Admin deletes any user
router.delete('/:id', protect, adminOnly, deleteUser)

// PUT /api/users/:id/block  → Admin blocks student
router.put('/:id/block', protect, adminOnly, blockStudent)

// PUT /api/users/:id/unblock → Admin unblocks student
router.put('/:id/unblock', protect, adminOnly, unblockStudent)

// PUT /api/users/:id/approve → Admin approves user
router.put('/:id/approve', protect, adminOnly, approveUser)

// PUT /api/users/:id/reject → Admin rejects user
router.put('/:id/reject', protect, adminOnly, rejectUser)

// GET  /api/users/stats      → Admin dashboard stats
router.get('/stats', protect, adminOnly, getDashboardStats)

export default router