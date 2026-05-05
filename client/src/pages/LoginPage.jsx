import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import useAuthStore from "../store/authStore";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFocus = (name) => setFocused({ ...focused, [name]: true });
  const handleBlur = (name) => setFocused({ ...focused, [name]: false });
  const isActive = (name) => focused[name] || form[name] !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      setUser(res.data.user, res.data.token);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#0a0a0f" }}>

      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,57,255,0.2) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,200,180,0.12) 0%, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full mx-4 z-10"
        style={{
          maxWidth: "420px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "44px 40px",
        }}
      >
        <div className="flex items-center gap-3 mb-9">
          <div className="w-8 h-8 rounded-full"
            style={{ background: "linear-gradient(135deg, #6339ff, #00c8b4)" }} />
          <span className="text-white text-lg font-semibold tracking-tight">ChatSphere</span>
        </div>

        <h1 className="text-white font-semibold mb-2" style={{ fontSize: "26px", letterSpacing: "-0.5px" }}>
          Welcome back
        </h1>
        <p className="text-sm mb-9" style={{ color: "rgba(255,255,255,0.35)" }}>
          Sign in to continue to your workspace
        </p>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 rounded-xl text-sm"
            style={{ background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.2)", color: "#ff6b6b" }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <input type="email" name="email" value={form.email}
              onChange={handleChange}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
              required
              className="w-full outline-none text-white text-sm"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${focused.email ? "rgba(99,57,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "12px",
                padding: "22px 16px 8px",
                transition: "border 0.2s",
              }} />
            <label className="absolute left-4 pointer-events-none transition-all duration-200"
              style={{
                top: isActive("email") ? "8px" : "50%",
                transform: isActive("email") ? "none" : "translateY(-50%)",
                fontSize: isActive("email") ? "10px" : "13px",
                color: isActive("email") ? "rgba(99,57,255,0.8)" : "rgba(255,255,255,0.35)",
                letterSpacing: isActive("email") ? "0.5px" : "0",
                textTransform: isActive("email") ? "uppercase" : "none",
              }}>
              Email address
            </label>
          </div>

          <div className="relative">
            <input type="password" name="password" value={form.password}
              onChange={handleChange}
              onFocus={() => handleFocus("password")}
              onBlur={() => handleBlur("password")}
              required
              className="w-full outline-none text-white text-sm"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${focused.password ? "rgba(99,57,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "12px",
                padding: "22px 16px 8px",
                transition: "border 0.2s",
              }} />
            <label className="absolute left-4 pointer-events-none transition-all duration-200"
              style={{
                top: isActive("password") ? "8px" : "50%",
                transform: isActive("password") ? "none" : "translateY(-50%)",
                fontSize: isActive("password") ? "10px" : "13px",
                color: isActive("password") ? "rgba(99,57,255,0.8)" : "rgba(255,255,255,0.35)",
                letterSpacing: isActive("password") ? "0.5px" : "0",
                textTransform: isActive("password") ? "uppercase" : "none",
              }}>
              Password
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full text-white font-medium text-sm mt-1"
            style={{
              padding: "15px",
              borderRadius: "12px",
              border: "none",
              background: loading ? "rgba(99,57,255,0.4)" : "linear-gradient(135deg, #6339ff, #00c8b4)",
              cursor: loading ? "not-allowed" : "pointer",
            }}>
            {loading ? "Signing in..." : "Sign in →"}
          </motion.button>
        </form>

        <p className="text-center text-sm mt-7" style={{ color: "rgba(255,255,255,0.3)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#a78bff" }}>Register</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;