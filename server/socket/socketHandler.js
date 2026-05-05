import Workspace from "../model/Workspace.js";

const setupSocket=(io)=>{
    const onlineUsers = new Map();

    io.on("connection",(socket)=>{
        console.log("User connected:",socket.id)

        socket.on("user-online",(userId)=>{
            onlineUsers.set(userId,socket.id)
            io.emit("online-users", Array.from(onlineUsers.keys()))
            console.log("User online:",userId)
        })

        socket.on("join-workspace",(workspaceId)=>{
            socket.join(workspaceId)
            console.log(`user joined workspace: ${workspaceId}`)
        })

        socket.on("send-message",(data)=>{
            io.to(data.workspaceId).emit("receive-message",data)
        })

        socket.on("typing",(data)=>{
            socket.to(data.workspaceId).emit("user-typing",data)
        })
        socket.on("stop-typing",(data)=>{
            socket.to(data.workspaceId).emit("user-stop-typing",data)
        })

        socket.on("disconnect",()=>{
            onlineUsers.forEach((socketId,userId)=>{
                if(socketId===socket.id){
                    onlineUsers.delete(userId)
                    io.emit("online-users",Array.from(onlineUsers.keys()))
                    console.log("User offline",userId)
                }
            })
            console.log("User diconnected:",socket.id)
        })
        // Video Call Signaling
socket.on("join-room", (roomId) => {
  socket.join(roomId);
  socket.to(roomId).emit("user-joined", socket.id);
  console.log(`User joined room: ${roomId}`);
});

socket.on("offer", (data) => {
  socket.to(data.to).emit("offer", {
    offer: data.offer,
    from: socket.id,
  });
});

socket.on("answer", (data) => {
  socket.to(data.to).emit("answer", {
    answer: data.answer,
    from: socket.id,
  });
});

socket.on("ice-candidate", (data) => {
  socket.to(data.to).emit("ice-candidate", {
    candidate: data.candidate,
    from: socket.id,
  });
});

socket.on("leave-room", (roomId) => {
  socket.to(roomId).emit("user-left", socket.id);
  socket.leave(roomId);
});
    })

}
export default setupSocket;