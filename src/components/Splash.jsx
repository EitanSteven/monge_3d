export default function Splash({ onSelect }) {
  return (
    <div id="splash">
      <div className="splash-inner">
        <div className="splash-title">Método de <span>Monge</span></div>
        <div className="splash-sub">Geometría Descriptiva — Representación Diédrica</div>
        <div className="splash-question">¿Con cuántos planos vas a trabajar?</div>
        <div className="splash-cards">
          <div className="splash-card recommended" onClick={() => onSelect(2)}>
            <span className="rec-badge">recomendado</span>
            <span className="sc-icon">Π₁ · Π₂</span>
            <div className="sc-title">Dos planos</div>
            <div className="sc-desc">El sistema clásico de dos planos, horizontal y vertical, con cuatro diedros. Ideal para el curso básico.</div>
            <div className="sc-planes">
              <span className="sc-pill">Π₁ horizontal</span>
              <span className="sc-pill">Π₂ vertical</span>
              <span className="sc-pill">4 diedros</span>
            </div>
          </div>
          <div className="splash-card" onClick={() => onSelect(3)}>
            <span className="sc-icon">Π₁ · Π₂ · Π₃</span>
            <div className="sc-title">Tres planos</div>
            <div className="sc-desc">Sistema con plano lateral. Permite representar alzado, planta y vista lateral.</div>
            <div className="sc-planes">
              <span className="sc-pill">Π₁ horizontal</span>
              <span className="sc-pill">Π₂ vertical</span>
              <span className="sc-pill">Π₃ perfil</span>
              <span className="sc-pill">8 diedros</span>
            </div>
          </div>
        </div>
        <div className="splash-note">Podés cambiar esta configuración volviendo al selector</div>
      </div>
    </div>
  );
}
