import React, { useState, useEffect, useRef } from 'react';
import { Metronome } from './components/Metronome';
import { KaraokeScreen } from './components/KaraokeScreen';
import { SongSearch } from './components/SongSearch';
import { PopularSongs } from './components/PopularSongs';
import { MicrophoneLevel } from './components/MicrophoneLevel';
import { MagicPaste } from './components/MagicPaste';
import { MagicPasteBox } from './components/MagicPasteBox';
import { SongData, Instrument } from './types';
import { Guitar, Drum, Music2, Share2, Settings2, Users, Search, Wand2, Instagram, Youtube, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { io, Socket } from 'socket.io-client';
import { nanoid } from 'nanoid';
import { fetchSongData } from './services/gemini';

export default function App() {
  const [song, setSong] = useState<SongData | null>(null);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [instrument, setInstrument] = useState<Instrument>('guitar');
  const [showSettings, setShowSettings] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [isParkMode, setIsParkMode] = useState(true); // Default to Park Mode for visibility
  const [isSocialMode, setIsSocialMode] = useState(false);
  const [showDiagrams, setShowDiagrams] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showMagicPaste, setShowMagicPaste] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    const urlParams = new URLSearchParams(window.location.search);
    const existingRoom = urlParams.get('jam');

    if (existingRoom) {
      setRoomId(existingRoom);
      socket.emit('join-room', existingRoom);
      setIsHost(false);
    } else {
      const newRoom = nanoid(6);
      setRoomId(newRoom);
      setIsHost(true);
      // Update URL without reload
      const newUrl = `${window.location.pathname}?jam=${newRoom}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      socket.emit('join-room', newRoom);
    }

    socket.on('state-updated', (state: any) => {
      if (state.song) setSong(state.song);
      if (typeof state.isPlaying === 'boolean') setIsPlaying(state.isPlaying);
      if (typeof state.currentBeat === 'number') setCurrentBeat(state.currentBeat);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync state when host changes something
  useEffect(() => {
    if (isHost && socketRef.current && roomId) {
      socketRef.current.emit('sync-state', {
        roomId,
        state: { song, isPlaying, currentBeat }
      });
    }
  }, [song, isPlaying, currentBeat, isHost, roomId]);

  const handleBeat = (beat: number) => {
    setCurrentBeat(beat);
  };

  const handleSongFound = (newSong: SongData) => {
    setSong(newSong);
    setCurrentBeat(0);
    setIsPlaying(false);
    setShowSearch(false);
  };

  const handlePopularSelect = async (songTitle: string) => {
    try {
      const data = await fetchSongData(songTitle);
      handleSongFound(data);
    } catch (error) {
      console.error("Failed to load popular song:", error);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Join my JamPark session!',
        text: `Play along with me on ${song?.title || 'this song'}!`,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert("Jam Link Copied! Send this to your friends to sync up.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-zinc-900 bg-black/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <Music2 className="text-black" size={18} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-lg tracking-tighter uppercase italic">JamPark</h1>
            <div className="flex items-center gap-1">
              {roomId && (
                <span className="flex items-center gap-1 text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded-full text-zinc-400 font-mono">
                  <Users size={8} /> {roomId}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-4">
          <SongSearch 
            onSongFound={handleSongFound} 
            onMagicPaste={() => setShowMagicPaste(true)}
          />
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowMagicPaste(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-zinc-900 text-purple-400 transition-colors group"
            title="Magic Paste"
          >
            <Wand2 size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Paste</span>
          </button>
          <div className="hidden md:block mr-2">
            <MicrophoneLevel />
          </div>
          <button 
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 transition-colors"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 transition-colors"
          >
            <Settings2 size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {!song ? (
          <div className="flex-1 flex flex-col items-center justify-start py-12 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 mb-12"
            >
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                {isHost ? "Ready to " : "Waiting for "}
                <span className="text-orange-500">{isHost ? "Jam?" : "Host..."}</span>
              </h2>
              <p className="text-zinc-500 text-lg max-w-md mx-auto px-6">
                {isHost 
                  ? "Pick a classic, search for any song, or use Magic Paste to start your session."
                  : "Your screen will automatically sync when the host picks a song."}
              </p>
              {isHost && (
                <div className="flex flex-col items-center gap-6 w-full max-w-2xl px-4">
                  <MagicPasteBox onSongFound={handleSongFound} />
                </div>
              )}
            </motion.div>
            
            {isHost && (
              <PopularSongs 
                onSelect={handlePopularSelect} 
                onMagicPaste={() => setShowMagicPaste(true)}
              />
            )}
            
            <div className="flex gap-4 mt-12 mb-8">
              <div className="flex flex-col items-center gap-2 opacity-40">
                <div className="w-12 h-12 rounded-full border border-dashed border-zinc-700 flex items-center justify-center">
                  <Guitar size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest">Guitar</span>
              </div>
              <div className="flex flex-col items-center gap-2 opacity-40">
                <div className="w-12 h-12 rounded-full border border-dashed border-zinc-700 flex items-center justify-center">
                  <Drum size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest">Drums</span>
              </div>
            </div>
          </div>
        ) : (
          <KaraokeScreen 
            song={song} 
            currentBeat={currentBeat} 
            instrument={instrument} 
            isPlaying={isPlaying}
            transpose={transpose}
            isParkMode={isParkMode}
            isSocialMode={isSocialMode}
            showDiagrams={showDiagrams}
          />
        )}

        {/* Magic Paste Modal */}
        <AnimatePresence>
          {showMagicPaste && (
            <MagicPaste 
              onSongFound={handleSongFound} 
              onClose={() => setShowMagicPaste(false)} 
            />
          )}
        </AnimatePresence>

        {/* Controls Overlay */}
        <AnimatePresence>
          {song && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="absolute bottom-0 left-0 w-full p-6 flex flex-col items-center gap-6 bg-gradient-to-t from-black via-black/90 to-transparent pt-20"
            >
              <div className="flex items-center gap-4 bg-zinc-900/80 p-1 rounded-2xl border border-zinc-800 backdrop-blur-md">
                <button
                  onClick={() => setInstrument('guitar')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                    instrument === 'guitar' ? "bg-orange-500 text-black font-bold" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <Guitar size={18} />
                  <span className="text-xs uppercase tracking-widest">Guitar</span>
                </button>
                <button
                  onClick={() => setInstrument('drums')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                    instrument === 'drums' ? "bg-orange-500 text-black font-bold" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <Drum size={18} />
                  <span className="text-xs uppercase tracking-widest">Drums</span>
                </button>
              </div>

              <Metronome 
                bpm={song.bpm} 
                onBeat={handleBeat} 
                isPlaying={isPlaying}
                setIsPlaying={(playing) => {
                  if (isHost) setIsPlaying(playing);
                }}
                instrument={instrument}
              />

              <div className="flex flex-col items-center">
                <h3 className="text-xl font-black uppercase tracking-tighter italic">{song.title}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{song.artist} • {song.key}</p>
                  <div className="flex items-center bg-zinc-900 rounded-lg px-2 py-1 gap-2 border border-zinc-800">
                    <button onClick={() => setTranspose(t => t - 1)} className="text-xs text-zinc-400 hover:text-white">-</button>
                    <span className="text-[10px] font-mono text-orange-500">{transpose > 0 ? `+${transpose}` : transpose}</span>
                    <button onClick={() => setTranspose(t => t + 1)} className="text-xs text-zinc-400 hover:text-white">+</button>
                  </div>
                </div>
                {isHost && (
                  <button 
                    onClick={() => setSong(null)}
                    className="mt-2 text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-widest font-bold underline underline-offset-4"
                  >
                    Change Song
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Settings Modal Placeholder */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="w-full max-w-sm bg-zinc-900 rounded-[40px] p-8 border border-zinc-800 shadow-2xl">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-6">Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 uppercase text-xs font-bold tracking-widest">Park Mode (Big Text)</span>
                  <button 
                    onClick={() => setIsParkMode(!isParkMode)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      isParkMode ? "bg-orange-500" : "bg-zinc-700"
                    )}
                  >
                    <motion.div 
                      animate={{ x: isParkMode ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full" 
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 uppercase text-xs font-bold tracking-widest">Social Mode (Branding)</span>
                  <button 
                    onClick={() => setIsSocialMode(!isSocialMode)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      isSocialMode ? "bg-orange-500" : "bg-zinc-700"
                    )}
                  >
                    <motion.div 
                      animate={{ x: isSocialMode ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full" 
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 uppercase text-xs font-bold tracking-widest">Show Chord Diagrams</span>
                  <button 
                    onClick={() => setShowDiagrams(!showDiagrams)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      showDiagrams ? "bg-orange-500" : "bg-zinc-700"
                    )}
                  >
                    <motion.div 
                      animate={{ x: showDiagrams ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full" 
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 uppercase text-xs font-bold tracking-widest">Visual Metronome</span>
                  <div className="w-12 h-6 bg-orange-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 uppercase text-xs font-bold tracking-widest">Show Chords</span>
                  <div className="w-12 h-6 bg-orange-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
                <div className="pt-4 space-y-4">
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-[0.2em] mb-2">Marketing Tip</p>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Recording a jam? Tag <span className="text-orange-500">#JamPark</span> for a chance to be featured! 🎸
                    </p>
                    <div className="flex gap-3 mt-3 text-zinc-500">
                      <Instagram size={14} />
                      <Youtube size={14} />
                      <Twitter size={14} />
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="w-full py-4 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-zinc-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
