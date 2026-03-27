import React from 'react';
import { Music, TrendingUp, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';

const TOP_10 = [
  "Hotel California - Eagles",
  "Wonderwall - Oasis",
  "Sweet Home Alabama - Lynyrd Skynyrd",
  "Wish You Were Here - Pink Floyd",
  "Let It Be - The Beatles",
  "Hallelujah - Leonard Cohen",
  "Creep - Radiohead",
  "Blackbird - The Beatles",
  "Knockin' on Heaven's Door - Bob Dylan",
  "Riptide - Vance Joy"
];

interface PopularSongsProps {
  onSelect: (song: string) => void;
  onMagicPaste?: () => void;
}

export const PopularSongs: React.FC<PopularSongsProps> = ({ onSelect, onMagicPaste }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <div className="flex items-center gap-2 mb-6 px-4">
        <TrendingUp className="text-orange-500" size={20} />
        <h3 className="text-xl font-black uppercase italic tracking-tighter">Top 10 Jam Classics</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4">
        {onMagicPaste && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onMagicPaste}
            className="group flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/20 border-dashed rounded-2xl hover:bg-purple-500/20 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Wand2 size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black uppercase italic tracking-tighter text-purple-400">Magic Paste</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-purple-500/60">Convert raw text to karaoke</p>
            </div>
          </motion.button>
        )}
        {TOP_10.map((song, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(song)}
            className="group flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-orange-500 hover:border-orange-400 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-white/20 flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:text-white">
              {i + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold group-hover:text-black transition-colors">{song.split(' - ')[0]}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 group-hover:text-black/60 transition-colors">{song.split(' - ')[1]}</p>
            </div>
            <Music size={16} className="text-zinc-700 group-hover:text-black/40" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};
