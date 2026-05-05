import Message from '../model/Message.js'
import Workspace from '../model/Workspace.js'

export const sendMessage = async(req,res)=>{
    try{
        const {content} = req.body;
        const {workspaceId} = req.params;
        const workspace  = await Workspace.findById(workspaceId);
        if(!workspace){
            return res.status(404).json({message:"worksapce not found"})
        }

        const isMember = workspace.members.includes(req.userId);
        if(!isMember){
            return res.status(403).json({message:"Access denied!"})
        }

        const message = await Message.create({
            sender:req.userId,
            workspace:workspaceId,
            content,
        })
          await message.populate("sender", "name email avatar");
          res.status(201).json(message)

    }catch(error){
      res.status(500).json({ message: "Server error!", error: error.message });
    }
}

export const getmessage = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found!" });
    }
    const isMember = workspace.members.includes(req.userId);
    if (!isMember) {
      return res.status(403).json({ message: "Access denied!" });
    }
    const messages = await Message.find({ workspace: workspaceId })
      .populate("sender", "name email avatar")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};



