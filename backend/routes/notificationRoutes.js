import express from 'express'
import { protect, librarianOnly, adminOrLibrarian } from '../middleware/authMiddleware.js'
import {
  sendFineNotification,
  sendNotification,
  sendBulkFineNotifications,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getAllNotifications,
  getUnreadCount,
  sendMessageToLibrarian,
  deleteNotification,
} from '../controllers/notificationController.js'

const router = express.Router()

// ---------- Student / User ----------
router.get('/my-notifications', protect, getMyNotifications)
router.get('/unread-count', protect, getUnreadCount)
router.put('/read/:id', protect, markAsRead)
router.put('/read-all', protect, markAllAsRead)
router.post('/send-to-librarian', protect, sendMessageToLibrarian)
router.delete('/:id', protect, deleteNotification)

// ---------- Librarian / Admin ----------
// POST /api/notifications/fine      -> Librarian sends single fine notice
router.post('/fine', protect, librarianOnly, sendFineNotification)

// POST /api/notifications/general   -> Librarian/Admin sends general notice
router.post('/general', protect, adminOrLibrarian, sendNotification)

// POST /api/notifications/bulk-fine -> Librarian triggers auto-fine notices for all overdue
router.post('/bulk-fine', protect, librarianOnly, sendBulkFineNotifications)

// GET  /api/notifications/all       -> Librarian views all sent notifications
router.get('/all', protect, adminOrLibrarian, getAllNotifications)

export default router
