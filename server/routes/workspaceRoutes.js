import express from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  addmember,
} from "../controllers/workspaceController.js";
import authMiddleware from "../Middleware/authMiddleware.js";
import { updateWorkspace, deleteWorkspace } from "../controllers/workspaceController.js";

const router = express.Router();

router.post("/", authMiddleware, createWorkspace);     
router.get("/", authMiddleware, getWorkspaces);         
router.get("/:id", authMiddleware, getWorkspaceById);  
router.post("/:id/add-member", authMiddleware, addmember); 
router.put("/:id", authMiddleware, updateWorkspace);
router.delete("/:id", authMiddleware, deleteWorkspace);

export default router;