configDotenv()
import { configDotenv } from 'dotenv';
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js';
import http from 'http'
import { Server } from 'socket.io';
import { Socket } from 'dgram';
const port = process.env.PORT
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from"./routes/workspaceRoutes.js"
import messageRoutes from "./routes/messageRoutes.js";
import taskRoutes from "./routes/taskRoutes.js"
import setupSocket from './socket/socketHandler.js';

connectDB()
const app = express();
const server = http.createServer(app);


const io = new Server(server,{
    cors:{
        origin:process.env.CLIENT_URL,
        method:["GET","POST"],
    },
});

app.use(express.json())
app.use(cors({origin:process.env.CLIENT_URL}))
app.use("/api/auth",authRoutes)
app.use("/api/workspaces",workspaceRoutes)
app.use("/api/messages", messageRoutes); 
app.use("/api/tasks",taskRoutes);


setupSocket(io)



server.listen(port,()=>{
    console.log(`server is running on port http://localhost:${port}`)
})