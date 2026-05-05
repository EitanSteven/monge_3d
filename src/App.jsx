import { useState, useEffect, useCallback } from 'react';
import Splash from './components/Splash';
import Header from './components/Header';
import Viewport3D from './components/Viewport3D';
import Viewport2D from './components/Viewport2D';
import Sidebar from './components/Sidebar';
import Modal from './components/Modal';
import { PT_COLORS } from './data/constants';

const DEFAULT_POINTS = [
  {name:'A', x:1.5, y:1,   z:1.5, color:PT_COLORS[0]},
  {name:'B', x:-1,  y:1.5, z:1,   color:PT_COLORS[1]},
  {name:'C', x:1.5, y:0.5, z:-1,  color:PT_COLORS[2]},
];
const DEFAULT_LINES = [{a:'A', b:'B', color:PT_COLORS[3]}];

export default function App() {
  const [planeMode, setPlaneMode] = useState(null);
  const [view, setView] = useState('split');
  const [diedrosVisible, setDiedrosVisible] = useState(true);
  const [points, setPoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('point');

  const handleSelectMode = useCallback((mode) => {
    setPlaneMode(mode);
    setPoints(DEFAULT_POINTS);
    setLines(DEFAULT_LINES);
  }, []);

  const handleGoBack = useCallback(() => {
    setPlaneMode(null);
    setPoints([]);
    setLines([]);
  }, []);

  const toggleDiedros = useCallback(() => {
    setDiedrosVisible(prev => !prev);
  }, []);

  const handleAdd = useCallback(({ type, data }) => {
    if (type === 'point') {
      setPoints(prev => [...prev, data]);
    } else if (type === 'line') {
      setLines(prev => [...prev, data]);
    }
    setModalOpen(false);
  }, []);

  const handleDeletePoint = useCallback((i) => {
    const name = points[i].name;
    setLines(prev => prev.filter(l => l.a !== name && l.b !== name));
    setPoints(prev => prev.filter((_, idx) => idx !== i));
  }, [points]);

  const handleDeleteLine = useCallback((i) => {
    setLines(prev => prev.filter((_, idx) => idx !== i));
  }, []);

  const openModal = useCallback((mode) => {
    if (mode === 'line' && points.length < 2) {
      alert('Necesitás al menos 2 puntos.');
      return;
    }
    setModalMode(mode);
    setModalOpen(true);
  }, [points]);

  useEffect(() => {
    document.body.className = view;
  }, [view]);

  if (planeMode === null) {
    return <Splash onSelect={handleSelectMode} />;
  }

  const hint = view === 'flat'
    ? 'Vista plana — Π₂ alzado (arriba) · Π₁ planta (abajo) · eje X = charnela'
    : 'Vista 3D — arrastrá para orbitar · scroll para zoom';

  return (
    <>
      <div id="app">
        <Header
          view={view}
          setView={setView}
          diedrosVisible={diedrosVisible}
          toggleDiedros={toggleDiedros}
          onGoBack={handleGoBack}
        />
        <div id="viewport">
          <Viewport3D
            points={points}
            lines={lines}
            planeMode={planeMode}
            diedrosVisible={diedrosVisible}
            view={view}
          />
          <Viewport2D
            points={points}
            lines={lines}
            view={view}
          />
          <div id="hint">{hint}</div>
        </div>
        <Sidebar
          points={points}
          lines={lines}
          onAddPoint={() => openModal('point')}
          onAddLine={() => openModal('line')}
          onDeletePoint={handleDeletePoint}
          onDeleteLine={handleDeleteLine}
        />
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        points={points}
        lines={lines}
        mode={modalMode}
      />
    </>
  );
}
