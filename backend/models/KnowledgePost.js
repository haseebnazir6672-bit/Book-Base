import mongoose from 'mongoose'

const knowledgeCommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 800 },
  },
  { timestamps: true }
)

const knowledgeAttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    kind: { type: String, enum: ['image', 'video', 'document'], required: true },
  },
  { _id: false }
)

const knowledgePostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    department: { type: String, required: true, trim: true },
    contentType: {
      type: String,
      enum: ['project', 'research_paper', 'image', 'video', 'post'],
      required: true,
    },
    attachments: { type: [knowledgeAttachmentSchema], default: [] },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: { type: [knowledgeCommentSchema], default: [] },
    status: { type: String, enum: ['active', 'removed'], default: 'active' },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
  },
  { timestamps: true }
)

export default mongoose.model('KnowledgePost', knowledgePostSchema)
