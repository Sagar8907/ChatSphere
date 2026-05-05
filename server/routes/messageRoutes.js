import express from 'express'
import authMiddleware from '../Middleware/authMiddleware.js'
import { sendMessage,getmessage } from '../controllers/messageController.js'

 const router= express.Router()


router.post("/:workspaceId", authMiddleware, sendMessage)
router.get("/:workspaceId", authMiddleware, getmessage)

export default router