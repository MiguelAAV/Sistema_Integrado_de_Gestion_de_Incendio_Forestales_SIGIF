import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h4>Emergencias</h4>
          <ul className="footer-emergency">
            <li><span className="emergency-number">132</span> Bomberos</li>
            <li><span className="emergency-number">133</span> Carabineros</li>
            <li><span className="emergency-number">134</span> PDI</li>
            <li><span className="emergency-number">137</span> SENAPRED</li>
            <li><span className="emergency-number">140</span> Seguridad Municipal</li>
            <li><span className="emergency-number">131</span> Ambulancia SAMU</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>SIGIF</h4>
          <ul className="footer-links-list">
            <li><Link to="/quienes-somos">Quienes somos</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Enlaces de interes</h4>
          <ul className="footer-links-list">
            <li><a href="https://www.bomberos.cl" target="_blank" rel="noreferrer">Bomberos de Chile</a></li>
            <li><a href="https://www.senapred.cl" target="_blank" rel="noreferrer">SENAPRED</a></li>
            <li><a href="https://www.carabineros.cl" target="_blank" rel="noreferrer">Carabineros</a></li>
            <li><a href="https://www.municipalidadvalledelsol.cl" target="_blank" rel="noreferrer">Municipalidad</a></li>
            <li><a href="https://www.onemi.cl" target="_blank" rel="noreferrer">Alertas meteorologicas</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Acerca de</h4>
          <p className="footer-about">
            Sistema Integrado de Gestion de Incendios Forestales de la Municipalidad del
            Valle del Sol. Protegiendo a nuestras comunidades y el entorno natural.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Municipalidad del Valle del Sol &mdash; SIGIF v0.2.0</p>
        <p className="footer-tag">Datos mock &middot; Solo desarrollo</p>
      </div>
    </footer>
  );
}
