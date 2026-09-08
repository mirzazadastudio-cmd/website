'use client';
import { useEffect, type RefObject } from 'react';

type Layer = { element: HTMLElement; kind: 'text' | 'image' | 'backdrop'; top: number; height: number };
const smooth = (value: number) => { const p = Math.max(0, Math.min(1, value)); return p * p * (3 - 2 * p); };

/** Exit motion follows scroll in both directions, without hiding prerendered content. */
export function useHomeScrollMotion(root: RefObject<HTMLElement | null>, content: unknown) {
  useEffect(() => {
    const main = root.current;
    if (!main) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const layers: Layer[] = [];
    const collect = (selector: string, kind: Layer['kind']) => {
      main.querySelectorAll<HTMLElement>(selector).forEach(element => {
        element.dataset.scrollLayer = kind;
        layers.push({ element, kind, top: 0, height: 0 });
      });
    };
    collect('.reel-copy > *, .section-title > *, .studio-copy > *, .service-row > div', 'text');
    collect('.reel-panel, .studio-visual', 'image');
    collect('.live-grid-backdrop canvas', 'backdrop');
    let frame = 0;
    let needsMeasure = true;
    const clear = () => layers.forEach(({ element }) => {
      element.style.removeProperty('--scroll-opacity');
      element.style.removeProperty('--scroll-y');
      element.style.removeProperty('--scroll-blur');
    });
    const draw = () => {
      frame = 0;
      if (preference.matches) { clear(); return; }
      const scroll = window.scrollY;
      const view = window.innerHeight;
      if (needsMeasure) {
        // Remove our transforms before measuring to prevent position drift on resize.
        clear();
        layers.forEach(layer => {
          const box = layer.element.getBoundingClientRect();
          layer.top = box.top + scroll;
          layer.height = box.height;
        });
        needsMeasure = false;
      }
      layers.forEach(({ element, kind, top, height }) => {
        const bottom = top + height - scroll;
        const progress = kind === 'backdrop'
          ? smooth((scroll - top - view * .16) / (view * .68))
          : kind === 'image'
            ? smooth((view * .40 - bottom) / (view * .40))
            : smooth((view * .30 - bottom) / (view * .27));
        const offset = kind === 'backdrop' ? progress * 42 : progress * (kind === 'image' ? -26 : -12);
        element.style.setProperty('--scroll-opacity', (1 - progress).toFixed(3));
        element.style.setProperty('--scroll-y', `${offset.toFixed(2)}px`);
        element.style.setProperty('--scroll-blur', `${(progress * (kind === 'text' ? 0 : 6)).toFixed(2)}px`);
      });
    };
    const requestDraw = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const measure = () => { needsMeasure = true; requestDraw(); };
    const resize = new ResizeObserver(measure);
    resize.observe(main);
    layers.forEach(({ element }) => resize.observe(element));
    window.addEventListener('scroll', requestDraw, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('pageshow', measure);
    preference.addEventListener('change', measure);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', requestDraw);
      window.removeEventListener('resize', measure);
      window.removeEventListener('pageshow', measure);
      preference.removeEventListener('change', measure);
      clear();
      layers.forEach(({ element }) => { delete element.dataset.scrollLayer; });
    };
  }, [root, content]);
}
