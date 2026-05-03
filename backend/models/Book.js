import mongoose from 'mongoose'

const bookSchema = new mongoose.Schema(
  {
    bookId: { type: String, unique: true, sparse: true }, // Custom ID / Accession Number
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    department: { type: String, required: false, trim: true, default: '' },
    category: { type: String, required: true, trim: true },
    available: { type: Number, required: true, default: 0, min: 0 },
    totalCopies: { type: Number, default: 0, min: 0 },
    bookImage: { type: String, default: '' },
    bookPdf: { type: String, default: '' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shelf: { type: String, trim: true, default: '' },
    cell: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Book', bookSchema)
