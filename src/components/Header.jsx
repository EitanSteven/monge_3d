import logo from '/public/favicon.svg';

export default function Header({ view, setView, diedrosVisible, toggleDiedros, onGoBack, isMobile, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <header>
      {isMobile && onGoBack && (
        <button className="back-btn" onClick={() => { onGoBack(); setMobileMenuOpen(false); }}>←</button>
      )}
      <div className="logo">
        <img src={logo} alt="Monge" className="nav-logo" />
        {!isMobile && <span>Método de <span>Monge</span></span>}
      </div>
      {!isMobile && <div className="header-sep"></div>}
      {!isMobile && <button className="back-btn" onClick={onGoBack}>Volver</button>}
      {!isMobile && <div className="header-sep"></div>}
      <div className="view-tabs">
        <button className={`view-tab ${view === '3d' ? 'active' : ''}`} onClick={() => setView('3d')}>3D</button>
        <button className={`view-tab ${view === 'flat' ? 'active' : ''}`} onClick={() => setView('flat')}>Plana</button>
      </div>
      {!isMobile && <div className="header-sep"></div>}
      <button className={`diedro-toggle ${!diedrosVisible ? 'off' : ''}`} onClick={toggleDiedros}>
        Diedros: {diedrosVisible ? 'ON' : 'OFF'}
      </button>
      {!isMobile && (
        <>
          <div className="header-sep"></div>
          <div className="axis-badge"><div className="axis-dot" style={{background:'var(--red)'}}></div>X Abscisas</div>
          <div className="axis-badge"><div className="axis-dot" style={{background:'var(--blue)'}}></div>Y Alejamiento</div>
          <div className="header-right">
            <kbd>drag</kbd><span style={{fontSize:10,color:'var(--text3)'}}>rotar</span>
            <kbd>rueda↕</kbd><span style={{fontSize:10,color:'var(--text3)'}}>zoom</span>
            <kbd>rueda⊙</kbd><span style={{fontSize:10,color:'var(--text3)'}}>pan</span>
          </div>
        </>
      )}
      {isMobile && (
        <button className="back-btn" style={{marginLeft:'auto'}} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          ☰
        </button>
      )}
    </header>
  );
}
