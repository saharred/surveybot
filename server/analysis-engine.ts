import { Question, Response } from "../drizzle/schema";

export interface QuestionStatistics {
  questionId: number;
  questionText: string;
  questionType: string;
  totalResponses: number;
  statistics: {
    percentages?: Record<string, number>;
    average?: number;
    standardDeviation?: number;
    frequencies?: Record<string, number>;
    mode?: string;
    median?: number;
    min?: number;
    max?: number;
  };
}

/**
 * Calculate comprehensive statistics for all survey questions
 */
export function calculateSurveyStatistics(
  questions: Question[],
  responses: Response[]
): QuestionStatistics[] {
  return questions.map(question => {
    const questionResponses = responses.filter(r => r.questionId === question.id);
    
    return {
      questionId: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      totalResponses: questionResponses.length,
      statistics: calculateQuestionStatistics(question, questionResponses),
    };
  });
}

/**
 * Calculate statistics for a single question based on its type
 */
function calculateQuestionStatistics(
  question: Question,
  responses: Response[]
): QuestionStatistics["statistics"] {
  if (responses.length === 0) {
    return {};
  }

  switch (question.questionType) {
    case "multiple_choice":
    case "likert_scale":
      return calculateCategoricalStatistics(responses, question.options || []);
    
    case "rating":
      return calculateNumericStatistics(responses);
    
    case "text":
      return calculateTextStatistics(responses);
    
    default:
      return {};
  }
}

/**
 * Calculate statistics for categorical data (multiple choice, likert scale)
 */
function calculateCategoricalStatistics(
  responses: Response[],
  options: string[]
): QuestionStatistics["statistics"] {
  const frequencies: Record<string, number> = {};
  const percentages: Record<string, number> = {};
  
  // Initialize all options with 0
  options.forEach(option => {
    frequencies[option] = 0;
    percentages[option] = 0;
  });
  
  // Count frequencies
  responses.forEach(response => {
    const answer = response.answerOption;
    if (answer) {
      frequencies[answer] = (frequencies[answer] || 0) + 1;
    }
  });
  
  // Calculate percentages
  const total = responses.length;
  Object.keys(frequencies).forEach(key => {
    percentages[key] = total > 0 ? (frequencies[key] / total) * 100 : 0;
  });
  
  // Find mode (most frequent answer)
  let mode = "";
  let maxFreq = 0;
  Object.entries(frequencies).forEach(([key, freq]) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = key;
    }
  });
  
  return {
    frequencies,
    percentages,
    mode: maxFreq > 0 ? mode : undefined,
  };
}

/**
 * Calculate statistics for numeric data (ratings)
 */
function calculateNumericStatistics(
  responses: Response[]
): QuestionStatistics["statistics"] {
  const values = responses
    .map(r => r.answerValue)
    .filter((v): v is number => v !== null && v !== undefined);
  
  if (values.length === 0) {
    return {};
  }
  
  // Calculate average
  const sum = values.reduce((acc, val) => acc + val, 0);
  const average = sum / values.length;
  
  // Calculate standard deviation
  const squaredDiffs = values.map(val => Math.pow(val - average, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Calculate median
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
  
  // Calculate min and max
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Calculate frequencies for distribution
  const frequencies: Record<string, number> = {};
  const percentages: Record<string, number> = {};
  
  values.forEach(value => {
    const key = value.toString();
    frequencies[key] = (frequencies[key] || 0) + 1;
  });
  
  Object.keys(frequencies).forEach(key => {
    percentages[key] = (frequencies[key]! / values.length) * 100;
  });
  
  return {
    average: Math.round(average * 100) / 100,
    standardDeviation: Math.round(standardDeviation * 100) / 100,
    median,
    min,
    max,
    frequencies,
    percentages,
  };
}

/**
 * Calculate basic statistics for text responses
 */
function calculateTextStatistics(
  responses: Response[]
): QuestionStatistics["statistics"] {
  const textResponses = responses
    .map(r => r.answerText)
    .filter((t): t is string => !!t && t.trim().length > 0);
  
  return {
    frequencies: {
      "إجمالي الإجابات النصية": textResponses.length,
    },
  };
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

/**
 * Format number for display
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Get interpretation level based on percentage
 */
export function getPercentageLevel(percentage: number): "high" | "medium" | "low" {
  if (percentage >= 70) return "high";
  if (percentage >= 40) return "medium";
  return "low";
}

/**
 * Get interpretation level based on average rating
 */
export function getRatingLevel(average: number): "excellent" | "good" | "fair" | "poor" {
  if (average >= 4.5) return "excellent";
  if (average >= 3.5) return "good";
  if (average >= 2.5) return "fair";
  return "poor";
}
