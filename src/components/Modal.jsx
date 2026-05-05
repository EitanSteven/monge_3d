import { useEffect, useRef } from 'react';
import { NAMES, PT_COLORS } from '../data/constants';

export default function Modal({ isOpen, onClose, onAdd, points, lines, mode }) {
  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && isOpen) handleConfirm();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, mode, points, lines, onClose, onAdd]);

  const handleConfirm = () => {
    if (mode === 'point') {
      const x = parseFloat(document.getElementById('mx')?.value) || 0;
      const y = parseFloat(document.getElementById('my')?.value) || 0;
      const z = parseFloat(document.getElementById('mz')?.value) || 0;
      const name = NAMES[points.length] || '?';
      const color = PT_COLORS[points.length % PT_COLORS.length];
      onAdd({ type: 'point', data: { name, x, y, z, color } });
    } else if (mode === 'line') {
      const a = document.getElementById('la')?.value;
      const b = document.getElementById('lb')?.value;
      if (a === b) { alert('Elegí dos puntos distintos.'); return; }
      const exists = lines.some(l => (l.a === a && l.b === b) || (l.a === b && l.b === a));
      if (exists) { alert('Esa línea ya existe.'); return; }
      const color = PT_COLORS[(points.length + 3) % PT_COLORS.length];
      onAdd({ type: 'line', data: { a, b, color } });
    }
  };

  if (!isOpen) return null;

  return (
    <div id="modal-overlay" className="open" ref={overlayRef} onClick={e => { if (e.target === overlayRef.current) onClose(); }}>
      <div id="modal">
        <div className="modal-title">
          {mode === 'point' ? `Nuevo punto — ${NAMES[points.length] || '?'}` : 'Nueva línea'}
        </div>
        <div id="modal-body">
          {mode === 'point' ? (
            <>
              <div className="field">
                <label>Abscisa X</label>
                <input type="number" id="mx" defaultValue="1.5" step="0.5" ref={firstInputRef} />
              </div>
              <div className="field">
                <label>Alejamiento Y</label>
                <input type="number" id="my" defaultValue="1" step="0.5" />
              </div>
              <div className="field">
                <label>Cota Z</label>
                <input type="number" id="mz" defaultValue="1.5" step="0.5" />
              </div>
            </>
          ) : (
            <>
              <div className="field">
                <label>Punto origen</label>
                <select id="la">
                  {points.map(p => <option key={p.name} value={p.name}>{p.name} ({p.x},{p.y},{p.z})</option>)}
                </select>
              </div>
              <div className="field">
                <label>Punto destino</label>
                <select id="lb">
                  {points.map((p, i) => <option key={p.name} value={p.name} defaultSelected={i===1}>{p.name} ({p.x},{p.y},{p.z})</option>)}
                </select>
              </div>
            </>
          )}
        </div>
        <div className="modal-btns">
          <button className="modal-btn cancel" onClick={onClose}>Cancelar</button>
          <button className="modal-btn confirm" onClick={handleConfirm}>Agregar</button>
        </div>
      </div>
    </div>
  );
}
