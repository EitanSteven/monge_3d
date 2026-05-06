import { useRef, useEffect, useState } from 'react';

export default function Viewport2D({ points, lines, view, scaleX = 4, isMobile = false }) {
  const canvasRef = useRef(null);
  const [size, setSize] = useState({ w:0, h:0 });

  // Estado para controles de zoom y pan
  const [zoom2D, setZoom2D] = useState(2.0); // Empezar 2x más cerca
  const panXRef = useRef(0);
  const [panX, setPanX] = useState(0);

  // Slider state
  const [sliderOffset, setSliderOffset] = useState(0);
  const sliderDragRef = useRef(false);
  const sliderStartX = useRef(0);
  const sliderStartOffset = useRef(0);

  const handleSliderStart = (e) => {
    sliderDragRef.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    sliderStartX.current = clientX;
    sliderStartOffset.current = sliderOffset;
  };

  const handleSliderMove = (e) => {
    if (!sliderDragRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = clientX - sliderStartX.current;
    const newOffset = Math.max(-100, Math.min(100, sliderStartOffset.current + delta));
    setSliderOffset(newOffset);

    // Zoom: mover a la derecha = zoom in (aumentar zoom2D)
    const newZoom = Math.max(0.5, Math.min(5, zoom2D + delta * 0.005));
    setZoom2D(newZoom);
  };

  const handleSliderEnd = () => {
    sliderDragRef.current = false;
    setSliderOffset(0);
  };

  // Window event listeners para el slider
  useEffect(() => {
    window.addEventListener('mousemove', handleSliderMove);
    window.addEventListener('mouseup', handleSliderEnd);
    window.addEventListener('touchmove', handleSliderMove, {passive: false});
    window.addEventListener('touchend', handleSliderEnd);

    return () => {
      window.removeEventListener('mousemove', handleSliderMove);
      window.removeEventListener('mouseup', handleSliderEnd);
      window.removeEventListener('touchmove', handleSliderMove);
      window.removeEventListener('touchend', handleSliderEnd);
    };
  }, []);

  // Touch handlers para pan con 2 dedos
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchStartX = 0;
    let touchStartPanX = 0;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        touchStartX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        touchStartPanX = panXRef.current;
        e.preventDefault();
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const delta = currentX - touchStartX;
        const newPanX = touchStartPanX + delta;
        panXRef.current = newPanX;
        setPanX(newPanX);
        e.preventDefault();
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, {passive: false});
    canvas.addEventListener('touchmove', handleTouchMove, {passive: false});

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ w: width, h: height });
        }
      }
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (view === '3d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w, h } = size;
    if (w === 0 || h === 0) return;
    const ctx = canvas.getContext('2d');
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0d0f14'; ctx.fillRect(0, 0, w, h);

    const baseScale = Math.min(w / (scaleX + 1), h / (scaleX + 1)) * 0.45;
    const scale = baseScale * zoom2D;
    const cx = w / 2 + panX;
    const midY = h / 2;

    const dQ = [
      {color:'rgba(74,158,255,0.07)',  x:0, y:0,    w:w,   h:midY},
      {color:'rgba(150,150,180,0.07)', x:0, y:midY, w:w,   h:h-midY},
    ];
    dQ.forEach(q => { ctx.fillStyle = q.color; ctx.fillRect(q.x, q.y, q.w, q.h); });

    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5;
    for (let i = -scaleX; i <= scaleX; i++) {
      ctx.beginPath(); ctx.moveTo(cx+i*scale, 0); ctx.lineTo(cx+i*scale, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, midY+i*scale); ctx.lineTo(w, midY+i*scale); ctx.stroke();
    }

    ctx.strokeStyle = '#e85444'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(w, midY); ctx.stroke();
    ctx.fillStyle = '#e85444';
    ctx.beginPath(); ctx.moveTo(w-4,midY); ctx.lineTo(w-14,midY-5); ctx.lineTo(w-14,midY+5); ctx.closePath(); ctx.fill();

    ctx.font = "400 11px 'DM Mono', monospace";
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.textAlign = 'left';
    ctx.fillText('Π₂  —  alzado', 10, 18);
    ctx.fillText('Π₁  —  planta', 10, midY + 18);
    ctx.fillStyle = '#e85444'; ctx.textAlign = 'right'; ctx.fillText('+X', w-18, midY-8);
    ctx.fillStyle = '#3db87a'; ctx.fillText('+Y', cx+6, midY+18);

    const toPi2 = (x, z) => [cx + x*scale, midY - z*scale];
    const toPi1 = (x, y) => [cx + x*scale, midY + y*scale];

    lines.forEach(ln => {
      const A = points.find(p => p.name === ln.a), B = points.find(p => p.name === ln.b);
      if (!A || !B) return;
      const [ax2,az2] = toPi2(A.x, A.z), [bx2,bz2] = toPi2(B.x, B.z);
      const [ax1,ay1] = toPi1(A.x, A.y), [bx1,by1] = toPi1(B.x, B.y);
      ctx.strokeStyle = ln.color + 'cc'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ax2,az2); ctx.lineTo(bx2,bz2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax1,ay1); ctx.lineTo(bx1,by1); ctx.stroke();
      ctx.fillStyle = ln.color; ctx.font = "500 11px 'DM Mono',monospace"; ctx.textAlign = 'center';
      ctx.fillText(ln.a+ln.b+'″', (ax2+bx2)/2-8, (az2+bz2)/2-7);
      ctx.fillText(ln.a+ln.b+'′', (ax1+bx1)/2-8, (ay1+by1)/2-7);
    });

    points.forEach(p => {
      const [px2,pz2] = toPi2(p.x, p.z);
      const [px1,py1] = toPi1(p.x, p.y);

      ctx.strokeStyle = p.color + '44'; ctx.lineWidth = 0.8; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(px2, pz2); ctx.lineTo(px2, midY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px1, midY); ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = p.color + '88'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(px2-4,midY); ctx.lineTo(px2+4,midY); ctx.stroke();

      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(px2, pz2, 5, 0, Math.PI*2); ctx.fill();
      ctx.font = "500 12px 'DM Mono',monospace"; ctx.textAlign = 'left';
      ctx.fillText(p.name+'″', px2+8, pz2-2);

      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(px1, py1, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillText(p.name+'′', px1+8, py1-2);
    });
  }, [points, lines, view, size]);

  return (
    <>
      <canvas id="canvas2d" ref={canvasRef} />
      {isMobile && view === 'flat' && (
        <div className="zoom-slider-wrapper">
          <div className="zoom-slider-container">
            <div className="zoom-slider-track">
              <div
                className="zoom-slider-thumb"
                style={{ left: `calc(50% + ${sliderOffset}px)` }}
                onMouseDown={handleSliderStart}
                onTouchStart={handleSliderStart}
              />
            </div>
          </div>
          <div className="zoom-tips">
            <div>Mueve el Slider para alejar o acercar.</div>
            <div>Usa los 2 dedos para moverte a la izquierda o derecha.</div>
          </div>
        </div>
      )}
    </>
  );
}
