export interface SongData {
  title: string;
  artist: string;
  bpm: number;
  key: string;
  sections: SongSection[];
}

export interface SongSection {
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro';
  lines: SongLine[];
  strummingPattern?: string;
}

export interface SongLine {
  lyrics: string;
  chords: { chord: string; position: number }[];
  startTime: number; // in beats
  duration: number; // in beats
}

export type Instrument = 'guitar' | 'drums' | 'piano';
