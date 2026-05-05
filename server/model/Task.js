import mongoose from "mongoose";
const taskschema = new mongoose.Schema(

    {
        title:{
            type:String,
            required:true,
            trim:true,
        },
        description:{
            type:String,
            default:"",
        },
        assignedTo:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
        workspace:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"workspace",
            required:true
        },
        status:{
            type:String,
            enum:["todo","inprogress","done"],
            default:"todo"
        },
        priority:{
            type:String,
            enum:["high","medium","low"],
            default:"meduim"
        },
        deadline:{
            type:Date,
        },
        
    },
    {timestamps:true}
)

const Task = mongoose.model('Task',taskschema);
export default Task