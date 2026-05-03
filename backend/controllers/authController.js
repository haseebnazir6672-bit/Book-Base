import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Notification from '../models/Notification.js'

// ==================== REGISTER ====================
export const register = async (req, res) => {
  try {
    let { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Name, email, and password are required' })
    }

    email = email.trim().toLowerCase()

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ msg: 'User already exists with this email' })

    const hash = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hash,
      role: role || 'student',
      status: 'pending',
    })

    // Notify all admins about new pending user
    const admins = await User.find({ role: 'admin' })
    for (const admin of admins) {
      const notification = await Notification.create({
        recipient: admin._id,
        sender: user._id,
        type: 'warning',
        title: 'New User Registration',
        message: `A new user "${user.name}" has registered and is pending approval.`,
      })
      
      const populatedNotification = await notification.populate([
        { path: 'recipient', select: 'name email regNo' },
        { path: 'sender', select: 'name role' },
      ])

      if (req.io) {
        req.io.emit('send_private_notification', {
          recipientId: admin._id.toString(),
          notification: populatedNotification,
        })
      }
    }

    const { password: _, ...userData } = user.toObject()
    res.status(201).json(userData)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== LOGIN ====================
export const login = async (req, res) => {
  try {
    let { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' })
    }

    email = email.trim().toLowerCase()

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ msg: 'Invalid email or password' })

    if (user.status === 'inactive') {
      return res.status(403).json({ msg: 'Your account is inactive. Contact admin.' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ msg: 'Invalid email or password' })

    const token = jwt.sign(
      { id: user._id, role: user.role, scope: 'library' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const { password: _, ...userData } = user.toObject()

    // Emit real-time login event
    if (req.io) {
      req.io.emit('user_login', {
        userId: user._id,
        name: user.name,
        role: user.role,
        time: new Date()
      })
    }

    res.json({ token, user: userData })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}