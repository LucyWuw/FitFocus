
import { LogEntry } from "../types";

/**
 * Local Natural Language Parser
 * This replaces the need for an external AI API.
 * It uses regex and keyword matching to find calories, protein, and activity types.
 */
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
  // Simulate a small delay for "AI" feel
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const text = input.toLowerCase();
  
  // Basic Regex for numbers followed by units
  const calMatch = text.match(/(\d+)\s*(?:kcal|calories|cal)/);
  const proteinMatch = text.match(/(\d+)\s*(?:g|grams)\s*(?:of\s*)?protein/);
  const carbsMatch = text.match(/(\d+)\s*(?:g|grams)\s*(?:of\s*)?carbs/);
  const fatsMatch = text.match(/(\d+)\s*(?:g|grams)\s*(?:of\s*)?fats/);
  const durationMatch = text.match(/(\d+)\s*(?:min|minutes|hr|hour)/);

  // Determine Type
  const exerciseKeywords = ['run', 'yoga', 'gym', 'workout', 'lift', 'cardio', 'walk', 'exercise', 'cycling', 'swimming'];
  const isExercise = exerciseKeywords.some(kw => text.includes(kw));

  // Default values if not found
  const calories = calMatch ? parseInt(calMatch[1]) : (isExercise ? 200 : 350);
  const protein = proteinMatch ? parseInt(proteinMatch[1]) : (isExercise ? 0 : 20);
  const carbs = carbsMatch ? parseInt(carbsMatch[1]) : (isExercise ? 0 : 40);
  const fats = fatsMatch ? parseInt(fatsMatch[1]) : (isExercise ? 0 : 10);
  const minerals = 70 + Math.floor(Math.random() * 20); // Random nutrient density score
  const duration = durationMatch ? parseInt(durationMatch[1]) : (isExercise ? 30 : 0);

  // Clean up Name
  let name = input.length > 30 ? input.substring(0, 27) + '...' : input;
  
  return {
    name,
    calories,
    protein,
    carbs,
    fats,
    minerals,
    duration: isExercise ? duration : 0,
    type: isExercise ? 'EXERCISE' : 'MEAL'
  };
};

/**
 * Local Rule-based Advice Engine
 */
export const getHealthAdvice = async (summaryData: string): Promise<string> => {
    // In the local version, we parse the summaryData string or just provide generic encouraging tips
    const tips = [
        "Hydration is key! Don't forget your Stanley cup.",
        "Protein helps muscle recovery. Looking strong!",
        "Consistency beats perfection every single time.",
        "You're hopping closer to your goals today!",
        "Leggings on, world off. Let's get moving!",
        "A little progress each day adds up to big results.",
        "You're doing amazing! Coach Kanga is proud."
    ];
    return tips[Math.floor(Math.random() * tips.length)];
};
