export default function Sidebar({ points, lines, scaleX, onToggleScale, onAddPoint, onAddLine, onDeletePoint, onDeleteLine }) {
  return (
    <div id="sidebar">
      <div className="sb-section">
        <div className="sb-title">Agregar</div>
        <button className="add-btn" onClick={onToggleScale}><span className="ico">⤢</span> Dimensión X: {scaleX === 4 ? '4 (Base)' : '7 (Expandido)'}</button>
        <button className="add-btn" onClick={onAddPoint}><span className="ico">●</span> Nuevo punto</button>
        <button className="add-btn" onClick={onAddLine}><span className="ico">—</span> Nueva línea</button>
      </div>
      <div className="sb-section">
        <div className="sb-title">Elementos</div>
      </div>
      <div id="el-scroll">
        {points.length === 0 && lines.length === 0 ? (
          <div style={{padding:16,fontSize:11,color:'var(--text3)',lineHeight:1.7}}>Sin elementos.<br/>Agregá un punto<br/>para comenzar.</div>
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
      <div className="sb-section">
        <div className="sb-title">Diedros</div>
        <div className="legend">
          <div className="leg-row"><div className="leg-sq" style={{background:'#4a9eff'}}></div>Diedro I — Y+ Z+</div>
          <div className="leg-row"><div className="leg-sq" style={{background:'#3db87a'}}></div>Diedro II — Y− Z+</div>
          <div className="leg-row"><div className="leg-sq" style={{background:'#f2c94c'}}></div>Diedro III — Y− Z−</div>
          <div className="leg-row"><div className="leg-sq" style={{background:'#e85444'}}></div>Diedro IV — Y+ Z−</div>
        </div>
      </div>
      <div className="sb-section" style={{fontSize:10,color:'var(--text3)',lineHeight:1.7}}>
        <span style={{color:'var(--text2)'}}>A′</span> proyección en Π₁ (planta)<br/>
        <span style={{color:'var(--text2)'}}>A″</span> proyección en Π₂ (alzado)
      </div>
    </div>
  );
}
