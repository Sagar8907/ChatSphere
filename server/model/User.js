import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    avatar: {
        type: String,
        default: "",
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    workspaces: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",

        },
    ],
},
    { timestamps: true }
)

const User = mongoose.model("User",UserSchema);

export default User;