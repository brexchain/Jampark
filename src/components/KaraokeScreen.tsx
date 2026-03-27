import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SongData, Instrument } from '../types';
import { cn } from '../lib/utils';
import { transposeChord } from '../lib/music';
import { ChordDiagram } from './ChordDiagrams';

interface KaraokeScreenProps {
  song: SongData;
  currentBeat: number;
  instrument: Instrument;
  isPlaying: boolean;
  transpose: number;
  isParkMode: boolean;
  isSocialMode: boolean;
  showDiagrams: boolean;
}

export const KaraokeScreen: React.FC<KaraokeScreenProps> = ({ 
  song, currentBeat, instrument, isPlaying, transpose, isParkMode, isSocialMode, showDiagrams 
}) => {
  // Find current line based on beat
  const allLines = useMemo(() => {
    return (song?.sections || []).flatMap(s => 
      (s?.lines || []).map(l => ({ 
        ...l, 
        sectionType: s.type,
        strummingPattern: s.strummingPattern 
      }))
    );
  }, [song]);

  const currentLineIndex = allLines.findIndex(
    l => currentBeat >= l.startTime && currentBeat < l.startTime + l.duration
  );

  const currentLine = currentLineIndex !== -1 ? allLines[currentLineIndex] : null;
  const nextLine = currentLineIndex !== -1 && currentLineIndex + 1 < allLines.length 
    ? allLines[currentLineIndex + 1] 
    : null;

  // Calculate ball position
  const progressInLine = currentLine 
    ? (currentBeat - currentLine.startTime) / currentLine.duration 
    : 0;

  const renderLyricsWithChords = (line: typeof allLines[0]) => {
    const chars = line.lyrics?.split('') || [];
    return (
      <div className="relative inline-block py-8">
        {/* Chords Layer */}
        <div className="absolute top-0 left-0 w-full flex">
          {(line.chords || []).map((c, i) => (
            <div 
              key={i} 
              className={cn(
                "absolute text-orange-400 font-bold font-mono transition-all duration-300",
                isParkMode ? "text-3xl md:text-5xl -top-8" : "text-xl md:text-2xl"
              )}
              style={{ left: `${(c.position / (line.lyrics?.length || 1)) * 100}%` }}
            >
              {transpose !== 0 ? transposeChord(c.chord, transpose) : c.chord}
            </div>
          ))}
        </div>

        {/* Lyrics Layer */}
        <div className={cn(
          "font-black tracking-tighter text-zinc-800 whitespace-pre transition-all duration-300",
          isParkMode ? "text-6xl md:text-9xl" : "text-4xl md:text-7xl"
        )}>
          {line.lyrics}
          {/* Highlighted Lyrics */}
          <div 
            className="absolute top-8 left-0 text-white overflow-hidden whitespace-pre transition-all duration-100"
            style={{ 
              width: `${progressInLine * 100}%`,
              top: isParkMode ? '2.5rem' : '2rem'
            }}
          >
            {line.lyrics}
          </div>
        </div>

        {/* Bouncing Ball */}
        {currentLine === line && (
          <motion.div
            animate={{
              left: `${progressInLine * 100}%`,
              y: [0, -20, 0]
            }}
            transition={{
              left: { duration: 0.1, ease: "linear" },
              y: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-6 w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.6)] z-10"
          />
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "flex-1 flex flex-col items-center justify-center p-4 overflow-hidden transition-colors duration-500",
      isParkMode && isPlaying && currentBeat % 4 === 0 ? "bg-zinc-900" : "bg-black"
    )}>
      {/* Social Mode Branding Overlay */}
      {isSocialMode && (
        <div className="fixed top-24 left-0 w-full px-8 flex justify-between items-start pointer-events-none z-50">
          <div className="flex flex-col">
            <span className="text-orange-500 font-black italic tracking-tighter text-2xl">JAMPARK</span>
            <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">Live Session</span>
          </div>
          <div className="text-right">
            <span className="text-white/60 text-sm font-mono uppercase tracking-widest">{song.title}</span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentLine ? (
          <motion.div
            key={currentLineIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "w-full max-w-6xl text-center transition-all duration-300",
              isParkMode ? "scale-110" : "scale-100"
            )}
          >
            <div className={cn(
              "mb-2 text-zinc-500 uppercase tracking-widest font-bold",
              isParkMode ? "text-sm" : "text-xs"
            )}>
              {currentLine.sectionType} {currentLine.strummingPattern && `• ${currentLine.strummingPattern}`}
            </div>
            {renderLyricsWithChords(currentLine)}

            {/* Chord Diagrams Section */}
            {showDiagrams && currentLine && currentLine.chords && currentLine.chords.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex flex-wrap justify-center gap-6 p-4 bg-zinc-900/30 rounded-3xl border border-zinc-800/50 backdrop-blur-sm"
              >
                {Array.from(new Set((currentLine.chords || []).map(c => c.chord))).map((chord, i) => (
                  <ChordDiagram 
                    key={i} 
                    chord={transpose !== 0 ? transposeChord(chord as string, transpose) : (chord as string)} 
                    instrument={instrument === 'drums' ? 'piano' : 'guitar'} 
                  />
                ))}
              </motion.div>
            )}
            
            {nextLine && !isSocialMode && (
              <div className={cn(
                "mt-12 transition-all duration-300",
                isParkMode ? "opacity-20 blur-[2px] scale-90" : "opacity-30 blur-[1px] scale-75"
              )}>
                <div className="text-zinc-500 uppercase text-[10px] tracking-widest mb-1">Next</div>
                <div className={cn(
                  "font-bold text-zinc-400",
                  isParkMode ? "text-4xl md:text-6xl" : "text-2xl md:text-4xl"
                )}>
                  {nextLine.lyrics}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-zinc-700 text-2xl font-light italic">
            {currentBeat === 0 ? "Press play to start jamming..." : "End of song"}
          </div>
        )}
      </AnimatePresence>

      {/* Drum Visualizer Overlay if selected */}
      {instrument === 'drums' && isPlaying && (
        <div className="fixed bottom-32 left-0 w-full h-24 flex items-end justify-center gap-1 px-4 pointer-events-none opacity-20">
          {[...Array(32)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: currentBeat % 4 === 0 ? [20, 80, 20] : [10, 30, 10],
                backgroundColor: currentBeat % 4 === 0 ? '#3b82f6' : '#1e293b'
              }}
              className="w-full max-w-[8px] rounded-t-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};
