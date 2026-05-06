import { useEffect } from 'react';
import logo from '/public/favicon.svg';

export default function Splash({ onSelect }) {
  useEffect(() => {
    document.body.classList.add('splash-active');
    return () => {
      document.body.classList.remove('splash-active');
    };
  }, []);

  return (
    <div id="splash">
      <div className="splash-inner">
        <img src={logo} alt="Monge Logo" className="splash-logo" />
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
        <div className="splash-footer">
          <div className="footer-info">
            <hr className="footer-hr" />
            <p>Desarrollado por <a href="https://github.com/EitanSteven" target="_blank" rel="noopener noreferrer">Eitan Steven Gil</a></p>
            <p>Repositorio: <a href="https://github.com/EitanSteven/monge_3d/tree/master" target="_blank" rel="noopener noreferrer">github.com/EitanSteven/monge_3d</a></p>
            <p className="footer-institute">
              <strong>Instituto Educativo:</strong>{' '}
              <a href="https://instituto130.com.ar/wp/" target="_blank" rel="noopener noreferrer">
                Instituto Superior de Formación Técnica N° 130
              </a>
            </p>
            <p>Licencia libre de uso</p>
          </div>
        </div>
      </div>
    </div>
  );
}
