import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import { createAdmin } from './utilis/createAdmin.js'
import { checkOverdueAndBlock } from './controllers/borrowController.js'

import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import borrowRoutes from './routes/borrowRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import knowledgeHubAuthRoutes from './routes/knowledgeHubAuthRoutes.js'
import knowledgeHubRoutes from './routes/knowledgeHubRoutes.js'

dotenv.config()

const app = express()

// ================= MIDDLEWARE =================
app.use(cors({
  origin: 'https://book-base-rust.vercel.app',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ================= ROUTES =================
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/borrow', borrowRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/hub/auth', knowledgeHubAuthRoutes)
app.use('/api/hub', knowledgeHubRoutes)

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err)

  if (err.name === 'MulterError') {
    return res.status(400).json({ msg: `Upload Error: ${err.message}` })
  }

  res.status(err.status || 500).json({
    msg: err.message || 'Internal Server Error'
  })
})

// ================= START SERVER =================
const PORT = process.env.PORT || 5000

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)

  try {
    await connectDB()
    console.log("DB Connected")

    await createAdmin()
    console.log("Admin checked/created")

    // Initial overdue check
    await checkOverdueAndBlock()

    // Run every hour
    setInterval(async () => {
      console.log('Running scheduled overdue check...')
      await checkOverdueAndBlock()
    }, 60 * 60 * 1000)

  } catch (err) {
    console.error("Startup error:", err)
  }
})