export default function MobileMenu({
  points, lines, scaleX, onToggleScale,
  onAddPoint, onAddLine, onDeletePoint, onDeleteLine,
  isOpen, onClose
}) {
  return (
    <div id="mobile-menu" className={isOpen ? 'open' : ''}>
      <button className="mm-close" onClick={onClose}>✕ Cerrar</button>

      <div className="mm-section">
        <div className="mm-title">Agregar</div>
        <button className="add-btn" onClick={() => { onToggleScale(); }}>⤢ Dimensión X: {scaleX === 4 ? '4 (Base)' : '7 (Expandido)'}</button>
        <button className="add-btn" onClick={() => { onAddPoint(); onClose && onClose(); }}>● Nuevo punto</button>
        <button className="add-btn" onClick={() => { onAddLine(); onClose && onClose(); }}>— Nueva línea</button>
      </div>

      <div className="mm-section">
        <div className="mm-title">Elementos</div>
        {points.length === 0 && lines.length === 0 ? (
          <div style={{fontSize:11,color:'var(--text3)',lineHeight:1.7}}>Sin elementos.<br/>Agregá un punto<br/>para comenzar.</div>
        ) : (
          <>
            {points.map((p, i) => (
              <div key={p.name} className="el-item">
                <div className="el-color" style={{background:p.color}}></div>
                <div className="el-name">{p.name}</div>
                <div className="el-coord">({p.x}, {p.y}, {p.z})</div>
                <div className="el-del" onClick={() => onDeletePoint(i)} title="Eliminar">×</div>
              </div>
            ))}
            {lines.length > 0 && <div style={{height:1,background:'var(--border)',margin:'4px 0'}} />}
            {lines.map((ln, i) => (
              <div key={`${ln.a}${ln.b}`} className="el-item">
                <div className="el-line-icon" style={{background:ln.color}}></div>
                <div className="el-name">{ln.a}{ln.b}</div>
                <div className="el-coord">línea</div>
                <div className="el-del" onClick={() => onDeleteLine(i)} title="Eliminar">×</div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="mm-section">
        <div className="mm-title">Referencias</div>
        <div className="mm-ref-grid">
          <div className="mm-ref-item">
            <div className="mm-ref-dot" style={{background:'var(--red)'}}></div><b>+X</b> Abscisas
          </div>
          <div className="mm-ref-item">
            <div className="mm-ref-dot" style={{background:'var(--blue)'}}></div><b>+Y</b> Alejamiento
          </div>
        </div>
      </div>

      <div className="mm-section">
        <div className="mm-title">Diedros</div>
        <div className="legend">
          <div className="leg-row"><div className="leg-sq" style={{background:'#4a9eff'}}></div>Diedro I — Y+ Z+</div>
          <div className="leg-row"><div className="leg-sq" style={{background:'#3db87a'}}></div>Diedro II — Y− Z+</div>
          <div className="leg-row"><div className="leg-sq" style={{background:'#f2c94c'}}></div>Diedro III — Y− Z−</div>
          <div className="leg-row"><div className="leg-sq" style={{background:'#e85444'}}></div>Diedro IV — Y+ Z−</div>
        </div>
      </div>

      <div className="mm-section" style={{fontSize:10,color:'var(--text3)',lineHeight:1.7}}>
        <div className="mm-title">Notación</div>
        <span style={{color:'var(--text2)'}}>A′</span> proyección en Π₁ (planta)<br/>
        <span style={{color:'var(--text2)'}}>A″</span> proyección en Π₂ (alzado)
      </div>

      <div className="mm-section" style={{fontSize:10,color:'var(--text3)',lineHeight:1.7}}>
        <div className="mm-title">Controles móviles</div>
        <b>1 dedo:</b> rotar vista 3D<br/>
        <b>2 dedos ↕:</b> zoom in/out<br/>
        <b>2 dedos ↔:</b> desplazar cámara<br/>
        <b>Tap:</b> seleccionar
      </div>
    </div>
  );
}