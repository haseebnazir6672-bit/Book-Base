import mongoose from 'mongoose'

const borrowRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String }, // For direct reference in DB
    regNo: { type: String },      // For direct reference in DB
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowedAt: { type: Date, default: Date.now },
    returnedAt: { type: Date, default: null },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['borrowed', 'returned', 'overdue'],
      default: 'borrowed',
    },
    fine: { type: Number, default: 0 },
    finePaid: { type: Boolean, default: false },
    finePaidAt: { type: Date },
    finePaidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // librarian
  },
  { timestamps: true }
)

// Virtual: daysBorrowed
borrowRecordSchema.virtual('daysBorrowed').get(function () {
  const end = this.returnedAt || new Date()
  const diff = Math.floor((end - this.borrowedAt) / (1000 * 60 * 60 * 24))
  return diff
})

borrowRecordSchema.set('toJSON', { virtuals: true })
borrowRecordSchema.set('toObject', { virtuals: true })

export default mongoose.model('BorrowRecord', borrowRecordSchema)
