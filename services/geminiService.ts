
import { GoogleGenAI, Type } from "@google/genai";
import { VibeAnalysis } from "../types";

export const analyzeVibe = async (imageBase64: string): Promise<VibeAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Analyze this image as a 'Vibe Sommelier'. 
  Imagine you are a sophisticated expert on aesthetics and music.
  Provide a detailed 'Tasting Note' for the room/view/vibe.
  Create a creative Spotify playlist name that fits the aesthetic.
  Identify the dominant color palette as 5 hex codes.
  Suggest 3 music genres that match this specific scene.
  Identify the general mood and intensity (e.g., 'Mellow', 'Energetic').`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64.split(',')[1] || imageBase64,
          },
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          playlistName: { type: Type.STRING },
          tastingNotes: { type: Type.STRING },
          colorPalette: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          genres: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          mood: { type: Type.STRING },
          intensity: { type: Type.STRING }
        },
        required: ["playlistName", "tastingNotes", "colorPalette", "genres", "mood", "intensity"]
      }
    }
  });

  const result = JSON.parse(response.text || '{}');
  return result as VibeAnalysis;
};
