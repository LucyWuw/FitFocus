
export type EntryType = 'MEAL' | 'EXERCISE';

export interface LogEntry {
  id: string;
  type: EntryType;
  timestamp: number;
  name: string;
  calories: number;
  protein?: number; 
  carbs?: number;
  fats?: number;
  minerals?: number; // Represented as a percentage of nutrient density 0-100
  duration?: number;
}

export interface UserStats {
  calorieGoal: number;
  proteinGoal: number;
  weight: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
}

export interface DailySummary {
  date: string;
  totalCaloriesIn: number;
  totalCaloriesOut: number;
  totalProtein: number;
  entries: LogEntry[];
}

export enum Type {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  OBJECT = 'OBJECT',
  ARRAY = 'ARRAY',
  BOOLEAN = 'BOOLEAN'
}
