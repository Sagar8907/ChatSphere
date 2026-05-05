import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const TasksPage = () => {
  const { workspaceId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    fetchTasks();
  }, [workspaceId]);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/${workspaceId}`);
      setTasks(res.data);
    } catch (err) { console.log(err); }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    try {
      const res = await api.post(`/tasks/${workspaceId}`, { title: taskInput });
      setTasks([res.data, ...tasks]);
      setTaskInput("");
    } catch (err) { console.log(err); }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/delete/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) { console.log(err); }
  };

  const updateStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === "todo" ? "inprogress" : currentStatus === "inprogress" ? "done" : "todo";
    try {
      const res = await api.put(`/tasks/update/${taskId}`, { status: nextStatus });
      setTasks(tasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) { console.log(err); }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: "#0f0f13", padding: "24px", color: "white"
    }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>Workspace Tasks</h2>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>{tasks.length} pending tasks</p>
      </div>

      {/* Task List */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px", background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div 
                  onClick={() => updateStatus(task._id, task.status)}
                  style={{
                    width: "18px", height: "18px", borderRadius: "4px",
                    border: "1px solid #6339ff", cursor: "pointer",
                    background: task.status === "done" ? "#6339ff" : "transparent"
                  }} 
                />
                <span style={{ fontSize: "14px", textDecoration: task.status === "done" ? "line-through" : "none", color: task.status === "done" ? "rgba(255,255,255,0.3)" : "white" }}>
                  {task.title}
                </span>
              </div>
              
              <button 
                onClick={() => deleteTask(task._id)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: "18px" }}
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <form onSubmit={handleAddTask} style={{ flexShrink: 0, marginTop: "20px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "12px 16px", background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.09)", borderRadius: "14px",
        }}>
          <input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Add new task..."
            style={{
              flex: 1, background: "transparent", border: "none",
              outline: "none", color: "white", fontSize: "13px"
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            style={{
              padding: "6px 16px", borderRadius: "10px", border: "none",
              background: "linear-gradient(135deg, #6339ff, #00c8b4)",
              color: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer"
            }}
          >
            Add
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default TasksPage;