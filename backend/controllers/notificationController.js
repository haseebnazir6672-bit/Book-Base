import Notification from '../models/Notification.js'
import User from '../models/User.js'
import BorrowRecord from '../models/BorrowRecord.js'

function calculateFine(daysBorrowed, dueDate) {
  let overdueDays = 0
  if (dueDate) {
    overdueDays = Math.max(0, Math.floor((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24)))
  } else {
    overdueDays = Math.max(0, daysBorrowed - 7)
  }
  return overdueDays * 100
}

// ==================== SEND FINE NOTIFICATION (Librarian -> Student) ====================
export const sendFineNotification = async (req, res) => {
  try {
    const { recipientId, borrowRecordId, message, fineAmount, title } = req.body

    if (!recipientId || !message) {
      return res.status(400).json({ msg: 'Recipient and message are required' })
    }

    const recipient = await User.findById(recipientId)
    if (!recipient) return res.status(404).json({ msg: 'Student not found' })

    const notification = await Notification.create({
      recipient: recipientId,
      sender: req.user.id,
      type: 'fine',
      title: title || 'Library Fine Notice',
      message,
      borrowRecord: borrowRecordId || null,
      fineAmount: fineAmount || 0,
    })

    const populated = await notification.populate([
      { path: 'recipient', select: 'name email regNo' },
      { path: 'sender', select: 'name role' },
    ])

    res.status(201).json({ msg: 'Fine notification sent successfully', notification: populated })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== SEND GENERAL / OVERDUE NOTIFICATION ====================
export const sendNotification = async (req, res) => {
  try {
    const { recipientId, title, message, type, borrowRecordId, fineAmount } = req.body

    if (!recipientId || !title || !message) {
      return res.status(400).json({ msg: 'Recipient, title, and message are required' })
    }

    const notification = await Notification.create({
      recipient: recipientId,
      sender: req.user.id,
      type: type || 'general',
      title,
      message,
      borrowRecord: borrowRecordId || null,
      fineAmount: fineAmount || 0,
    })

    const populated = await notification.populate([
      { path: 'recipient', select: 'name email regNo' },
      { path: 'sender', select: 'name role' },
    ])

    // Emit real-time socket event if io is available
    if (req.io) {
      req.io.emit('send_private_notification', {
        recipientId: recipientId,
        notification: populated
      });
    }

    res.status(201).json({ msg: 'Notification sent', notification: populated })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== SEND MESSAGE TO LIBRARIAN (Student -> Librarian) ====================
export const sendMessageToLibrarian = async (req, res) => {
  try {
    const { librarianId, title, message } = req.body

    if (!librarianId || !title || !message) {
      return res.status(400).json({ msg: 'Librarian, title, and message are required' })
    }

    const librarian = await User.findById(librarianId)
    if (!librarian || librarian.role !== 'librarian') {
      return res.status(404).json({ msg: 'Librarian not found' })
    }

    const notification = await Notification.create({
      recipient: librarianId,
      sender: req.user.id,
      type: 'general',
      title: title || 'Message from Student',
      message,
    })

    const populated = await notification.populate([
      { path: 'recipient', select: 'name email' },
      { path: 'sender', select: 'name role email regNo' },
    ])

    // Emit socket event to the librarian
    if (req.io) {
      req.io.emit('send_private_notification', {
        recipientId: librarianId,
        notification: populated
      });
    }

    res.status(201).json({ msg: 'Message sent to librarian', notification: populated })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== AUTO-SEND FINE NOTICES FOR ALL OVERDUE ====================
export const sendBulkFineNotifications = async (req, res) => {
  try {
    const activeBorrows = await BorrowRecord.find({ status: 'borrowed' })
      .populate('student', 'name email regNo')
      .populate('book', 'title')

    const overdueRecords = activeBorrows.filter(r => {
      const days = Math.floor((new Date() - r.borrowedAt) / (1000 * 60 * 60 * 24))
      return days >= 2
    })

    if (!overdueRecords.length) {
      return res.json({ msg: 'No overdue records found', sent: 0 })
    }

    const notifications = []
    for (const record of overdueRecords) {
      const days = Math.floor((new Date() - record.borrowedAt) / (1000 * 60 * 60 * 24))
      const fine = calculateFine(days)

      // Avoid duplicate notifications per day
      const alreadySent = await Notification.findOne({
        recipient: record.student._id,
        borrowRecord: record._id,
        type: 'fine',
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      })

      if (!alreadySent) {
        const notif = await Notification.create({
          recipient: record.student._id,
          sender: req.user.id,
          type: 'fine',
          title: 'Library Fine Notice',
          message: `You have an overdue book: "${record.book?.title}". You have held it for ${days} day(s). Fine: PKR ${fine}. Please return it as soon as possible.`,
          borrowRecord: record._id,
          fineAmount: fine,
        })
        notifications.push(notif)
      }
    }

    res.json({
      msg: `Fine notifications sent to ${notifications.length} student(s)`,
      sent: notifications.length,
    })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== GET MY NOTIFICATIONS (Student) ====================
export const getMyNotifications = async (req, res) => {
  try {
    // Fetch notifications where the user is either the recipient OR the sender
    const notifications = await Notification.find({
      $or: [{ recipient: req.user.id }, { sender: req.user.id }]
    })
      .populate('sender', 'name role')
      .populate('recipient', 'name role')
      .populate('borrowRecord')
      .sort({ createdAt: -1 })

    res.json(notifications)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== MARK NOTIFICATION AS READ ====================
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
    if (!notification) return res.status(404).json({ msg: 'Notification not found' })

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' })
    }

    notification.isRead = true
    await notification.save()
    res.json({ msg: 'Marked as read', notification })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== MARK ALL AS READ ====================
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    )
    res.json({ msg: 'All notifications marked as read' })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== GET ALL NOTIFICATIONS (Librarian/Admin) ====================
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('recipient', 'name email regNo')
      .populate('sender', 'name role')
      .sort({ createdAt: -1 })
      .limit(100)

    res.json(notifications)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== GET UNREAD COUNT ====================
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user.id, isRead: false })
    res.json({ unread: count })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== DELETE NOTIFICATION ====================
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
    if (!notification) return res.status(404).json({ msg: 'Notification not found' })

    // Only recipient can delete or librarian/admin can delete any
    if (
      notification.recipient.toString() !== req.user.id &&
      req.user.role !== 'librarian' &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ msg: 'Unauthorized to delete this notification' })
    }

    await Notification.findByIdAndDelete(req.params.id)
    res.json({ msg: 'Notification deleted successfully' })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}
