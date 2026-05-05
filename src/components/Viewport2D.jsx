import { useRef, useEffect } from 'react';

export default function Viewport2D({ points, lines, view }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (view === '3d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0d0f14'; ctx.fillRect(0, 0, w, h);

    const cx = w / 2, midY = h / 2;
    const scale = Math.min(w, h) * 0.13;

    const dQ = [
      {color:'rgba(74,158,255,0.07)',  x:cx, y:0,    w:w-cx, h:midY},
      {color:'rgba(61,184,122,0.07)',  x:0,  y:0,    w:cx,   h:midY},
      {color:'rgba(242,201,76,0.07)', x:0,  y:midY, w:cx,   h:h-midY},
      {color:'rgba(232,84,68,0.07)',  x:cx, y:midY, w:w-cx, h:h-midY},
    ];
    dQ.forEach(q => { ctx.fillStyle = q.color; ctx.fillRect(q.x, q.y, q.w, q.h); });

    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath(); ctx.moveTo(cx+i*scale, 0); ctx.lineTo(cx+i*scale, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, midY+i*scale); ctx.lineTo(w, midY+i*scale); ctx.stroke();
    }

    ctx.strokeStyle = '#e85444'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(w, midY); ctx.stroke();
    ctx.fillStyle = '#e85444';
    ctx.beginPath(); ctx.moveTo(w-4,midY); ctx.lineTo(w-14,midY-5); ctx.lineTo(w-14,midY+5); ctx.closePath(); ctx.fill();

    ctx.strokeStyle = '#4a9eff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, midY); ctx.lineTo(cx, 6); ctx.stroke();
    ctx.fillStyle = '#4a9eff';
    ctx.beginPath(); ctx.moveTo(cx,5); ctx.lineTo(cx-5,16); ctx.lineTo(cx+5,16); ctx.closePath(); ctx.fill();

    ctx.strokeStyle = '#3db87a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, midY); ctx.lineTo(cx, h-6); ctx.stroke();
    ctx.fillStyle = '#3db87a';
    ctx.beginPath(); ctx.moveTo(cx,h-5); ctx.lineTo(cx-5,h-16); ctx.lineTo(cx+5,h-16); ctx.closePath(); ctx.fill();

    ctx.font = "400 11px 'DM Mono', monospace";
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.textAlign = 'left';
    ctx.fillText('Π₂  —  alzado / plano vertical', 10, 18);
    ctx.fillText('Π₁  —  planta / plano horizontal', 10, midY + 18);
    ctx.fillStyle = '#e85444'; ctx.textAlign = 'right'; ctx.fillText('+X', w-18, midY-8);
    ctx.fillStyle = '#4a9eff'; ctx.textAlign = 'left';  ctx.fillText('+Z', cx+6, 14);
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
  }, [points, lines, view]);

  return <canvas id="canvas2d" ref={canvasRef} />;
}
