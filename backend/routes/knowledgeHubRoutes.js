import express from 'express'
import {
  addHubPostComment,
  createHubUserByAdmin,
  createHubPost,
  getHubAdminSummary,
  listHubUsers,
  listHubPosts,
  moderateHubPost,
  removeHubUserByAdmin,
  removeHubPost,
  toggleHubPostLike,
  uploadHubAttachments,
  getHubUserProfile,
  updateHubUserProfileImage,
  getHubUserLikedPosts
} from '../controllers/knowledgeHubController.js'
import { adminOnly, protectHub } from '../middleware/authMiddleware.js'
import { upload } from '../config/cloudinary.js'

const router = express.Router()

router.get('/posts', protectHub, listHubPosts)
router.post('/posts', protectHub, createHubPost)
router.post('/posts/upload', protectHub, upload.array('attachments', 5), uploadHubAttachments)
router.post('/posts/:id/like', protectHub, toggleHubPostLike)
router.post('/posts/:id/comments', protectHub, addHubPostComment)
router.delete('/posts/:id', protectHub, removeHubPost)

router.get('/users/:id', protectHub, getHubUserProfile)
router.get('/users/:id/liked-posts', protectHub, getHubUserLikedPosts)
router.put('/users/profile-image', protectHub, upload.single('profileImage'), updateHubUserProfileImage)

router.put('/admin/posts/:id/moderate', protectHub, adminOnly, moderateHubPost)
router.get('/admin/summary', protectHub, adminOnly, getHubAdminSummary)
router.get('/admin/users', protectHub, adminOnly, listHubUsers)
router.post('/admin/users', protectHub, adminOnly, createHubUserByAdmin)
router.delete('/admin/users/:id', protectHub, adminOnly, removeHubUserByAdmin)

export default router
