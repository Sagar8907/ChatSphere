import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../store/authStore";
import useWorkspaceStore from "../store/workspaceStore";
import { useSocket } from "../context/SocketContext";
import api from "../services/api";

const ChatPage = () => {
  const { workspaceId } = useParams();
  const { user } = useAuthStore();
  const { messages, setMessages, addMessage, currentWorkspace } = useWorkspaceStore();
  const { socket } = useSocket();
  const [content, setContent] = useState("");
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!workspaceId) return;
    const fetch = async () => {
      try {
        const res = await api.get(`/messages/${workspaceId}`);
        setMessages(res.data);
      } catch (err) { console.log(err); }
    };
    fetch();
  }, [workspaceId]);

  useEffect(() => {
    if (!socket || !workspaceId) return;
    socket.emit("join-workspace", workspaceId);
    socket.on("receive-message", addMessage);
    socket.on("user-typing", (data) => { setTypingUser(data.userName); setTyping(true); });
    socket.on("user-stop-typing", () => { setTyping(false); setTypingUser(""); });
    return () => {
      socket.off("receive-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [socket, workspaceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const res = await api.post(`/messages/${workspaceId}`, { content });
      socket.emit("send-message", { ...res.data, workspaceId });
      setContent("");
      socket.emit("stop-typing", { workspaceId });
    } catch (err) { console.log(err); }
  };

  const handleTyping = (e) => {
    setContent(e.target.value);
    socket.emit("typing", { workspaceId, userName: user?.name });
    setTimeout(() => socket.emit("stop-typing", { workspaceId }), 2000);
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const getInitial = (name) => name?.[0]?.toUpperCase() || "?";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#0f0f13",
    }}>

      {/* Topbar */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "rgba(255,255,255,0.02)",
      }}>
        <div style={{
          width: "36px", height: "36px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #6339ff22, #00c8b422)",
          border: "1px solid rgba(99,57,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", fontWeight: "600", color: "#a78bff",
        }}>
          {getInitial(currentWorkspace?.name)}
        </div>
        <div>
          <p style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}>
            {currentWorkspace?.name}
          </p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
            {currentWorkspace?.members?.length || 0} members
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: "flex",
            flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.15)", gap: "12px",
            fontSize: "13px",
          }}>
            <span style={{ fontSize: "32px" }}>💬</span>
            No messages yet — say hello!
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => {
            const isOwn = msg.sender?._id === user?._id;
            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-end",
                  flexDirection: isOwn ? "row-reverse" : "row",
                  alignSelf: isOwn ? "flex-end" : "flex-start",
                  maxWidth: "65%",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: "30px", height: "30px",
                  borderRadius: "50%",
                  background: isOwn
                    ? "linear-gradient(135deg, #6339ff, #a78bff)"
                    : "linear-gradient(135deg, #00c8b4, #4ade80)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: "600", color: "#fff",
                  flexShrink: 0,
                }}>
                  {getInitial(msg.sender?.name)}
                </div>

                {/* Content */}
                <div style={{
                  display: "flex", flexDirection: "column",
                  gap: "4px",
                  alignItems: isOwn ? "flex-end" : "flex-start",
                }}>
                  {!isOwn && (
                    <span style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.35)",
                      paddingLeft: "4px",
                    }}>
                      {msg.sender?.name}
                    </span>
                  )}
                  <div style={{
                    padding: "10px 16px",
                    borderRadius: isOwn ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    background: isOwn
                      ? "linear-gradient(135deg, rgba(99,57,255,0.3), rgba(99,57,255,0.15))"
                      : "rgba(255,255,255,0.06)",
                    border: isOwn
                      ? "1px solid rgba(99,57,255,0.25)"
                      : "1px solid rgba(255,255,255,0.07)",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    color: "rgba(255,255,255,0.88)",
                  }}>
                    {msg.content}
                  </div>
                  <span style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.2)",
                    paddingLeft: "4px", paddingRight: "4px",
                  }}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing */}
        {typing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.25)" }}
          >
            <div style={{ display: "flex", gap: "3px" }}>
              {[0, 1, 2].map((i) => (
                <motion.div key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(255,255,255,0.3)" }}
                />
              ))}
            </div>
            {typingUser} is typing...
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "16px 24px 20px", flexShrink: 0 }}>
        <form onSubmit={handleSend}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "14px",
          }}>
            <input
              value={content}
              onChange={handleTyping}
              placeholder={`Message ${currentWorkspace?.name || ""}...`}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "13px",
                color: "white",
              }}
            />
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              type="submit"
              style={{
                width: "34px", height: "34px",
                borderRadius: "10px",
                border: "none",
                background: content.trim()
                  ? "linear-gradient(135deg, #6339ff, #00c8b4)"
                  : "rgba(255,255,255,0.07)",
                color: "#fff",
                fontSize: "14px",
                cursor: "pointer",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              →
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;