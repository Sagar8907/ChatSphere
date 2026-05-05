import { createContext,useContext,useEffect,useState } from "react";
import { io } from "socket.io-client";

import useAuthStore from "../store/authStore";

const SocketContext = createContext();
export const SocketProvider=({children})=>{
    const [socket,setSocket] = useState(null)
    const {user} = useAuthStore()

    useEffect(()=>{
        if(user){
            const newSocket =io("http://localhost:5000")
            newSocket.emit("user-online",user._id)
            setSocket(newSocket)

            return ()=>newSocket.close()
        }
    },[user])
    return(
        <SocketContext.Provider value={{socket}}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket=()=>useContext(SocketContext);