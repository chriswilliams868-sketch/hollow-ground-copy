import { useEffect, useRef } from 'react';
import { Rotate3d } from 'lucide-react';
import { getInspector } from '@/game/inspect/inspector';

// Hosts the shared inspector canvas while mounted (the game world stops redrawing meanwhile) and shows `subject` on it.
export default function InspectorViewport({ subject, color }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const inspector = getInspector();
    inspector.mount(host);
    return () => inspector.unmount(host);
  }, []);

  useEffect(() => {
    getInspector().show(subject);
  }, [subject]);

  return (
    <div
      className="relative min-h-0 overflow-hidden rounded-xl border border-white/10"
      style={{ background: `radial-gradient(circle at 50% 55%, ${color}30, transparent 68%), #0a0812` }}
    >
      <div ref={hostRef} className="absolute inset-0" />
      <p className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5 font-display text-[9px] uppercase tracking-[0.22em] text-white/40">
        <Rotate3d className="h-3 w-3" />
        Drag to rotate · Pinch or scroll to zoom
      </p>
    </div>
  );
}