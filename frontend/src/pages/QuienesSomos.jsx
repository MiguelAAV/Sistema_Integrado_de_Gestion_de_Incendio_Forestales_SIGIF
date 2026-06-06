export default function QuienesSomos() {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Municipalidad Valle del Sol</p>
          <h1>Quienes somos</h1>
          <p>Conoce el equipo y la mision detras de SIGIF.</p>
        </div>
        <div className="hero-card">
          <span>Compromiso</span>
          <strong>+Comunidad</strong>
          <small>Protegiendo nuestro entorno natural.</small>
        </div>
      </section>

      <section className="grid two-columns" style={{ marginTop: 28 }}>
        <article className="panel">
          <div className="panel-header">
            <h2>Nuestra mision</h2>
          </div>
          <p style={{ lineHeight: 1.7, color: "#3b5243" }}>
            SIGIF (Sistema Integrado de Gestion de Incendios Forestales) nace para reducir
            el tiempo de deteccion y respuesta ante incendios forestales en la comuna del
            Valle del Sol. Integramos a la comunidad, brigadas municipales y organismos de
            emergencia en una plataforma unificada.
          </p>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Nuestra vision</h2>
          </div>
          <p style={{ lineHeight: 1.7, color: "#3b5243" }}>
            Ser el sistema de referencia en la deteccion temprana y coordinacion de
            emergencias forestales a nivel comunal, protegiendo a nuestras comunidades y
            el entorno natural para las futuras generaciones.
          </p>
        </article>
      </section>

      <section className="grid two-columns" style={{ marginTop: 18 }}>
        <article className="panel">
          <div className="panel-header">
            <h2>El equipo</h2>
          </div>
          <p style={{ lineHeight: 1.7, color: "#3b5243" }}>
            SIGIF es desarrollado por el Departamento de Gestion de Riesgos y Emergencias
            de la Municipalidad del Valle del Sol, en colaboracion con brigadas forestales,
            Bomberos, SENAPRED y la comunidad local.
          </p>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Proposito</h2>
          </div>
          <p style={{ lineHeight: 1.7, color: "#3b5243" }}>
            Reducir el tiempo de deteccion de incendios forestales a menos de 5 minutos,
            integrando a la comunidad, brigadas municipales y organismos de emergencia en
            una plataforma unificada y accesible para todos.
          </p>
        </article>
      </section>
    </main>
  );
}
