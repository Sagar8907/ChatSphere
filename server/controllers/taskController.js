import Task from "../model/Task.js"
import Workspace from "../model/Workspace.js"

export const createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, deadline } = req.body;
        const { workspaceId } = req.params;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found!" })
        }

        const isMember = workspace.members.includes(req.userId);
        if (!isMember) {
            return res.status(403).json({ message: "Aceess Denied!" })
        }

        const task = await Task.create({
            title, description, assignedTo, workspace: workspaceId, priority, deadline
        })

        await task.populate("assignedTo", "name email avatar")
        res.status(201).json(task);

    } catch (error) {
        res.status(500).json({ message: "Server error!", error: error.message })
    }
}


export const getTasks = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found!" })
        }

        const isMember = workspace.members.includes(req.userId);
        if (!isMember) {
            return res.status(403).json({ message: "Aceess Denied!" })
        }

        const tasks = await Task.find({ workspace: workspaceId })
            .populate("assignedTo", "name email avatar")
            .sort({ createdAt: -1 })
        res.status(200).json(tasks);

    } catch (error) {
        res.status(500).json({ message: "Server error!", error: error.message })
    }
}

export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params
        const task = await Task.findById(taskId)
        if (!task) {
            return res.status(404).json({ message: "Task not found!" })
        }

        const workspace = await Workspace.findById(task.workspace);
        const isMember = workspace.members.includes(req.userId)
        if (!isMember) {
            return res.status(403).json({ message: "Access denied!" })
        }
        await task.deleteOne();
        res.status(200).json({ message: "Task deleted!" })
    } catch (error) {
        res.status(500).json({ message: "Server error!", error: error.message })

    }
}

export const updateTask = async (req, res) => {
    try {
        const { status, title, description, priority } = req.body;
        const { taskId } = req.params

        const task = await Task.findById(taskId)
        if (!task) { return res.status(404).json({ message: "Task not found!" }); }
        const workspace = await Workspace.findById(task.workspace); // ye add karo
        const isMember = workspace.members.includes(req.userId)
        if (!isMember) {
            return res.status(403).json({ message: "Access denied!" })
        }
        if (status) task.status = status;
        if (title) task.title = title;
        if (description) task.description = description;
        if (priority) task.priority = priority;

        await task.save();
        await task.populate("assignedTo", "name email avatar");

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error!", error: error.message })

    }
}