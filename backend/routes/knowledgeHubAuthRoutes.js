import express from 'express'
import { loginHubUser, registerHubUser } from '../controllers/knowledgeHubAuthController.js'

const router = express.Router()

router.post('/signup', registerHubUser)
router.post('/login', loginHubUser)

export default router
