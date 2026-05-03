import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import Notification from '../models/Notification.js'

// ==================== GET MY PROFILE ====================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ msg: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== UPDATE MY PROFILE ====================
export const updateProfile = async (req, res) => {
  try {
    console.log('Update Profile Request Received');
    console.log('User ID from Token:', req.user?.id);
    console.log('Body Data:', req.body);
    console.log('File Data:', req.file);

    const user = await User.findById(req.user.id)
    if (!user) {
      console.log('User not found in DB');
      return res.status(404).json({ msg: 'User not found' })
    }

    const { name, regNo, semester, phone, password } = req.body
    
    user.name = name || user.name
    user.regNo = regNo || user.regNo
    user.semester = semester || user.semester
    user.phone = phone || user.phone

    // Handle password update
    if (password && password.trim() !== '') {
      console.log('Hashing new password for user profile update');
      user.password = await bcrypt.hash(password, 10)
    }

    // Handle profile image update if a file was uploaded
    if (req.file && req.file.path) {
      console.log('New Profile Image Path:', req.file.path);
      user.profileImage = req.file.path
    }

    const updated = await user.save()
    console.log('User updated successfully');
    
    const { password: _, ...userData } = updated.toObject()
    res.json(userData)
  } catch (err) {
    console.error('CRITICAL ERROR in updateProfile:', err);
    res.status(500).json({ msg: err.message || 'Server Error during profile update' })
  }
}

// ==================== ADMIN: CREATE USER (student / teacher / librarian) ====================
export const createUser = async (req, res) => {
  try {
    const {
      name, email, password, role,
      department, semester, phone,
      regNo, employeeId, designation, status
    } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'Name, email, password, and role are required' })
    }

    const allowedRoles = ['student', 'teacher', 'librarian']
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ msg: 'Role must be student, teacher, or librarian' })
    }

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ msg: 'User already exists with this email' })

    const hash = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hash,
      role,
      department,
      semester,
      phone,
      regNo,
      employeeId,
      designation,
      status: status || 'active',
      createdBy: req.user.id,
    })

    const { password: _, ...userData } = user.toObject()
    res.status(201).json({ msg: `${role} created successfully`, user: userData })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== ADMIN: GET ALL USERS (by role) ====================
export const getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query

    const filter = {}
    if (role) filter.role = role
    if (status) filter.status = status

    if (search) {
      const q = new RegExp(search, 'i')
      filter.$or = [
        { name: q }, { email: q }, { regNo: q },
        { employeeId: q }, { department: q }, { designation: q }
      ]
    }

    // Never return admin accounts in listing
    filter.role = filter.role || { $ne: 'admin' }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== GET LIBRARIANS (for students to message) ====================
export const getLibrarians = async (req, res) => {
  try {
    const librarians = await User.find({ role: 'librarian', status: 'active' }).select('name email')
    res.json(librarians)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== ADMIN: UPDATE USER ====================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name, email, password, department, semester, phone,
      regNo, employeeId, designation, status
    } = req.body

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ msg: 'User not found' })

    if (user.role === 'admin') {
      return res.status(403).json({ msg: 'Cannot modify admin account' })
    }

    user.name = name || user.name
    user.email = email || user.email
    user.department = department !== undefined ? department : user.department
    user.semester = semester !== undefined ? semester : user.semester
    user.phone = phone !== undefined ? phone : user.phone
    user.regNo = regNo !== undefined ? regNo : user.regNo
    user.employeeId = employeeId !== undefined ? employeeId : user.employeeId
    user.designation = designation !== undefined ? designation : user.designation
    user.status = status || user.status

    if (password) {
      user.password = await bcrypt.hash(password, 10)
    }

    const updated = await user.save()
    const { password: _, ...userData } = updated.toObject()
    res.json({ msg: 'User updated successfully', user: userData })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== ADMIN: DELETE USER ====================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ msg: 'User not found' })
    if (user.role === 'admin') return res.status(403).json({ msg: 'Cannot delete admin account' })

    await user.deleteOne()
    res.json({ msg: 'User deleted successfully' })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== ADMIN: BLOCK STUDENT ====================
export const blockStudent = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)

    if (!user) return res.status(404).json({ msg: 'User not found' })
    if (user.role !== 'student') return res.status(400).json({ msg: 'Only students can be blocked' })
    if (user.isBlocked) return res.status(400).json({ msg: 'Student is already blocked' })

    user.isBlocked = true
    user.blockedBy = req.user.id
    user.blockedAt = new Date()
    await user.save()

    const { password: _, ...userData } = user.toObject()
    res.json({ msg: 'Student blocked successfully', user: userData })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== ADMIN: UNBLOCK STUDENT ====================
export const unblockStudent = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)

    if (!user) return res.status(404).json({ msg: 'User not found' })
    if (user.role !== 'student') return res.status(400).json({ msg: 'Only students can be unblocked' })
    if (!user.isBlocked) return res.status(400).json({ msg: 'Student is not blocked' })

    user.isBlocked = false
    user.blockedBy = null
    user.blockedAt = null
    await user.save()

    const { password: _, ...userData } = user.toObject()
    res.json({ msg: 'Student unblocked successfully', user: userData })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== ADMIN: APPROVE USER ====================
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ msg: 'User not found' })
    if (user.role === 'admin') return res.status(403).json({ msg: 'Cannot modify admin account' })
    
    user.status = 'active'
    await user.save()
    
    // Create notification for the approved user
    const notification = await Notification.create({
      recipient: id,
      sender: req.user.id,
      type: 'general',
      title: 'Account Approved!',
      message: `Your account has been approved! You can now log in to the library system.`,
    })

    // Populate notification for socket
    const populatedNotification = await notification.populate([
      { path: 'recipient', select: 'name email regNo' },
      { path: 'sender', select: 'name role' },
    ])

    // Emit socket event
    if (req.io) {
      req.io.emit('send_private_notification', {
        recipientId: id,
        notification: populatedNotification,
      })
    }
    
    const { password: _, ...userData } = user.toObject()
    res.json({ msg: 'User approved successfully', user: userData })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== ADMIN: REJECT USER ====================
export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ msg: 'User not found' })
    if (user.role === 'admin') return res.status(403).json({ msg: 'Cannot modify admin account' })
    
    user.status = 'inactive'
    await user.save()
    
    // Create notification for the rejected user
    const notification = await Notification.create({
      recipient: id,
      sender: req.user.id,
      type: 'warning',
      title: 'Account Rejected',
      message: `Your account has been rejected. Please contact the admin for more information.`,
    })

    // Populate notification for socket
    const populatedNotification = await notification.populate([
      { path: 'recipient', select: 'name email regNo' },
      { path: 'sender', select: 'name role' },
    ])

    // Emit socket event
    if (req.io) {
      req.io.emit('send_private_notification', {
        recipientId: id,
        notification: populatedNotification,
      })
    }
    
    const { password: _, ...userData } = user.toObject()
    res.json({ msg: 'User rejected successfully', user: userData })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// ==================== ADMIN: GET DASHBOARD STATS ====================
export const getDashboardStats = async (req, res) => {
  try {
    const [students, teachers, librarians, pendingUsers] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'librarian' }),
      User.countDocuments({ status: 'pending' }),
    ])
    res.json({ students, teachers, librarians, pendingUsers })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}