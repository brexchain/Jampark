import React from 'react';
import { motion } from 'motion/react';

interface ChordDiagramProps {
  chord: string;
  instrument: 'guitar' | 'piano';
}

// Simple chord definitions for visualization
const CHORD_DATA: Record<string, { guitar: number[], piano: number[] }> = {
  'C': { guitar: [-1, 3, 2, 0, 1, 0], piano: [0, 4, 7] },
  'G': { guitar: [3, 2, 0, 0, 0, 3], piano: [7, 11, 2] },
  'D': { guitar: [-1, -1, 0, 2, 3, 2], piano: [2, 6, 9] },
  'A': { guitar: [-1, 0, 2, 2, 2, 0], piano: [9, 1, 4] },
  'E': { guitar: [0, 2, 2, 1, 0, 0], piano: [4, 8, 11] },
  'Am': { guitar: [-1, 0, 2, 2, 1, 0], piano: [9, 0, 4] },
  'Em': { guitar: [0, 2, 2, 0, 0, 0], piano: [4, 7, 11] },
  'Dm': { guitar: [-1, -1, 0, 2, 3, 1], piano: [2, 5, 9] },
  'F': { guitar: [1, 3, 3, 2, 1, 1], piano: [5, 9, 0] },
  'Bm': { guitar: [-1, 2, 4, 4, 3, 2], piano: [11, 2, 6] },
  'C7': { guitar: [-1, 3, 2, 3, 1, 0], piano: [0, 4, 7, 10] },
  'G7': { guitar: [3, 2, 0, 0, 0, 1], piano: [7, 11, 2, 5] },
  'D7': { guitar: [-1, -1, 0, 2, 1, 2], piano: [2, 6, 9, 0] },
  'A7': { guitar: [-1, 0, 2, 0, 2, 0], piano: [9, 1, 4, 7] },
  'E7': { guitar: [0, 2, 0, 1, 0, 0], piano: [4, 8, 11, 2] },
};

export const ChordDiagram: React.FC<ChordDiagramProps> = ({ chord, instrument }) => {
  // Normalize chord name (remove variations for simple lookup)
  const baseChord = chord.split('/')[0].trim();
  const data = CHORD_DATA[baseChord] || CHORD_DATA['C']; // Fallback to C

  if (instrument === 'guitar') {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold text-orange-500">{chord}</span>
        <svg width="40" height="50" viewBox="0 0 40 50">
          {/* Fretboard */}
          <rect x="5" y="5" width="30" height="40" fill="none" stroke="#333" strokeWidth="1" />
          {[1, 2, 3, 4].map(i => (
            <line key={i} x1="5" y1={5 + i * 10} x2="35" y2={5 + i * 10} stroke="#333" strokeWidth="1" />
          ))}
          {[1, 2, 3, 4, 5].map(i => (
            <line key={i} x1={5 + i * 6} y1="5" x2={5 + i * 6} y2="45" stroke="#333" strokeWidth="0.5" />
          ))}
          
          {/* Fingers */}
          {data.guitar.map((fret, stringIndex) => {
            if (fret === -1) {
              return <text key={stringIndex} x={5 + stringIndex * 6} y="4" fontSize="4" textAnchor="middle" fill="#666">×</text>;
            }
            if (fret === 0) {
              return <circle key={stringIndex} cx={5 + stringIndex * 6} cy="2" r="1.5" fill="none" stroke="#666" strokeWidth="0.5" />;
            }
            return (
              <circle 
                key={stringIndex} 
                cx={5 + stringIndex * 6} 
                cy={5 + (fret - 0.5) * 10} 
                r="2.5" 
                fill="#f97316" 
              />
            );
          })}
        </svg>
      </div>
    );
  }

  // Piano Visualization
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold text-orange-500">{chord}</span>
      <div className="flex h-8 bg-zinc-800 rounded-sm overflow-hidden border border-zinc-700">
        {[...Array(12)].map((_, i) => {
          const isBlack = [1, 3, 6, 8, 10].includes(i);
          const isActive = data.piano.includes(i);
          return (
            <div 
              key={i} 
              className={`w-2 h-full border-r border-zinc-900 last:border-none ${
                isBlack ? 'bg-black h-2/3 z-10' : 'bg-zinc-200'
              } ${isActive ? 'bg-orange-500' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
};
