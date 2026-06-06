import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/dashboard" className="header-logo">
          <img src="/Logo_SIGIF.png" alt="SIGIF" className="logo-img" />
          <span className="logo-text">SIGIF</span>
        </Link>

        <nav className="header-nav">
          <Link to="/dashboard">Dashboard</Link>
          {user && <Link to="/profile">Mi Perfil</Link>}
          <Link to="/quienes-somos">Quienes somos</Link>
          <Link to="/contacto">Contacto</Link>
        </nav>

        <div className="header-user">
          {user ? (
            <>
              <span className="user-badge">{user.role}</span>
              <span className="user-name">{user.name}</span>
              <button className="btn-logout" onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <Link to="/login" className="btn-login-header">Ingresar</Link>
          )}
        </div>
      </div>
    </header>
  );
}
