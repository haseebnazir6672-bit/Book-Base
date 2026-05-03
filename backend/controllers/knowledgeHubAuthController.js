import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const buildHubToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, scope: 'knowledge_hub' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

export const registerHubUser = async (req, res) => {
  try {
    let { name, email, password, role, department, regNo, employeeId, semester, designation, phone } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'Name, email, password, and role are required' })
    }

    const allowedRoles = ['student', 'teacher']
    const safeRole = allowedRoles.includes(role) ? role : 'student'

    if (safeRole === 'student' && !regNo) {
      return res.status(400).json({ msg: 'Roll number is required for students' })
    }
    if (safeRole === 'teacher' && !employeeId) {
      return res.status(400).json({ msg: 'Employee ID is required for teachers' })
    }

    email = email.trim().toLowerCase()
    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ msg: 'User already exists with this email' })
    }

    const hash = await bcrypt.hash(password, 10)

    const userData = {
      name,
      email,
      password: hash,
      role: safeRole,
      status: 'pending',
      department: department?.trim() || '',
    }

    if (safeRole === 'student') {
      userData.regNo = regNo?.trim() || ''
      userData.semester = semester?.trim() || ''
    } else if (safeRole === 'teacher') {
      userData.employeeId = employeeId?.trim() || ''
      userData.designation = designation?.trim() || ''
    }

    if (phone) {
      userData.phone = phone?.trim() || ''
    }

    const user = await User.create(userData)

    const { password: _, ...userWithoutPassword } = user.toObject()
    res.status(201).json({ user: userWithoutPassword, msg: 'Registration submitted successfully! Your account is pending admin approval.' })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const loginHubUser = async (req, res) => {
  try {
    let { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' })
    }

    email = email.trim().toLowerCase()

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ msg: 'Invalid email or password' })
    
    if (user.status === 'pending') {
      return res.status(403).json({ msg: 'Your account is pending admin approval. Please wait for verification.' })
    }
    
    if (user.status === 'inactive') {
      return res.status(403).json({ msg: 'Your account is inactive. Contact admin.' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ msg: 'Invalid email or password' })

    const token = buildHubToken(user)
    const { password: _, ...userData } = user.toObject()
    res.json({ token, user: userData })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}
