'use client';
import { useEffect, useRef } from 'react';

/** A hexagonal line lattice that responds only inside its own project section. */
export function LiveProjectGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = canvas?.parentElement?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !surface || !context) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let width = 0, height = 0, frame = 0, visible = true;
    let targetX = 0, targetY = 0, x = 0, y = 0, strength = 0, targetStrength = 0;
    let lastClientX = 0, lastClientY = 0, inside = false, previousTime = 0;
    const hexRadius = 36;
    let edges: [number, number, number, number][] = [];
    const buildLattice = () => {
      const unitX = hexRadius / 2, unitY = Math.sqrt(3) * hexRadius / 2;
      const corners = [[2, 0], [1, 1], [-1, 1], [-2, 0], [-1, -1], [1, -1]];
      const seen = new Set<string>();
      edges = [];
      for (let column = -2; column <= Math.ceil(width / (3 * unitX)) + 2; column++) {
        for (let row = -2; row <= Math.ceil(height / (2 * unitY)) + 2; row++) {
          const centerX = column * 3, centerY = row * 2 + ((column % 2) + 2) % 2;
          const vertices = corners.map(([dx, dy]) => [centerX + dx, centerY + dy]);
          for (let side = 0; side < 6; side++) {
            const a = vertices[side], b = vertices[(side + 1) % 6];
            // Shared boundaries are drawn once so every line has the same opacity.
            const key = [a.join(','), b.join(',')].sort().join('|');
            if (seen.has(key)) continue;
            seen.add(key);
            edges.push([a[0] * unitX, a[1] * unitY, b[0] * unitX, b[1] * unitY]);
          }
        }
      }
    };
    const paint = () => {
      context.clearRect(0, 0, width, height);
      const radius = 190;
      const point = (px: number, py: number) => {
        const dx = x - px, dy = y - py, distance = Math.hypot(dx, dy);
        const pull = Math.max(0, 1 - distance / radius) ** 2 * .48 * strength;
        return [px + dx * pull, py + dy * pull];
      };
      context.lineWidth = .8;
      context.strokeStyle = 'rgba(35, 49, 66, .17)';
      context.beginPath();
      for (const [ax, ay, bx, by] of edges) {
        const a = point(ax, ay), b = point(bx, by);
        context.moveTo(a[0], a[1]);
        context.lineTo(b[0], b[1]);
      }
      context.stroke();
    };
    const animate = (time: number) => {
      frame = 0;
      if (!visible) return;
      const elapsed = previousTime ? Math.min(time - previousTime, 40) : 16;
      previousTime = time;
      const easing = 1 - Math.exp(-elapsed / 72);
      x += (targetX - x) * easing;
      y += (targetY - y) * easing;
      strength += (targetStrength - strength) * easing;
      paint();
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > .15 || Math.abs(targetStrength - strength) > .003) frame = requestAnimationFrame(animate);
      else previousTime = 0;
    };
    const requestPaint = () => { if (!frame && visible) frame = requestAnimationFrame(animate); };
    const localPointer = () => {
      const bounds = canvas.getBoundingClientRect();
      targetX = lastClientX - bounds.left;
      targetY = lastClientY - bounds.top;
    };
    const resize = () => {
      width = surface.clientWidth;
      height = Math.min(surface.offsetHeight, window.innerHeight);
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.ceil(width * ratio); canvas.height = Math.ceil(height * ratio);
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      buildLattice();
      if (inside) localPointer();
      paint();
    };
    const move = (event: PointerEvent) => {
      if (motion.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
      lastClientX = event.clientX; lastClientY = event.clientY;
      localPointer();
      if (!inside) { x = targetX; y = targetY; }
      inside = true;
      targetStrength = (event.target as Element).closest('[data-grid-card],button,a,input,select,textarea') ? 0 : 1;
      requestPaint();
    };
    const leave = () => { inside = false; targetStrength = 0; requestPaint(); };
    const scroll = () => { if (inside) { localPointer(); requestPaint(); } };
    const preference = () => { if (motion.matches || !finePointer.matches) { strength = targetStrength = 0; inside = false; paint(); } };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(surface);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) requestPaint(); });
    intersection.observe(surface);
    surface.addEventListener('pointermove', move, { passive: true });
    surface.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('blur', leave);
    motion.addEventListener('change', preference);
    finePointer.addEventListener('change', preference);
    resize();
    return () => {
      cancelAnimationFrame(frame); resizeObserver.disconnect(); intersection.disconnect();
      surface.removeEventListener('pointermove', move); surface.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll); window.removeEventListener('resize', resize); window.removeEventListener('blur', leave);
      motion.removeEventListener('change', preference); finePointer.removeEventListener('change', preference);
    };
  }, []);
  return <div className="live-grid-backdrop" aria-hidden="true"><canvas ref={canvasRef}/></div>;
}
