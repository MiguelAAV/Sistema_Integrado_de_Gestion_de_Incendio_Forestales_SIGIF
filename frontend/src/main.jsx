import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Contacto from "./pages/Contacto";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import QuienesSomos from "./pages/QuienesSomos";
import Register from "./pages/Register";
import { createRoot } from "react-dom/client";
import "./styles.css";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppShell({ children }) {
  return (
    <>
      <Header />
      <div className="page-content">
        {children}
      </div>
      <Footer />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><AppShell><Login /></AppShell></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><AppShell><Register /></AppShell></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppShell><Profile /></AppShell></ProtectedRoute>} />
      <Route path="/quienes-somos" element={<AppShell><QuienesSomos /></AppShell>} />
      <Route path="/contacto" element={<AppShell><Contacto /></AppShell>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);
