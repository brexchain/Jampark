import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Instrument } from '../types';

interface MetronomeProps {
  bpm: number;
  onBeat: (beat: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  instrument: Instrument;
}

export const Metronome: React.FC<MetronomeProps> = ({ bpm, onBeat, isPlaying, setIsPlaying, instrument }) => {
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isMuted, setIsMuted] = useState(true); // Default to silent for park use
  const audioCtx = useRef<AudioContext | null>(null);
  const nextNoteTime = useRef(0);
  const timerID = useRef<number | null>(null);
  const beatCount = useRef(0);

  const scheduleNote = (beatNumber: number, time: number) => {
    if (isMuted || !audioCtx.current) return;

    const osc = audioCtx.current.createOscillator();
    const envelope = audioCtx.current.createGain();

    osc.frequency.value = beatNumber % 4 === 0 ? 880 : 440;
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(envelope);
    envelope.connect(audioCtx.current.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  };

  const playDrum = (beatNumber: number, time: number) => {
    if (isMuted || !audioCtx.current) return;

    // Kick on 1 and 3
    if (beatNumber % 2 === 0) {
      const kick = audioCtx.current.createOscillator();
      const kickGain = audioCtx.current.createGain();
      kick.frequency.setValueAtTime(150, time);
      kick.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
      kickGain.gain.setValueAtTime(1, time);
      kickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      kick.connect(kickGain);
      kickGain.connect(audioCtx.current.destination);
      kick.start(time);
      kick.stop(time + 0.1);
    }

    // Snare on 2 and 4
    if (beatNumber % 2 === 1) {
      const snareNoise = audioCtx.current.createBufferSource();
      const bufferSize = audioCtx.current.sampleRate * 0.1;
      const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      snareNoise.buffer = buffer;
      const snareGain = audioCtx.current.createGain();
      snareGain.gain.setValueAtTime(0.5, time);
      snareGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      snareNoise.connect(snareGain);
      snareGain.connect(audioCtx.current.destination);
      snareNoise.start(time);
      snareNoise.stop(time + 0.1);
    }
  };

  const scheduler = () => {
    if (!audioCtx.current) return;
    while (nextNoteTime.current < audioCtx.current.currentTime + 0.1) {
      if (instrument === 'drums') {
        playDrum(beatCount.current, nextNoteTime.current);
      } else {
        scheduleNote(beatCount.current, nextNoteTime.current);
      }
      onBeat(beatCount.current);
      setCurrentBeat(beatCount.current % 4);
      
      const secondsPerBeat = 60.0 / bpm;
      nextNoteTime.current += secondsPerBeat;
      beatCount.current++;
    }
    timerID.current = window.setTimeout(scheduler, 25);
  };

  useEffect(() => {
    if (isPlaying) {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      nextNoteTime.current = audioCtx.current.currentTime;
      beatCount.current = 0;
      scheduler();
    } else {
      if (timerID.current) clearTimeout(timerID.current);
      setCurrentBeat(0);
    }
    return () => {
      if (timerID.current) clearTimeout(timerID.current);
    };
  }, [isPlaying, bpm]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800 backdrop-blur-xl">
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: isPlaying && currentBeat === i ? 1.2 : 1,
              backgroundColor: isPlaying && currentBeat === i 
                ? (i === 0 ? '#ef4444' : '#22c55e') 
                : '#27272a'
            }}
            className="w-4 h-4 rounded-full"
          />
        ))}
      </div>
      
      <div className="flex items-center gap-6">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 rounded-full hover:bg-zinc-800 transition-colors"
        >
          {isMuted ? <VolumeX className="text-zinc-500" /> : <Volume2 className="text-zinc-400" />}
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg",
            isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          )}
        >
          {isPlaying ? <Pause fill="white" /> : <Play fill="white" className="ml-1" />}
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            setTimeout(() => {
              beatCount.current = 0;
              setCurrentBeat(0);
            }, 50);
          }}
          className="p-3 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <RotateCcw className="text-zinc-400" />
        </button>
      </div>

      <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
        {bpm} BPM
      </div>
    </div>
  );
};
