const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function transposeChord(chord: string, semitones: number): string {
  return chord.replace(/[A-G][#b]?/, (match) => {
    let note = match;
    // Normalize flats to sharps
    if (note.endsWith('b')) {
      const flatMap: { [key: string]: string } = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
      note = flatMap[note] || note;
    }
    
    const index = notes.indexOf(note);
    if (index === -1) return match;
    
    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;
    
    return notes[newIndex];
  });
}
