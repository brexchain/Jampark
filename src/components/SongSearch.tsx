import React, { useState, useEffect, useRef } from 'react';
import { Search, Music, Loader2, X, Wand2 } from 'lucide-react';
import { fetchSongData, fetchSongSuggestions } from '../services/gemini';
import { SongData } from '../types';

interface SongSearchProps {
  onSongFound: (song: SongData) => void;
  onMagicPaste?: () => void;
}

export const SongSearch: React.FC<SongSearchProps> = ({ onSongFound, onMagicPaste }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    
    if (query.length >= 3) {
      debounceTimer.current = window.setTimeout(async () => {
        const results = await fetchSongSuggestions(query);
        setSuggestions(Array.isArray(results) ? results : []);
        setShowSuggestions(true);
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = async (songTitle: string) => {
    setLoading(true);
    setShowSuggestions(false);
    setQuery(songTitle);
    try {
      const data = await fetchSongData(songTitle);
      onSongFound(data);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Could not find song details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-[60]">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 3 && setShowSuggestions(true)}
          placeholder="Search song (e.g. Hotel California)..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-600 text-lg"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors" size={20} />
        
        {query && (
          <button 
            onClick={() => { setQuery(''); setSuggestions([]); }}
            className="absolute right-20 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 p-1"
          >
            <X size={18} />
          </button>
        )}

        {onMagicPaste && (
          <button 
            onClick={onMagicPaste}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-400 p-1"
            title="Magic Paste"
          >
            <Wand2 size={18} />
          </button>
        )}

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {loading ? <Loader2 className="animate-spin text-orange-500" size={20} /> : <Music className="text-zinc-700" size={20} />}
        </div>
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSearch(s)}
                className="w-full text-left px-6 py-4 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border-b border-zinc-800 last:border-none flex items-center gap-3"
              >
                <Music size={14} className="text-zinc-600" />
                <span className="font-medium">{s}</span>
              </button>
            ))
          ) : query.length >= 3 && !loading && (
            <div className="px-6 py-4 text-zinc-500 text-xs italic">No suggestions found...</div>
          )}
          
          {onMagicPaste && (
            <button
              onClick={onMagicPaste}
              className="w-full text-left px-6 py-4 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400 transition-colors flex items-center gap-3 border-t border-zinc-800"
            >
              <Wand2 size={14} />
              <span className="font-bold uppercase text-[10px] tracking-widest">Or Magic Paste Raw Text</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
