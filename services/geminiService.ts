import { GoogleGenAI } from "@google/genai";
import { GameState } from "../types";

// Note: In a real production app, never expose API keys on the client.
// This is for the specific demo requirement where we assume process.env.API_KEY is available/injected.
const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.warn("Gemini API Key not found or invalid.");
}

export const generateSystemLog = async (gameState: GameState): Promise<string> => {
  if (!ai) return "SYSTEM: AI Module Offline. (Missing API Key)";

  try {
    const model = "gemini-2.5-flash";
    
    const resourceSummary = Object.entries(gameState.resources)
      .map(([k, v]) => `${k}: ${Math.floor(v)}`)
      .join(', ');

    const prompt = `
      You are the AI operating system of a cyberpunk city grid called "The Sprawl".
      The user is a Netrunner managing resources.
      Current status: ${resourceSummary}.
      
      Generate a short, cryptic, 1-sentence system log message about the current state of the grid.
      Use technical jargon (packets, voltage, syntax, daemon, protocol).
      Do not include greetings. Be atmospheric.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini generation failed", error);
    return "SYSTEM: Connection intercepted. Retrying...";
  }
};
