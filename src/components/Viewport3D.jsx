import { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';
import { DIEDRO_COLORS, PT_COLORS, PLANE_HALF, PLANE_HALF_ALT } from '../data/constants';

function createSprite(text, color, scale = 0.55) {
  const c = document.createElement('canvas');
  c.width = 80; c.height = 40;
  const ctx = c.getContext('2d');
  ctx.fillStyle = color;
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 40, 20);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({map: new THREE.CanvasTexture(c), depthTest: false, transparent: true}));
  spr.scale.set(scale, scale * 0.5, 1);
  return spr;
}

function createPtSprite(text, color) {
  const c = document.createElement('canvas');
  c.width = 100; c.height = 56;
  const ctx = c.getContext('2d');
  ctx.fillStyle = color;
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 50, 28);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({map: new THREE.CanvasTexture(c), depthTest: false, transparent: true}));
  spr.scale.set(0.55, 0.31, 1);
  return spr;
}

function makeSphere(x, y, z, color, r = 0.09) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), new THREE.MeshBasicMaterial({color}));
  m.position.set(x, y, z);
  return m;
}

function dashLine(a, b, color) {
  const pts = [];
  for (let i = 0; i < 24; i++) {
    const t0 = i / 24, t1 = (i + 0.45) / 24;
    pts.push(new THREE.Vector3(a[0]+(b[0]-a[0])*t0, a[1]+(b[1]-a[1])*t0, a[2]+(b[2]-a[2])*t0));
    pts.push(new THREE.Vector3(a[0]+(b[0]-a[0])*t1, a[1]+(b[1]-a[1])*t1, a[2]+(b[2]-a[2])*t1));
  }
  return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color, opacity: 0.5, transparent: true}));
}

function solidLine(a, b, color) {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]),
    new THREE.LineBasicMaterial({color})
  );
}

function axis(group, from, to, color) {
  group.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from), new THREE.Vector3(...to)]),
    new THREE.LineBasicMaterial({color})
  ));
}

function axisDash(group, from, to, color) {
  const pts = [];
  for (let i = 0; i < 12; i++) {
    const t0 = i / 12, t1 = (i + 0.45) / 12;
    pts.push(new THREE.Vector3(from[0]+(to[0]-from[0])*t0, from[1]+(to[1]-from[1])*t0, from[2]+(to[2]-from[2])*t0));
    pts.push(new THREE.Vector3(from[0]+(to[0]-from[0])*t1, from[1]+(to[1]-from[1])*t1, from[2]+(to[2]-from[2])*t1));
  }
  group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color, opacity: 0.35, transparent: true})));
}

function makeCone(dir, pos, color) {
  const g = new THREE.ConeGeometry(0.06, 0.22, 10);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({color}));
  m.position.set(...pos);
  if (dir === 'x') m.rotation.z = -Math.PI / 2;
  if (dir === 'z') m.rotation.x = Math.PI / 2;
  return m;
}

function addQuad(group, vertices, color, opacity = 0.09) {
  const geo = new THREE.BufferGeometry();
  const v = vertices;
  const pos = new Float32Array([
    v[0][0],v[0][1],v[0][2], v[1][0],v[1][1],v[1][2], v[2][0],v[2][1],v[2][2],
    v[0][0],v[0][1],v[0][2], v[2][0],v[2][1],v[2][2], v[3][0],v[3][1],v[3][2],
  ]);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  group.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color, opacity, transparent:true, side:THREE.DoubleSide, depthWrite:false})));
}

function edgeLine(group, pts, color) {
  const closed = [...pts, pts[0]];
  group.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(closed.map(p => new THREE.Vector3(...p))),
    new THREE.LineBasicMaterial({color, opacity:0.25, transparent:true})
  ));
}

