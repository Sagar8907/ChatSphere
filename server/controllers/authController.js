import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const generatetoken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    })
}


export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;


        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered!" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        })
        const token = generatetoken(user._id);
        res.status(201).json({
            message: "Regitered successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            },
        })

    } catch (error) {
        res.status(500).json({ message: "Server error!", error: error.message });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })
        if (!user) {
           return res.status(400).json({ message: "Invalid credentials!" });
        }
        const ismatch = await bcrypt.compare(password, user.password);
        if (!ismatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const token = generatetoken(user._id);
        res.status(200).json({
            message:"login successful!",
            token,
            user:{
                _id:user._id,
                name:user.name,
                email:user.email,
                avatar:user.avatar
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Server error!", error: error.message });
    }
}
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};