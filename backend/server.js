import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import { createAdmin } from './utilis/createAdmin.js'
import http from 'http'
import { Server } from 'socket.io'
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

// ✅ Create server FIRST
const server = http.createServer(app)

// ✅ Socket setup
const io = new Server(server, {
  cors: {
    origin: "https://book-base-rust.vercel.app",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io
  next()
})

// ================= SOCKET =================
const onlineUsers = new Map()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.emit('online_users_update', Array.from(onlineUsers.values()))

  socket.on('user_online', (data) => {
    onlineUsers.set(socket.id, data)
    io.emit('online_users_update', Array.from(onlineUsers.values()))
  })

  socket.on('borrow_book', (data) => {
    socket.broadcast.emit('book_status_update', data)
  })

  socket.on('new_book_added', () => {
    io.emit('refresh_books')
  })

  socket.on('send_private_notification', (data) => {
    for (const [sid, user] of onlineUsers.entries()) {
      if (user.id === data.recipientId) {
        io.to(sid).emit('new_notification', data.notification)
      }
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    onlineUsers.delete(socket.id)
    io.emit('online_users_update', Array.from(onlineUsers.values()))
  })
})

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
// ✅ ONLY use Render port
const PORT = process.env.PORT

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)

  try {
    await connectDB()
    console.log("DB Connected")

    await createAdmin()
    console.log("Admin checked/created")

    // Initial overdue check
    await checkOverdueAndBlock({ io }, null)

    // Run every hour
    setInterval(async () => {
      console.log('Running scheduled overdue check...')
      await checkOverdueAndBlock({ io }, null)
    }, 60 * 60 * 1000)

  } catch (err) {
    console.error("Startup error:", err)
  }
})