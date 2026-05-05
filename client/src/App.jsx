import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import useAuthStore from "./store/authStore";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import TasksPage from "./pages/TasksPage";
import VideoPage from "./pages/VideoPage";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes — Layout ke saath */}
          <Route path="/chat" element={
            <ProtectedRoute>
              <Layout><ChatPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/chat/:workspaceId" element={
            <ProtectedRoute>
              <Layout><ChatPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/tasks/:workspaceId" element={
            <ProtectedRoute>
              <Layout><TasksPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/video/:workspaceId" element={
            <ProtectedRoute>
              <Layout><VideoPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;