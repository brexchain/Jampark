import { GoogleGenAI, Type } from "@google/genai";
import { SongData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function fetchSongData(query: string): Promise<SongData> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find or provide the lyrics and chords for the song: "${query}". 
    Format it as a structured JSON object for a karaoke app. 
    Include BPM, Key, and sections with lyrics and chord positions.
    Also include a "strummingPattern" string (e.g., "D-D-U-U-D-U") for each section if applicable.
    Positions should be character indices in the lyrics string where the chord change happens.
    Estimate the startTime and duration in BEATS (not seconds) for each line based on the BPM.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          bpm: { type: Type.NUMBER },
          key: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                lines: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      lyrics: { type: Type.STRING },
                      chords: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            chord: { type: Type.STRING },
                            position: { type: Type.NUMBER }
                          }
                        }
                      },
                      startTime: { type: Type.NUMBER },
                      duration: { type: Type.NUMBER }
                    }
                  }
                }
              }
            }
          }
        },
        required: ["title", "artist", "bpm", "sections"]
      }
    }
  });

  try {
    return JSON.parse(response.text) as SongData;
  } catch (e) {
    throw new Error("Failed to parse song data");
  }
}

export async function fetchSongSuggestions(query: string): Promise<string[]> {
  if (query.length < 3) return [];
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide a list of 5 popular song titles that start with or match: "${query}". Return only a JSON array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function processRawSong(rawText: string): Promise<SongData> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert the following raw song text (lyrics and chords) into a structured JSON object for a karaoke app. 
    Include BPM, Key, and sections with lyrics and chord positions.
    Estimate the startTime and duration in BEATS for each line based on a standard 4/4 time signature.
    
    Raw Text:
    "${rawText}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          bpm: { type: Type.NUMBER },
          key: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                lines: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      lyrics: { type: Type.STRING },
                      chords: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            chord: { type: Type.STRING },
                            position: { type: Type.NUMBER }
                          }
                        }
                      },
                      startTime: { type: Type.NUMBER },
                      duration: { type: Type.NUMBER }
                    }
                  }
                }
              }
            }
          }
        },
        required: ["title", "artist", "bpm", "sections"]
      }
    }
  });

  try {
    return JSON.parse(response.text) as SongData;
  } catch (e) {
    throw new Error("Failed to process raw song text");
  }
}
