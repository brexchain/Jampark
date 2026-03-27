import React, { useState } from 'react';
import { Wand2, Loader2, X } from 'lucide-react';
import { processRawSong } from '../services/gemini';
import { SongData } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MagicPasteProps {
  onSongFound: (song: SongData) => void;
  onClose: () => void;
}

export const MagicPaste: React.FC<MagicPasteProps> = ({ onSongFound, onClose }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMagic = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const data = await processRawSong(text);
      onSongFound(data);
      onClose();
    } catch (error) {
      console.error("Magic failed:", error);
      alert("Could not process that text. Try a clearer format!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6"
    >
      <div className="w-full max-w-2xl bg-zinc-900 rounded-[40px] p-8 border border-zinc-800 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-800 text-zinc-500 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <Wand2 className="text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Magic Paste</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">AI-Powered Karaoke Converter</p>
          </div>
        </div>

        <p className="text-zinc-400 text-sm mb-6">
          Found a song on Ultimate Guitar or a lyrics site? Paste it here and we'll turn it into a live karaoke session.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste lyrics and chords here...
Example:
[Verse 1]
G           D
Mama take this badge off of me
Em          C
I can't use it anymore"
          className="w-full h-64 bg-black/50 border border-zinc-800 rounded-2xl p-6 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm resize-none mb-6"
        />

        <button
          onClick={handleMagic}
          disabled={loading || !text.trim()}
          className="w-full py-5 bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black uppercase italic rounded-2xl hover:bg-purple-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Casting Spell...</span>
            </>
          ) : (
            <>
              <Wand2 size={20} />
              <span>Do the Magic</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
