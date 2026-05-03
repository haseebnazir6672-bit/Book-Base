import express from 'express'
import { login, register } from '../controllers/authController.js'

const router = express.Router()

// POST /api/auth/login
router.post('/login', login)

// POST /api/auth/register  (open — only used for first-time or dev)
router.post('/register', register)

export default router