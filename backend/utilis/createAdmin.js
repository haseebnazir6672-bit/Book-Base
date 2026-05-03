import User from '../models/User.js'
import bcrypt from 'bcryptjs'

export const createAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com'
    const adminPassword = process.env.ADMIN_PASSWORD || '123456'

    let admin = await User.findOne({ role: 'admin' })

    const hash = await bcrypt.hash(adminPassword, 10)

    if (admin) {
      // If admin exists, check if email or password needs update
      const isPasswordMatch = await bcrypt.compare(adminPassword, admin.password)
      
      if (admin.email !== adminEmail || !isPasswordMatch) {
        admin.email = adminEmail
        admin.password = hash
        admin.name = 'Admin' // Ensure name is reset if needed
        await admin.save()
      } 
    } else {
      // Create new admin if none exists
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hash,
        role: 'admin'
      })
    }

  } catch (error) {
    // Error handling (silent)
  }
}