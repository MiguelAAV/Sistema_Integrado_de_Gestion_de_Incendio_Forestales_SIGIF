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

function Layout({ children }) {
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
      <Route path="/login" element={<PublicRoute><Layout><Login /></Layout></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Layout><Register /></Layout></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/quienes-somos" element={<Layout><QuienesSomos /></Layout>} />
      <Route path="/contacto" element={<Layout><Contacto /></Layout>} />
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
