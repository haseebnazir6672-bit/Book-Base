import mongoose from 'mongoose'
import KnowledgePost from '../models/KnowledgePost.js'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

const parseAttachments = (attachments) => {
  if (!Array.isArray(attachments)) return []
  return attachments
    .map((item) => ({
      url: String(item?.url || '').trim(),
      kind: item?.kind,
    }))
    .filter((item) => item.url && ['image', 'video', 'document'].includes(item.kind))
}

const inferAttachmentKind = (mimetype = '') => {
  if (mimetype.startsWith('image/')) return 'image'
  if (mimetype.startsWith('video/')) return 'video'
  return 'document'
}

export const uploadHubAttachments = async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : []
    const uploaded = files.map((file) => ({
      url: file.path,
      kind: inferAttachmentKind(file.mimetype),
      originalName: file.originalname,
    }))
    res.status(201).json({ attachments: uploaded })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const createHubPost = async (req, res) => {
  try {
    const { title, body, department, contentType, attachments } = req.body

    if (!title || !body || !department || !contentType) {
      return res.status(400).json({ msg: 'Title, body, department and type are required' })
    }

    const post = await KnowledgePost.create({
      author: req.user.id,
      title,
      body,
      department,
      contentType,
      attachments: parseAttachments(attachments),
    })

    const populated = await KnowledgePost.findById(post._id).populate('author', 'name email role department')
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const listHubPosts = async (req, res) => {
  try {
    const { department, type, search = '', page = 1, limit = 12 } = req.query
    const safePage = Math.max(1, Number(page) || 1)
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 12))

    const filter = { status: 'active' }
    if (department) filter.department = department
    if (type) filter.contentType = type

    const q = String(search).trim()
    if (q) {
      const regex = new RegExp(q, 'i')
      filter.$or = [{ title: regex }, { body: regex }, { department: regex }, { contentType: regex }]
    }

    const [items, total] = await Promise.all([
      KnowledgePost.find(filter)
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .populate('author', 'name email role department')
        .populate('comments.user', 'name role'),
      KnowledgePost.countDocuments(filter),
    ])

    res.json({
      items,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const toggleHubPostLike = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'Invalid post id' })

    const post = await KnowledgePost.findById(id)
    if (!post || post.status !== 'active') return res.status(404).json({ msg: 'Post not found' })

    const userId = String(req.user.id)
    const existingIndex = post.likes.findIndex((uid) => String(uid) === userId)

    if (existingIndex >= 0) post.likes.splice(existingIndex, 1)
    else post.likes.push(req.user.id)

    await post.save()
    res.json({ likes: post.likes.length, liked: existingIndex < 0 })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const addHubPostComment = async (req, res) => {
  try {
    const { id } = req.params
    const { text } = req.body
    if (!text || !text.trim()) return res.status(400).json({ msg: 'Comment text is required' })
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'Invalid post id' })

    const post = await KnowledgePost.findById(id)
    if (!post || post.status !== 'active') return res.status(404).json({ msg: 'Post not found' })

    post.comments.unshift({ user: req.user.id, text: text.trim() })
    await post.save()

    const populated = await KnowledgePost.findById(post._id)
      .populate('author', 'name email role department')
      .populate('comments.user', 'name role')

    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const removeHubPost = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'Invalid post id' })

    const post = await KnowledgePost.findById(id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    const isOwner = String(post.author) === String(req.user.id)
    const isAdmin = req.user.role === 'admin'
    if (!isOwner && !isAdmin) return res.status(403).json({ msg: 'You can only remove your own posts' })

    await post.deleteOne()
    res.json({ msg: 'Post removed successfully' })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const moderateHubPost = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'Invalid post id' })
    if (!['active', 'removed'].includes(status)) {
      return res.status(400).json({ msg: 'Status must be active or removed' })
    }

    const post = await KnowledgePost.findById(id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    post.status = status
    post.moderatedBy = req.user.id
    post.moderatedAt = new Date()
    await post.save()

    const populated = await KnowledgePost.findById(post._id).populate('author', 'name email role department')
    res.json(populated)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const getHubAdminSummary = async (_req, res) => {
  try {
    const [total, active, removed] = await Promise.all([
      KnowledgePost.countDocuments(),
      KnowledgePost.countDocuments({ status: 'active' }),
      KnowledgePost.countDocuments({ status: 'removed' }),
    ])
    res.json({ totalPosts: total, activePosts: active, removedPosts: removed })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const listHubUsers = async (_req, res) => {
  try {
    const users = await User.find({ role: { $in: ['student', 'teacher', 'librarian'] } })
      .select('-password')
      .sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const createHubUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role = 'student', department = '' } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Name, email and password are required' })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const universityDomain = (process.env.UNIVERSITY_EMAIL_DOMAIN || 'university.edu').toLowerCase()
    if (!normalizedEmail.endsWith(`@${universityDomain}`)) {
      return res.status(403).json({ msg: `Only @${universityDomain} users can be added` })
    }

    const exists = await User.findOne({ email: normalizedEmail })
    if (exists) return res.status(400).json({ msg: 'User already exists with this email' })

    const safeRole = ['student', 'teacher', 'librarian'].includes(role) ? role : 'student'
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hash,
      role: safeRole,
      department,
      createdBy: req.user.id,
    })
    const { password: _, ...userData } = user.toObject()
    res.status(201).json(userData)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const removeHubUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'Invalid user id' })

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ msg: 'User not found' })
    if (user.role === 'admin') return res.status(403).json({ msg: 'Cannot remove admin account' })

    await user.deleteOne()
    res.json({ msg: 'User removed from institute access' })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const getHubUserProfile = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'Invalid user id' })

    const user = await User.findById(id).select('-password')
    if (!user) return res.status(404).json({ msg: 'User not found' })

    res.json(user)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const updateHubUserProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' })

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ msg: 'User not found' })

    user.profileImage = req.file.path
    await user.save()

    const { password: _, ...userData } = user.toObject()
    res.json(userData)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const getHubUserLikedPosts = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'Invalid user id' })

    const posts = await KnowledgePost.find({
      likes: id,
      status: 'active'
    })
      .sort({ createdAt: -1 })
      .populate('author', 'name email role department')
      .populate('comments.user', 'name role')

    res.json({ items: posts })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}
