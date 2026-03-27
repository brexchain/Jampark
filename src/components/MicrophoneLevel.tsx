import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion } from 'motion/react';

export const MicrophoneLevel: React.FC = () => {
  const [level, setLevel] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const animationFrame = useRef<number | null>(null);

  const startMic = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.current.createMediaStreamSource(stream.current);
      analyser.current = audioCtx.current.createAnalyser();
      analyser.current.fftSize = 256;
      source.connect(analyser.current);
      setIsActive(true);
      updateLevel();
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  };

  const stopMic = () => {
    if (stream.current) {
      stream.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    setIsActive(false);
    setLevel(0);
  };

  const updateLevel = () => {
    if (!analyser.current) return;
    const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
    analyser.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setLevel(average / 128); // Normalize to 0-1
    animationFrame.current = requestAnimationFrame(updateLevel);
  };

  useEffect(() => {
    return () => stopMic();
  }, []);

  return (
    <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 backdrop-blur-md">
      <button 
        onClick={isActive ? stopMic : startMic}
        className={isActive ? "text-orange-500" : "text-zinc-600"}
      >
        {isActive ? <Mic size={16} /> : <MicOff size={16} />}
      </button>
      <div className="flex gap-1 h-3 items-end">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              height: isActive ? `${Math.max(4, level * 100 * (1 - i * 0.15))}%` : '4px',
              backgroundColor: isActive ? (level > 0.6 ? '#ef4444' : '#f97316') : '#27272a'
            }}
            className="w-1 rounded-full"
          />
        ))}
      </div>
      <span className="text-[8px] uppercase tracking-widest font-bold text-zinc-500">
        {isActive ? "Jam Listening" : "Mic Off"}
      </span>
    </div>
  );
};
