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

// Connect to Database
await connectDB()

// Create Admin Account if not exists
await createAdmin()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  }
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Make io accessible to all routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Scheduled job to check overdue books every hour
setInterval(async () => {
  console.log('Running scheduled overdue check...')
  try {
    await checkOverdueAndBlock({ io }, null)
    console.log('Scheduled overdue check completed')
  } catch (err) {
    console.error('Error in scheduled overdue check:', err)
  }
}, 60 * 60 * 1000) // Run every hour (3600000 ms)

// Run once on server start
console.log('Running initial overdue check...')
try {
  await checkOverdueAndBlock({ io }, null)
  console.log('Initial overdue check completed')
} catch (err) {
  console.error('Error in initial overdue check:', err)
}

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Send current online users to the newly connected user
  socket.emit('online_users_update', Array.from(onlineUsers.values()));
  
  socket.on('user_online', (data) => {
    onlineUsers.set(socket.id, data);
    io.emit('online_users_update', Array.from(onlineUsers.values()));
  });

  socket.on('borrow_book', (data) => {
    // Broadcast to ALL OTHER connected clients
    socket.broadcast.emit('book_status_update', data);
  });

  socket.on('new_book_added', (data) => {
    // Broadcast to everyone that a new book is available
    io.emit('refresh_books');
  });

  socket.on('send_private_notification', (data) => {
    // Find the recipient's socket(s)
    for (const [sid, user] of onlineUsers.entries()) {
      if (user.id === data.recipientId) {
        io.to(sid).emit('new_notification', data.notification);
      }
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    onlineUsers.delete(socket.id);
    io.emit('online_users_update', Array.from(onlineUsers.values()));
  });
});

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/borrow', borrowRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/hub/auth', knowledgeHubAuthRoutes)
app.use('/api/hub', knowledgeHubRoutes)

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  
  // Handle Multer errors specifically
  if (err.name === 'MulterError') {
    return res.status(400).json({ msg: `Upload Error: ${err.message}` });
  }

  // Handle Cloudinary/Other errors
  res.status(err.status || 500).json({ 
    msg: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// =======================
//  START SERVER
// =======================
const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})