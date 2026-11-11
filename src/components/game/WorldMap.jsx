import { useMemo } from 'react';
import { QUADRANTS, GEMS, WORLD } from '@/game/worldData';
import { coastOutline, COAST_EXTENT } from '@/game/coast';
import { biomeAt } from '@/game/biomes';
import { biomeMapImage } from './biomeMapImage';

const E = COAST_EXTENT;
const diamond = (x, z, r) => `${x},${z - r} ${x + r},${z} ${x},${z + r} ${x - r},${z}`;

// Click on the map -> world coords -> the biome that dominates there.
function pickBiome(event, onSelect) {
  const svg = event.currentTarget.ownerSVGElement;
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const { x, y } = point.matrixTransform(svg.getScreenCTM().inverse());
  onSelect(biomeAt(x, y).id);
}

// Top-down continent map (north up): the real, organically blended biome layout clipped to the coastline.
export default function WorldMap({ map, selected, onSelect }) {
  const inLair = map.zone === 'lair';
  const px = inLair ? 0 : map.x;
  const pz = inLair ? 0 : map.z;
  // Coastline and biome picture belong to the current world seed
  const ISLAND = useMemo(() => coastOutline(200).map(([x, z]) => `${x.toFixed(1)},${z.toFixed(1)}`).join(' '), [map.seed]);
  const biomes = useMemo(() => biomeMapImage(E), [map.seed]);
  const gate = map.gateway;
  const gateColor = gate.open ? '#5eead4' : '#ff6b35';
  return (
    <svg viewBox={`${-E} ${-E} ${E * 2} ${E * 2}`} className="aspect-square w-full max-h-[460px] rounded-xl border border-white/10">
      <defs>
        <clipPath id="hg-island"><polygon points={ISLAND} /></clipPath>
        <pattern id="hg-waves" width="14" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 5 Q3.5 2 7 5 T14 5" fill="none" stroke="#5eead4" strokeOpacity="0.1" strokeWidth="0.7" />
        </pattern>
      </defs>
      <rect x={-E} y={-E} width={E * 2} height={E * 2} fill="#06101c" />
      <rect x={-E} y={-E} width={E * 2} height={E * 2} fill="url(#hg-waves)" />
      <polygon points={ISLAND} fill="none" stroke="#5eead4" strokeOpacity="0.2" strokeWidth={5} pointerEvents="none" />
      <g clipPath="url(#hg-island)">
        <image
          href={biomes}
          x={-E}
          y={-E}
          width={E * 2}
          height={E * 2}
          preserveAspectRatio="none"
          opacity="0.85"
          className="cursor-pointer"
          onClick={(event) => pickBiome(event, onSelect)}
        />
        <path d={`M ${-E} 0 H ${E} M 0 ${-E} V ${E}`} stroke="#2e2a40" strokeWidth={6} pointerEvents="none" />
      </g>
      <polygon points={ISLAND} fill="none" stroke="#0b0912" strokeWidth={2} pointerEvents="none" />
      {QUADRANTS.map((quad) => {
        const active = selected === quad.id;
        return (
          <g key={`${quad.id}-label`} pointerEvents="none">
            <text x={quad.sx * 34} y={quad.sz * 34 - 5} textAnchor="middle" fontSize="6" fill="#fff" fontWeight="700" opacity={active ? 1 : 0.75}>{quad.name.toUpperCase()}</text>
            <text x={quad.sx * 34} y={quad.sz * 34 + 3} textAnchor="middle" fontSize="4.2" fill="#fff" opacity={active ? 0.85 : 0.55}>Lv {quad.levels[0]}-{quad.levels[1]}</text>
            <circle cx={quad.lair.x} cy={quad.lair.z} r={WORLD.lairRadius * 0.7} fill="none" stroke={GEMS[quad.gem].color} strokeWidth={active ? 1.8 : 1.1} strokeDasharray="3 2" />
            <polygon points={diamond(quad.lair.x, quad.lair.z, 4)} fill={map.gems.includes(quad.gem) ? GEMS[quad.gem].color : 'rgba(0,0,0,0.5)'} stroke={GEMS[quad.gem].color} strokeWidth={1.1} />
          </g>
        );
      })}
      <g pointerEvents="none">
        {gate.found && (
          <>
            <polygon points={diamond(gate.x, gate.z, 5)} fill="#16121f" stroke={gateColor} strokeWidth={1.6} />
            <rect x={gate.x - 1.8} y={gate.z - 1.8} width={3.6} height={3.6} fill={gateColor} opacity="0.85" />
            <text x={gate.x} y={gate.z + 10} textAnchor="middle" fontSize="4.2" fill="#fff" opacity="0.8">HOLLOW GATEWAY {gate.open ? '· OPEN' : '· SEALED'}</text>
          </>
        )}
        <circle cx={WORLD.cottage.x} cy={WORLD.cottage.z} r={3.2} fill="#ffb347" stroke="#2b1d14" strokeWidth={0.8} />
        <text x={WORLD.cottage.x} y={WORLD.cottage.z - 5.5} textAnchor="middle" fontSize="4.2" fill="#ffd27a" opacity="0.9">COTTAGE · GERALD</text>
        <text x={E - 11} y={-E + 14} textAnchor="middle" fontSize="7" fill="#fff" opacity="0.6" fontWeight="700">N</text>
        <path d={`M ${E - 11} ${-E + 17} l -3 7 h 6 z`} fill="#fff" opacity="0.5" />
      </g>
      <g pointerEvents="none" transform={`translate(${px} ${pz}) rotate(${(-map.facing * 180) / Math.PI + 180}) scale(1.4)`}>
        <circle r={4} fill="#ffd166" opacity="0.25">
          <animate attributeName="r" values="3;6;3" dur="1.6s" repeatCount="indefinite" />
        </circle>
        <polygon points="0,-3.2 2.2,2.4 0,1.2 -2.2,2.4" fill="#ffd166" stroke="#000" strokeWidth={0.4} />
      </g>
    </svg>
  );
}