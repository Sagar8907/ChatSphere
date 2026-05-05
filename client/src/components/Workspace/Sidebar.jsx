import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../store/authStore";
import useWorkspaceStore from "../../store/workspaceStore";
import api from "../../services/api";

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { workspaces, setWorkspaces, currentWorkspace, setCurrentWorkspace, updateWorkspace, removeWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await api.get("/workspaces");
        setWorkspaces(res.data);
        if (res.data.length > 0) {
          setCurrentWorkspace(res.data[0]);
          navigate(`/chat/${res.data[0]._id}`);
        }
      } catch (err) { console.log(err); }
    };
    fetchWorkspaces();
  }, []);

  const openEdit = () => {
    setEditName(currentWorkspace?.name || "");
    setEditDesc(currentWorkspace?.description || "");
    setShowEditModal(true);
    setMsg("");
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/workspaces", {
        name: createName,
        description: createDesc,
      });
      setWorkspaces([...workspaces, res.data.workspace]);
      setCurrentWorkspace(res.data.workspace);
      navigate(`/chat/${res.data.workspace._id}`);
      setShowCreateModal(false);
      setCreateName("");
      setCreateDesc("");
      setMsg("");
    } catch (err) {
      setMsg(err.response?.data?.message || "Error!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/workspaces/${currentWorkspace._id}`, {
        name: editName,
        description: editDesc,
      });
      updateWorkspace(res.data.workspace);
      setShowEditModal(false);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this workspace?")) return;
    try {
      await api.delete(`/workspaces/${currentWorkspace._id}`);
      removeWorkspace(currentWorkspace._id);
      navigate("/chat");
    } catch (err) {
      alert(err.response?.data?.message || "Error!");
    }
  };

  const handleAddMember = async () => {
    setLoading(true);
    try {
      await api.post(`/workspaces/${currentWorkspace._id}/add-member`, {
        email: memberEmail,
      });
      setMsg("Member added! ✅");
      setMemberEmail("");
    } catch (err) {
      setMsg(err.response?.data?.message || "Error!");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname.includes(path);

  const menuItems = [
    { label: "Chat", icon: "💬", path: "chat" },
    { label: "Tasks", icon: "✅", path: "tasks" },
    { label: "Video Call", icon: "📹", path: "video" },
  ];

  const modalStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    backdropFilter: "blur(4px)",
  };

  const cardStyle = {
    background: "#13131a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "28px",
    width: "360px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
  };

  const btnStyle = {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  };

  return (
    <>
      <div style={{
        width: "240px",
        height: "100vh",
        background: "rgba(255,255,255,0.02)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}>

        {/* Logo */}
        <div style={{
          padding: "20px 16px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{
            width: "28px", height: "28px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6339ff, #00c8b4)",
            flexShrink: 0,
          }} />
          <span style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>ChatSphere</span>
        </div>

        {/* Scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>

          {/* Workspaces */}
          <p style={{ fontSize: "10px", fontWeight: "500", color: "rgba(255,255,255,0.25)", letterSpacing: "0.8px", padding: "8px 8px 6px" }}>
            WORKSPACES
          </p>

          {workspaces.map((ws) => (
            <motion.div
              key={ws._id}
              whileHover={{ x: 2 }}
              onClick={() => {
                setCurrentWorkspace(ws);
                navigate(`/chat/${ws._id}`);
              }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 10px", borderRadius: "10px", cursor: "pointer", marginBottom: "2px",
                background: currentWorkspace?._id === ws._id ? "rgba(99,57,255,0.15)" : "transparent",
                border: currentWorkspace?._id === ws._id ? "1px solid rgba(99,57,255,0.2)" : "1px solid transparent",
              }}
            >
              <div style={{
                width: "28px", height: "28px", borderRadius: "8px",
                background: "rgba(99,57,255,0.2)", color: "#a78bff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "600", flexShrink: 0,
              }}>
                {ws.name[0].toUpperCase()}
              </div>
              <span style={{
                fontSize: "13px", fontWeight: "500", flex: 1,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                color: currentWorkspace?._id === ws._id ? "#a78bff" : "rgba(255,255,255,0.55)",
              }}>
                {ws.name}
              </span>
              {currentWorkspace?._id === ws._id && (
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00c8b4", flexShrink: 0 }} />
              )}
            </motion.div>
          ))}

          {/* New Workspace */}
          <motion.div
            whileHover={{ x: 2 }}
            onClick={() => { setShowCreateModal(true); setMsg(""); }}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 10px", borderRadius: "10px", cursor: "pointer", marginBottom: "16px",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            <div style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "rgba(255,255,255,0.04)",
              border: "1px dashed rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", flexShrink: 0,
            }}>+</div>
            <span style={{ fontSize: "13px" }}>New Workspace</span>
          </motion.div>

          {/* Menu */}
          <p style={{ fontSize: "10px", fontWeight: "500", color: "rgba(255,255,255,0.25)", letterSpacing: "0.8px", padding: "8px 8px 6px" }}>
            MENU
          </p>

          {menuItems.map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ x: 2 }}
              onClick={() => navigate(`/${item.path}/${currentWorkspace?._id}`)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 10px", borderRadius: "10px", cursor: "pointer", marginBottom: "2px",
                background: isActive(item.path) ? "rgba(255,255,255,0.05)" : "transparent",
                border: "1px solid transparent",
              }}
            >
              <span style={{ fontSize: "15px" }}>{item.icon}</span>
              <span style={{
                fontSize: "13px",
                color: isActive(item.path) ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
                fontWeight: isActive(item.path) ? "500" : "400",
              }}>
                {item.label}
              </span>
            </motion.div>
          ))}

          {/* Workspace Actions */}
          {currentWorkspace && (
            <div style={{ marginTop: "16px", padding: "0 4px" }}>
              <p style={{ fontSize: "10px", fontWeight: "500", color: "rgba(255,255,255,0.25)", letterSpacing: "0.8px", padding: "8px 4px 6px" }}>
                WORKSPACE
              </p>

              <motion.div whileHover={{ x: 2 }} onClick={openEdit}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "10px", cursor: "pointer", marginBottom: "2px", color: "rgba(255,255,255,0.4)" }}>
                <span style={{ fontSize: "15px" }}>✏️</span>
                <span style={{ fontSize: "13px" }}>Edit Workspace</span>
              </motion.div>

              <motion.div whileHover={{ x: 2 }} onClick={() => { setShowAddMember(true); setMsg(""); }}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "10px", cursor: "pointer", marginBottom: "2px", color: "rgba(255,255,255,0.4)" }}>
                <span style={{ fontSize: "15px" }}>👥</span>
                <span style={{ fontSize: "13px" }}>Add Member</span>
              </motion.div>

              <motion.div whileHover={{ x: 2 }} onClick={handleDelete}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "10px", cursor: "pointer", color: "#ff6b6b" }}>
                <span style={{ fontSize: "15px" }}>🗑️</span>
                <span style={{ fontSize: "13px" }}>Delete Workspace</span>
              </motion.div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div style={{ padding: "12px 10px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6339ff, #00c8b4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: "600", color: "#fff", flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: "500", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </p>
              <p style={{ fontSize: "11px", color: "#4ade80" }}>● Online</p>
            </div>
            <button onClick={handleLogout} style={{
              fontSize: "11px", padding: "4px 10px", borderRadius: "8px",
              background: "rgba(255,50,50,0.1)", color: "#ff6b6b",
              border: "1px solid rgba(255,50,50,0.15)", cursor: "pointer", flexShrink: 0,
            }}>
              Out
            </button>
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalStyle}
            onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={cardStyle} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>Create Workspace</h3>
              <input style={inputStyle} value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Workspace name" />
              <input style={inputStyle} value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} placeholder="Description (optional)" />
              {msg && <p style={{ fontSize: "12px", color: "#ff6b6b" }}>{msg}</p>}
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowCreateModal(false)} style={{ ...btnStyle, flex: 1, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={loading} style={{ ...btnStyle, flex: 1, background: "linear-gradient(135deg, #6339ff, #00c8b4)", color: "#fff" }}>
                  {loading ? "Creating..." : "Create →"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Workspace Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalStyle}
            onClick={() => setShowEditModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={cardStyle} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>Edit Workspace</h3>
              <input style={inputStyle} value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Workspace name" />
              <input style={inputStyle} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description (optional)" />
              {msg && <p style={{ fontSize: "12px", color: "#ff6b6b" }}>{msg}</p>}
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowEditModal(false)} style={{ ...btnStyle, flex: 1, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                  Cancel
                </button>
                <button onClick={handleEdit} disabled={loading} style={{ ...btnStyle, flex: 1, background: "linear-gradient(135deg, #6339ff, #00c8b4)", color: "#fff" }}>
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMember && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalStyle}
            onClick={() => setShowAddMember(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={cardStyle} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>Add Member</h3>
              <input style={inputStyle} value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="Enter email address" type="email" />
              {msg && <p style={{ fontSize: "12px", color: msg.includes("✅") ? "#4ade80" : "#ff6b6b" }}>{msg}</p>}
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowAddMember(false)} style={{ ...btnStyle, flex: 1, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                  Cancel
                </button>
                <button onClick={handleAddMember} disabled={loading} style={{ ...btnStyle, flex: 1, background: "linear-gradient(135deg, #6339ff, #00c8b4)", color: "#fff" }}>
                  {loading ? "Adding..." : "Add Member"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;