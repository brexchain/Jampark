import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { processRawSong } from '../services/gemini';
import { SongData } from '../types';

interface MagicPasteBoxProps {
  onSongFound: (song: SongData) => void;
}

export const MagicPasteBox: React.FC<MagicPasteBoxProps> = ({ onSongFound }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMagic = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const data = await processRawSong(text);
      onSongFound(data);
    } catch (error) {
      console.error("Magic failed:", error);
      alert("Could not process that text. Try a clearer format!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          <Wand2 className="text-black" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase italic tracking-tighter">Magic Paste</h3>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">AI Karaoke Converter</p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste lyrics and chords from Ultimate Guitar or any site here..."
        className="w-full h-40 bg-black/30 border border-zinc-800 rounded-2xl p-4 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm resize-none mb-4"
      />

      <button
        onClick={handleMagic}
        disabled={loading || !text.trim()}
        className="w-full py-4 bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black uppercase italic rounded-xl hover:bg-purple-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.1)] active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Wand2 size={18} />
            <span>Convert to Karaoke</span>
          </>
        )}
      </button>
      
      <p className="mt-3 text-[10px] text-zinc-600 text-center uppercase tracking-widest font-bold">
        Supports Ultimate Guitar, Genius, AZLyrics, and more
      </p>
    </div>
  );
};
