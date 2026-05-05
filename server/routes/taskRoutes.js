import express from 'express';
import {createTask,getTasks,deleteTask,updateTask} from '../controllers/taskController.js'
import authMiddleware from '../Middleware/authMiddleware.js';
const router = express.Router();


router.post("/:workspaceId",authMiddleware,createTask)
router.get("/:workspaceId",authMiddleware,getTasks)
router.put("/:workspaceId",authMiddleware,updateTask)
router.delete("/:workspaceId",authMiddleware,deleteTask)


export default router;
