export default function Contacto() {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Municipalidad Valle del Sol</p>
          <h1>Contacto</h1>
          <p>Comunicate con nosotros ante cualquier consulta o emergencia.</p>
        </div>
        <div className="hero-card">
          <span>Emergencias</span>
          <strong>132</strong>
          <small>Bomberos / Atencion inmediata.</small>
        </div>
      </section>

      <section className="grid two-columns" style={{ marginTop: 28 }}>
        <article className="panel">
          <div className="panel-header">
            <h2>Informacion de contacto</h2>
          </div>
          <div style={{ display: "grid", gap: 16, color: "#3b5243", lineHeight: 1.7 }}>
            <div>
              <strong style={{ color: "#1f4233" }}>Direccion</strong>
              <p style={{ margin: "4px 0 0" }}>Av. Municipal 123, Valle del Sol, Chile</p>
            </div>
            <div>
              <strong style={{ color: "#1f4233" }}>Telefono</strong>
              <p style={{ margin: "4px 0 0" }}>+56 9 1234 5678</p>
            </div>
            <div>
              <strong style={{ color: "#1f4233" }}>Correo electronico</strong>
              <p style={{ margin: "4px 0 0" }}>contacto@sigif.cl</p>
            </div>
            <div>
              <strong style={{ color: "#1f4233" }}>Horario de atencion</strong>
              <p style={{ margin: "4px 0 0" }}>Lunes a viernes, 8:30 a 18:00</p>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Numeros de emergencia</h2>
          </div>
          <ul className="compact-list">
            <li><strong>132</strong> — Bomberos</li>
            <li><strong>133</strong> — Carabineros</li>
            <li><strong>134</strong> — PDI</li>
            <li><strong>137</strong> — SENAPRED</li>
            <li><strong>140</strong> — Seguridad Municipal</li>
            <li><strong>131</strong> — Ambulancia SAMU</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
