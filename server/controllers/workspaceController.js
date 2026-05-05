import Workspace from "../model/Workspace.js";
import User from "../model/User.js";

export const createWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;
        const workspace = await Workspace.create({
            name,
            description,
            owner: req.userId,
            members: [req.userId]
        })

        await User.findByIdAndUpdate(req.userId, {
            $push: { workspaces: workspace._id },
        })
        res.status(200).json({
            message: "workspace created!",
            workspace
        })

    } catch (error) {
        res.status(500).json({ message: "server error! ", error: error.message })
    }
}
export const getWorkspaces = async (req, res) => {
  try {
    // Sirf vo workspaces jisme current user member hai
    const workspaces = await Workspace.find({
      members: req.userId,
    }).populate("owner", "name email avatar"); // Owner ki info bhi lao

    res.status(200).json(workspaces);
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};
export const getWorkspaceById = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id)
            .populate("owner", "name email avatar")
            .populate("members", "name email avatar isOnline")
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" })
        }
        const isMember = workspace.members.some(
            (member) => member._id.toString() === req.userId
        );

        if (!isMember) {
            return res.status(403).json({ message: "Access denied!" });
        }

        res.status(200).json(workspace);
}catch (error) {
    res.status(500).json({ message: "server error! ", error: error.message })
}
}

export const addmember = async (req, res) => {
    try {
        const { email } = req.body;
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
           return res.status(404).json({ message: "User not found!" })
        }

        const workspace = await Workspace.findById(req.params.id);
        if (!workspace) {
            return res.status(404).json({ message: "User not found!" })
        }

        if (workspace.owner.toString() !== req.userId) {
            return res.status(403).json({ message: "Only owner can add members!" })
        }
        const alreadyMemeber = workspace.members.includes(userToAdd._id);
        if (alreadyMemeber) {
            return res.status(400).json({ message: "Already a member!" })
        }

        workspace.members.push(userToAdd._id);
        await workspace.save();


        await User.findByIdAndUpdate(userToAdd._id, {
            $push: { workspaces: workspace._id },
        })

        res.status(200).json({ message: "member added! " })


    } catch (error) {
        res.status(500).json({ message: "server error! ", error: error.message })
    }


}
// Update Workspace
export const updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found!" });
    }

    // Sirf owner update kar sakta hai
    if (workspace.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Only owner can update!" });
    }

    if (name) workspace.name = name;
    if (description) workspace.description = description;
    await workspace.save();

    res.status(200).json({ message: "Workspace updated!", workspace });
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

// Delete Workspace
export const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found!" });
    }

    if (workspace.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Only owner can delete!" });
    }

    await workspace.deleteOne();

    res.status(200).json({ message: "Workspace deleted!" });
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};