'use client';
import {fieldText,t} from '@/lib/i18n';
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowUpRight, ArrowDownRight, MoveHorizontal, Pause, Play } from 'lucide-react';
import { RenderImage } from '@/components/render-image';
import { useSiteContent } from '@/components/content-provider';

// Cover scales a landscape render by the tall card's height. Advertise that
// full drawn width to srcset, rather than the narrow visible crop alone.
function reelImageSizes(ratio:number) {
  const frame=(width:string,height:string)=>`max(${width}, calc(${height} * ${ratio.toFixed(5)}))`;
  return [
    `(max-width: 700px) ${frame('clamp(260px, 76vw, 340px)','calc(clamp(260px, 76vw, 340px) * 1.25 - 88px)')}`,
    `(max-width: 1050px) ${frame('320px','308px')}`,
    frame('clamp(340px, 30vw, 520px)','calc(clamp(340px, 30vw, 520px) * 1.25 - 92px)'),
  ].join(', ');
}

export function ProjectReel() {
  const { settings: siteConfig, projects, media, crops } = useSiteContent();
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [repeats, setRepeats] = useState(1);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const position = useRef(0);
  const groupWidth = useRef(0);
  const blocked = useRef({ paused: false, focus: false, reduced: false });
  const pointer = useRef<{ id: number; startX: number; startY: number; lastX: number; lastTime: number; dragged: boolean; vertical: boolean } | null>(null);
  const suppressClick = useRef(false);
  const velocity = useRef(0);
  const selected = siteConfig.homepage.projectOrder.flatMap(slug => {
    const project = projects.find(p => p.slug === slug);
    return project ? [project] : [];
  });
  const items = selected.length ? selected : projects;
  const itemsKey = items.map(item => item.slug).join('|');
  const duration = Math.max(20, siteConfig.homepage.cycleSeconds);

  const moveTo = (next: number) => {
    const width = groupWidth.current;
    if (!width || !track.current) return;
    // Equivalent copies allow wrapping in either direction without an empty edge.
    position.current = ((next % width) + width) % width;
    track.current.style.transform = `translate3d(${-position.current}px, 0, 0)`;
  };

  useLayoutEffect(() => {
    const frame = viewport.current;
    const sequence = group.current;
    if (!frame || !sequence) return;
    const measure = () => {
      const width = sequence.getBoundingClientRect().width;
      const baseWidth = width / repeats;
      if (!baseWidth) return;
      // Even a single selected project must cover a wide viewport at every offset.
      const needed = Math.max(1, Math.ceil(frame.clientWidth / baseWidth));
      if (needed !== repeats) { setRepeats(needed); return; }
      const progress = groupWidth.current ? position.current / groupWidth.current : 0;
      groupWidth.current = width;
      moveTo(progress * width);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(sequence);
    return () => observer.disconnect();
  }, [itemsKey, repeats]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { blocked.current.reduced = preference.matches; if(preference.matches)velocity.current=0; };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => { blocked.current.paused = paused; }, [paused]);

  useEffect(() => {
    let frame = 0;
    let previous = 0;
    const animate = (now: number) => {
      const elapsed = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      const state = blocked.current;
      if (!document.hidden && !state.reduced && !pointer.current && Math.abs(velocity.current) > .015) {
        moveTo(position.current + velocity.current * elapsed);
        velocity.current *= Math.exp(-elapsed / 310);
      } else if (!document.hidden && !state.paused && !state.focus && !state.reduced && !pointer.current && items.length > 1) {
        moveTo(position.current + elapsed * groupWidth.current / repeats / (duration * 1000));
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [duration, items.length, repeats]);

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    velocity.current = 0;
    pointer.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastTime: event.timeStamp, dragged: false, vertical: false };
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = pointer.current;
    if (!gesture || gesture.id !== event.pointerId || gesture.vertical) return;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (!gesture.dragged) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 7) return;
      if (event.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) { gesture.vertical = true; return; }
      gesture.dragged = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    event.preventDefault();
    const distance=(gesture.lastX-event.clientX)*1.15;
    const elapsed=Math.max(8,event.timeStamp-gesture.lastTime);
    velocity.current=Math.max(-4,Math.min(4,velocity.current*.25+(distance/elapsed)*.75));
    moveTo(position.current+distance);
    gesture.lastX = event.clientX;
    gesture.lastTime = event.timeStamp;
  };
  const pointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (pointer.current?.id !== event.pointerId) return;
    if(event.type==='pointercancel'||!pointer.current.dragged||event.timeStamp-pointer.current.lastTime>100)velocity.current=0;
    pointer.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return <section className="reel-hero" aria-label={t("Studio introduction and featured projects")}>
    <div className="reel-copy">
      <p className="eyebrow"><i/> {t("ARCHITECTURE & VISUALIZATION")}</p>
      <h1>{fieldText(siteConfig.tagline[0],'settings:tagline:0')}<br/><span>{fieldText(siteConfig.tagline[1],'settings:tagline:1')}</span></h1>
      <div className="reel-description"><p>{fieldText(siteConfig.introduction,'settings:introduction')}</p><a href="#projects" className="text-link">{t("Explore our work")} <ArrowDownRight size={23}/></a></div>
      <p className="reel-footnote">{t("SPACES. STORIES. NEW PERSPECTIVES.")}</p>
    </div>
    <div className="reel-panel">
      <div ref={viewport} className="reel-viewport" data-dragging={dragging}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onLostPointerCapture={pointerEnd}
        onPointerLeave={event => { if (!pointer.current?.dragged) pointerEnd(event); }}
        onDragStart={event => event.preventDefault()}
        onClickCapture={event => { if (suppressClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); } }}
        onFocusCapture={event => {
          if (!event.target.matches(':focus-visible')) return;
          blocked.current.focus = true;
          const card = event.target.closest<HTMLAnchorElement>('.reel-card');
          if (card && group.current) { event.currentTarget.scrollLeft = 0; moveTo(card.offsetLeft - group.current.offsetLeft); }
        }}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) blocked.current.focus = false; }}>
        <div ref={track} className="reel-track">
          {[0, 1].map(copy => <div ref={copy === 0 ? group : undefined} className={`reel-group ${copy ? 'reel-duplicate' : ''}`} key={copy} aria-hidden={copy ? true : undefined}>
            {Array.from({ length: repeats }, (_, repeat) => items.map((project, index) => {
              const src=project.heroImage||project.images[0];
              const image=media?.[src],crop=crops[src];
              const ratio=(crop?.width||image?.width||16)/((crop?.height||image?.height||9)*(1-(crop?.bottom||0)));
              return <a key={`${repeat}-${project.slug}`} className="reel-card" data-protected-media href={`/projects/${project.slug}`} draggable={false} tabIndex={copy || repeat ? -1 : 0} aria-hidden={repeat ? true : undefined} aria-label={t(`View ${project.title}`)}>
              <RenderImage sizes={reelImageSizes(ratio)} src={src} alt={t(copy || repeat ? '' : project.title)} loading={copy || repeat || index > 3 ? 'lazy' : 'eager'} fetchPriority={!copy && !repeat && index === 0 ? 'high' : 'auto'} style={{ objectPosition: project.heroPosition || '50% 50%' }}/>
              <span className="reel-card-index">{String(index + 1).padStart(2, '0')} / {t(project.category)}</span>
              <div className="reel-card-caption"><div><p>{t(project.category.toUpperCase())}</p><h2>{fieldText(project.title,'project:'+(project.id||'project-'+project.slug)+':title')}</h2></div><ArrowUpRight size={23}/></div>
            </a>}))}
          </div>)}
        </div>
      </div>
      <div className="reel-toolbar"><span>{t("SELECTED WORK /")} {String(items.length).padStart(2, '0')}</span><span className="reel-drag-hint"><MoveHorizontal size={16}/> {t("Drag to explore")}</span><button className="reel-motion-button" type="button" onClick={() => { velocity.current=0; setPaused(!paused); }} aria-label={t(paused ? 'Play project animation' : 'Pause project animation')} aria-pressed={paused}>{paused ? <Play size={14}/> : <Pause size={14}/>}<span>{t(paused ? 'Play motion' : 'Pause motion')}</span></button></div>
    </div>
  </section>;
}