export default function Viewport3D({ points, lines, planeMode, diedrosVisible, view, scaleX = 4, isMobile = false }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const staticGroupRef = useRef(null);
  const dynGroupRef = useRef(null);
  const gridRef = useRef(null);
  const diedroLabelsRef = useRef([]);
  const controlsRef = useRef({theta: 35, phi: 28, radius: 16, target: new THREE.Vector3(0,0,0)});
  const animRef = useRef(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  const [sliderOffset, setSliderOffset] = useState(0);

  const updateCamera = useCallback(() => {
    const camera = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!camera || !ctrl) return;
    const t = ctrl.theta * Math.PI / 180, p = ctrl.phi * Math.PI / 180;
    camera.position.set(
      ctrl.target.x + ctrl.radius * Math.cos(p) * Math.sin(t),
      ctrl.target.y + ctrl.radius * Math.sin(p),
      ctrl.target.z + ctrl.radius * Math.cos(p) * Math.cos(t)
    );
    camera.lookAt(ctrl.target);
  }, []);
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

      const ctrl = controlsRef.current;
      ctrl.radius = Math.max(4, Math.min(40, ctrl.radius - delta * 0.025));
      updateCamera();
    };

  const handleSliderEnd = () => {
    sliderDragRef.current = false;
    setSliderOffset(0);
  };

  const initScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || sceneRef.current) return;

    const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x0d0f14, 1);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 500);
    cameraRef.current = camera;

    const staticGroup = new THREE.Group();
    scene.add(staticGroup);
    staticGroupRef.current = staticGroup;

    const dynGroup = new THREE.Group();
    scene.add(dynGroup);
    dynGroupRef.current = dynGroup;

    // Grid en XZ (Y=0 es el plano horizontal Pi 1)
    const grid = new THREE.GridHelper(scaleX * 2, scaleX * 4, 0x222530, 0x1a1e28);
    grid.position.y = 0.001;
    staticGroup.add(grid);
    gridRef.current = grid;

    // Ejes: X rojo (abscisas), Y azul (alejamiento/profundidad)
    axis(staticGroup, [0,0,0], [scaleX+0.4,0,0], 0xe85444);
    axisDash(staticGroup, [-scaleX,0,0], [0,0,0], 0xe85444);
    axis(staticGroup, [0,0,0], [0,0,scaleX+0.4], 0x4a9eff);
    axisDash(staticGroup, [0,0,-scaleX], [0,0,0], 0x4a9eff);

    staticGroup.add(makeCone('x', [scaleX+0.3, 0, 0], 0xe85444));
    staticGroup.add(makeCone('z', [0, 0, scaleX+0.3], 0x4a9eff));

    const axLblX = createSprite('+X', '#e85444'); axLblX.position.set(scaleX+0.7, 0.2, 0); staticGroup.add(axLblX);
    const axLblY = createSprite('+Y', '#4a9eff'); axLblY.position.set(0.2, 0.2, scaleX+0.7); staticGroup.add(axLblY);

    // Controls
    let drag = false, pan = false, lx = 0, ly = 0;
    const ctrl = controlsRef.current;

    updateCamera();

    canvas.addEventListener('mousedown', e => {
      e.preventDefault();
      lx = e.clientX; ly = e.clientY;
      if (e.button === 1) pan = true;
      else drag = true;
    });
    window.addEventListener('mouseup', () => { drag = false; pan = false; });
    window.addEventListener('mousemove', e => {
      if (!drag && !pan) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      if (drag) {
        ctrl.theta -= dx * 0.35;
        ctrl.phi = Math.max(-85, Math.min(85, ctrl.phi - dy * 0.35));
      } else if (pan) {
        const panSpeed = ctrl.radius * 0.0015;
        const t = ctrl.theta * Math.PI / 180;
        const right = new THREE.Vector3(Math.cos(t), 0, -Math.sin(t));
        const up = new THREE.Vector3(0, 1, 0);
        ctrl.target.addScaledVector(right, -dx * panSpeed);
        ctrl.target.addScaledVector(up, dy * panSpeed);
      }
      updateCamera();
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('wheel', e => {
      ctrl.radius = Math.max(4, Math.min(40, ctrl.radius + e.deltaY * 0.025));
      updateCamera();
    }, {passive: true});
    let pinchDist = 0, pinchCenterX = 0, pinchCenterY = 0;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        drag = true;
        lx = e.touches[0].clientX;
        ly = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        drag = false;
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        pinchDist = Math.sqrt(dx*dx + dy*dy);
        pinchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        pinchCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
    });
    canvas.addEventListener('touchend', () => { drag = false; });
    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        e.preventDefault(); // Prevent browser pinch-to-zoom
      }
      if (e.touches.length === 1 && drag) {
        ctrl.theta -= (e.touches[0].clientX - lx) * 0.35;
        ctrl.phi = Math.max(-85, Math.min(85, ctrl.phi - (e.touches[0].clientY - ly) * 0.35));
        lx = e.touches[0].clientX; ly = e.touches[0].clientY;
        updateCamera();
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const newDist = Math.sqrt(dx*dx + dy*dy);
        const newCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const newCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        // Pinch-to-zoom: spread (aumentar distancia) = zoom in, pinch (disminuir) = zoom out
        const distDelta = newDist - pinchDist;
        ctrl.radius = Math.max(4, Math.min(40, ctrl.radius - distDelta * 0.05));

        // Horizontal movement = pan (left/right camera movement)
        const horizDelta = newCenterX - pinchCenterX;
        const panSpeed = ctrl.radius * 0.004;
        const t = ctrl.theta * Math.PI / 180;
        ctrl.target.x += Math.cos(t) * -horizDelta * panSpeed;
        ctrl.target.z += -Math.sin(t) * -horizDelta * panSpeed;

        pinchDist = newDist;
        pinchCenterX = newCenterX;
        pinchCenterY = newCenterY;
        updateCamera();
      }
    });

    // Slider event listeners
    window.addEventListener('mousemove', handleSliderMove);
    window.addEventListener('mouseup', handleSliderEnd);
    window.addEventListener('touchmove', handleSliderMove, {passive: true});
    window.addEventListener('touchend', handleSliderEnd);

    // Resize: just match the canvas's actual rendered size (CSS handles layout)
    const resize = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      if (W === 0 || H === 0) return;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(canvas.parentElement);
    resize();

    // Animate
    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      if (viewRef.current !== 'flat') renderer.render(scene, camera);
    };
    animate();
  }, []);

  // Resize when view changes
  useEffect(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!renderer || !camera) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    if (W === 0 || H === 0) return;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }, [view]);

  // Build planes
  const buildPlanes = useCallback((mode) => {
    const group = staticGroupRef.current;
    if (!group) return;

    // Clear existing planes, labels, edge lines, and sprites (keep grid, axes, cones, axis labels)
    const toRemove = [];
    group.children.forEach(child => {
      if (child === gridRef.current) return;
      if (child.type === 'Mesh' && child.material.transparent) toRemove.push(child);
      if (child.type === 'Line' && child.material.transparent) toRemove.push(child);
      if (child.type === 'LineSegments' && child.material.transparent && child.material.color.getHex() !== 0x222530) toRemove.push(child);
      if (child.type === 'Sprite') toRemove.push(child);
    });
    toRemove.forEach(child => {
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    diedroLabelsRef.current = [];

    // Pi 1 (horizontal): Y=0, XZ plane
    const pi1Halves = [
      {c: PLANE_HALF,     v:[[-scaleX,0,0],[scaleX,0,0],[scaleX,0,scaleX],[-scaleX,0,scaleX]]},
      {c: PLANE_HALF_ALT, v:[[scaleX,0,0],[-scaleX,0,0],[-scaleX,0,-scaleX],[scaleX,0,-scaleX]]},
    ];
    // Pi 2 (vertical): Z=0, XY plane
    const pi2Quads = [
      {c:DIEDRO_COLORS[0], v:[[0,0,0],[scaleX,0,0],[scaleX,scaleX,0],[0,scaleX,0]]},
      {c:DIEDRO_COLORS[0], v:[[-scaleX,0,0],[0,0,0],[0,scaleX,0],[-scaleX,scaleX,0]]},
      {c:DIEDRO_COLORS[1], v:[[-scaleX,0,0],[0,0,0],[0,-scaleX,0],[-scaleX,-scaleX,0]]},
      {c:DIEDRO_COLORS[1], v:[[0,0,0],[scaleX,0,0],[scaleX,-scaleX,0],[0,-scaleX,0]]},
    ];
    // Pi 3 (perfil): X=0, YZ plane
    const pi3Quads = [
      {c:DIEDRO_COLORS[0], v:[[0,0,0],[0,scaleX,0],[0,scaleX,scaleX],[0,0,scaleX]]},
      {c:DIEDRO_COLORS[1], v:[[0,0,0],[0,-scaleX,0],[0,-scaleX,scaleX],[0,0,scaleX]]},
      {c:DIEDRO_COLORS[2], v:[[0,0,0],[0,-scaleX,0],[0,-scaleX,-scaleX],[0,0,-scaleX]]},
      {c:DIEDRO_COLORS[3], v:[[0,0,0],[0,scaleX,0],[0,scaleX,-scaleX],[0,0,-scaleX]]},
    ];

    const allQuads = mode === 3
      ? [...pi1Halves, ...pi2Quads, ...pi3Quads]
      : [...pi1Halves, ...pi2Quads];

    allQuads.forEach(d => addQuad(group, d.v, d.c));

    // Edge lines
    edgeLine(group, [[-scaleX,0,-scaleX],[scaleX,0,-scaleX],[scaleX,0,scaleX],[-scaleX,0,scaleX]], 0x444455);
    edgeLine(group, [[-scaleX,-scaleX,0],[scaleX,-scaleX,0],[scaleX,scaleX,0],[-scaleX,scaleX,0]], 0x444455);
    if (mode === 3) {
      edgeLine(group, [[-scaleX,0,0],[-scaleX,scaleX,0],[-scaleX,scaleX,0],[-scaleX,-scaleX,0]], 0x444455);
      const p3lbl = createSprite('Π₃', 'rgba(160,130,200,1)');
      p3lbl.position.set(-scaleX-0.3, 0.2, scaleX+0.5); group.add(p3lbl);
    }

    const p1lbl = createSprite('Π₁', 'rgba(150,150,180,1)');
    p1lbl.position.set(scaleX+0.4, 0.2, -scaleX-0.3); group.add(p1lbl);
    const p2lbl = createSprite('Π₂', 'rgba(150,150,180,1)');
    p2lbl.position.set(-scaleX-0.3, scaleX*0.5, 0.2); group.add(p2lbl);

    // Diedro labels flotantes
    const labels = [];
    function dLabel(text, pos) {
      const s = createSprite(text, 'rgba(100,100,130,1)', 0.5);
      s.position.set(...pos);
      group.add(s);
      labels.push(s);
      s.visible = diedrosVisible;
    }
    dLabel('I',   [0,  scaleX*0.5,  scaleX*0.5]);
    dLabel('II',  [0,  scaleX*0.5, -scaleX*0.5]);
    dLabel('III', [0, -scaleX*0.5, -scaleX*0.5]);
    dLabel('IV',  [0, -scaleX*0.5,  scaleX*0.5]);
    diedroLabelsRef.current = labels;
  }, [diedrosVisible, scaleX]);

  // Update points/lines
  const updateDynamic = useCallback(() => {
    const group = dynGroupRef.current;
    if (!group) return;
    while (group.children.length) group.remove(group.children[0]);

    points.forEach(p => {
      const col = parseInt(p.color.replace('#',''), 16);
      const {x, y, z} = p;

      // Three.js: X→X, Y(alejamiento)→Z, Z(cota)→Y
      group.add(makeSphere(x, z, y, col));
      const lbl = createPtSprite(p.name, p.color);
      lbl.position.set(x+0.05, z+0.18, y+0.05);
      group.add(lbl);

      // Proyección en Π₁ (y=0 en Three.js Y, porque Π₁ está en Y=0)
      group.add(makeSphere(x, 0, y, col, 0.055));
      const l1 = createPtSprite(p.name + '\u2032', p.color);
      l1.position.set(x+0.05, 0.05, y+0.18);
      group.add(l1);

      // Proyección en Π₂ (z=0 en Three.js Z, porque Π₂ está en Z=0)
      group.add(makeSphere(x, z, 0, col, 0.055));
      const l2 = createPtSprite(p.name + '\u2033', p.color);
      l2.position.set(x+0.05, z+0.18, 0.05);
      group.add(l2);

      group.add(dashLine([x,z,y], [x,0,y], col));
      group.add(dashLine([x,z,y], [x,z,0], col));
      group.add(dashLine([x,0,y], [x,0,0], col));
      group.add(dashLine([x,z,0], [x,0,0], col));
    });

    lines.forEach(ln => {
      const A = points.find(p => p.name === ln.a);
      const B = points.find(p => p.name === ln.b);
      if (!A || !B) return;
      const col = parseInt(ln.color.replace('#',''), 16);
      group.add(solidLine([A.x,A.z,A.y], [B.x,B.z,B.y], col));
      group.add(solidLine([A.x,0,A.y],   [B.x,0,B.y],   col));
      group.add(solidLine([A.x,A.z,0],   [B.x,B.z,0],   col));
    });
  }, [points, lines]);

  // Update diedro visibility
  useEffect(() => {
    diedroLabelsRef.current.forEach(l => { l.visible = diedrosVisible; });
  }, [diedrosVisible]);

  // Init scene once
  useEffect(() => { initScene(); }, [initScene]);

  // Build planes on mount or mode change
  useEffect(() => {
    buildPlanes(planeMode);
    updateDynamic();
  }, [planeMode, buildPlanes, updateDynamic]);

  // Update dynamic on data change
  useEffect(() => { updateDynamic(); }, [points, lines, updateDynamic]);

  return (
    <>
      <canvas id="canvas3d" ref={canvasRef} />
      {isMobile && view === '3d' && (
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
            <div>Mueve el Slider alejar o acercar.</div>
            <div>Usa 2 dedos para moverte horizontalmente.</div>
          </div>
        </div>
      )}
    </>
  );
}
