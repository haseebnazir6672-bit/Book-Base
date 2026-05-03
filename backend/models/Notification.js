import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['fine', 'overdue', 'general', 'return_reminder', 'borrow', 'warning'],
      default: 'general',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    borrowRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRecord' },
    fineAmount: { type: Number, default: 0 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default mongoose.model('Notification', notificationSchema)
