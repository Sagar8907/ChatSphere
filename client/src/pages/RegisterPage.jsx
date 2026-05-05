import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import useAuthStore from "../store/authStore";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      const res = await api.post("/auth/register", form);
      setUser(res.data.user, res.data.token);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name", label: "Full name", type: "text" },
    { name: "email", label: "Email address", type: "email" },
    { name: "password", label: "Password", type: "password" },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#0a0a0f" }}
    >
      {/* Background blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,57,255,0.2) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,200,180,0.12) 0%, transparent 70%)" }} />

      {/* Card */}
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
        {/* Logo */}
        <div className="flex items-center gap-3 mb-9">
          <div className="w-8 h-8 rounded-full"
            style={{ background: "linear-gradient(135deg, #6339ff, #00c8b4)" }} />
          <span className="text-white text-lg font-semibold tracking-tight">ChatSphere</span>
        </div>

        <h1 className="text-white font-semibold mb-2"
          style={{ fontSize: "26px", letterSpacing: "-0.5px" }}>
          Create account
        </h1>
        <p className="text-sm mb-9" style={{ color: "rgba(255,255,255,0.35)" }}>
          Join your team on ChatSphere
        </p>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 rounded-xl text-sm"
            style={{
              background: "rgba(255,50,50,0.1)",
              border: "1px solid rgba(255,50,50,0.2)",
              color: "#ff6b6b",
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {fields.map((field) => (
            <div key={field.name} className="relative">
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                onFocus={() => handleFocus(field.name)}
                onBlur={() => handleBlur(field.name)}
                required
                className="w-full outline-none text-white text-sm"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${focused[field.name] ? "rgba(99,57,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "12px",
                  padding: "22px 16px 8px",
                  transition: "border 0.2s",
                }}
              />
              <label
                className="absolute left-4 pointer-events-none transition-all duration-200"
                style={{
                  top: isActive(field.name) ? "8px" : "50%",
                  transform: isActive(field.name) ? "none" : "translateY(-50%)",
                  fontSize: isActive(field.name) ? "10px" : "13px",
                  color: isActive(field.name) ? "rgba(99,57,255,0.8)" : "rgba(255,255,255,0.35)",
                  letterSpacing: isActive(field.name) ? "0.5px" : "0",
                  textTransform: isActive(field.name) ? "uppercase" : "none",
                }}
              >
                {field.label}
              </label>
            </div>
          ))}

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
              background: loading
                ? "rgba(99,57,255,0.4)"
                : "linear-gradient(135deg, #6339ff, #00c8b4)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating account..." : "Create account →"}
          </motion.button>
        </form>

        <p className="text-center text-sm mt-7" style={{ color: "rgba(255,255,255,0.3)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#a78bff" }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;