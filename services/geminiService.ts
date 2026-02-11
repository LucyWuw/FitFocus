
import { GoogleGenAI, Type } from "@google/genai";

// Always use named parameter and process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeHealthInput = async (input: string): Promise<{
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  minerals?: number;
  duration?: number;
  type: 'MEAL' | 'EXERCISE';
} | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following health/food log: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Short descriptive name' },
            calories: { type: Type.NUMBER, description: 'Calories (positive number)' },
            protein: { type: Type.NUMBER, description: 'Protein in grams' },
            carbs: { type: Type.NUMBER, description: 'Carbohydrates in grams' },
            fats: { type: Type.NUMBER, description: 'Fats in grams' },
            minerals: { type: Type.NUMBER, description: 'Nutrient density score 0-100 based on micro-nutrients/minerals' },
            duration: { type: Type.NUMBER, description: 'Duration in minutes (if exercise)' },
            type: { type: Type.STRING, description: 'Type: MEAL or EXERCISE' }
          },
          required: ['name', 'calories', 'type']
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};

export const getHealthAdvice = async (summary: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: summary,
      config: {
        systemInstruction: "You are Coach Kanga, a cute winged kangaroo fitness coach in purple leggings. Analyze user nutrition and give brief advice (under 15 words) or a joke if they are doing great."
      }
    });
    return response.text || "Keep it up, you're doing great!";
  } catch (error) {
    return "Let's keep hopping toward those goals!";
  }
};
