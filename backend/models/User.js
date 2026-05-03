import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'student', 'teacher', 'librarian'],
      default: 'student',
    },
    // Student fields
    regNo: { type: String, trim: true },
    department: { type: String, trim: true },
    semester: { type: String, trim: true },
    // Teacher fields
    employeeId: { type: String, trim: true },
    designation: { type: String, trim: true },
    // Common
    phone: { type: String, trim: true },
    profileImage: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'active', 'inactive'], default: 'active' },
    isBlocked: { type: Boolean, default: false },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    blockedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)