
import { GoogleGenAI, Type } from "@google/genai";
import { DrinkRecipe } from "../types";

export const generateMoodMenu = async (moodText: string): Promise<DrinkRecipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `SYSTEM_LINK: BTC_CALIBRATION_ACTIVE.
    CLIENT_MOOD_DATA: "${moodText}". 
    
    ACT AS: Jill, a veteran bartender at VA-11 HALL-A in Glitch City. 
    TASK: Generate 3 synthetic drink recommendations.
    
    SPECIFICATIONS:
    - Adelhyde: Sweet, synthetic red syrup.
    - Bronson Ext: Bitter, orange-tinted essence.
    - Pwd Delta: Sour, blue crystal solution.
    - Flanergide: Spicy, green chemical compound.
    - Karmotrine: Pure white alcohol units.
    
    CONSTRAINTS:
    - Each ingredient: 0-10 units.
    - Total units per shaker: max 20.
    - Provide a "tagline" and "flavorProfile".
    - "description" should be atmospheric, like dialogue from the game.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            tagline: { type: Type.STRING },
            description: { type: Type.STRING },
            flavorProfile: { type: Type.STRING },
            ingredients: {
              type: Type.OBJECT,
              properties: {
                'Adelhyde': { type: Type.INTEGER },
                'Bronson Ext': { type: Type.INTEGER },
                'Pwd Delta': { type: Type.INTEGER },
                'Flanergide': { type: Type.INTEGER },
                'Karmotrine': { type: Type.INTEGER }
              },
              required: ['Adelhyde', 'Bronson Ext', 'Pwd Delta', 'Flanergide', 'Karmotrine']
            },
            iced: { type: Type.BOOLEAN },
            aged: { type: Type.BOOLEAN }
          },
          required: ["name", "tagline", "description", "flavorProfile", "ingredients", "iced", "aged"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("BTC_SYSTEM_ERROR: Data corruption during synthesis.");
    throw e;
  }
};
