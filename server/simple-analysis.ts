/**
 * Simplified analysis functions for Excel data
 */

export interface SimpleAnalysis {
  percentages?: Record<string, number>;
  mean?: number;
  stdDev?: number;
  frequencies?: Record<string, number>;
  mode?: string;
  total: number;
}

/**
 * Analyze responses for any question type
 */
export function analyzeResponses(
  responses: (string | number | null)[],
  questionType: string
): SimpleAnalysis {
  // Filter out null/empty responses
  const validResponses = responses.filter(r => r !== null && r !== undefined && r !== '');
  
  if (validResponses.length === 0) {
    return { total: 0 };
  }
  
  const analysis: SimpleAnalysis = {
    total: validResponses.length,
  };
  
  // Calculate frequencies
  const frequencies: Record<string, number> = {};
  validResponses.forEach(response => {
    const key = String(response);
    frequencies[key] = (frequencies[key] || 0) + 1;
  });
  
  analysis.frequencies = frequencies;
  
  // Calculate percentages
  const percentages: Record<string, number> = {};
  Object.entries(frequencies).forEach(([key, count]) => {
    percentages[key] = (count / validResponses.length) * 100;
  });
  
  analysis.percentages = percentages;
  
  // Find mode (most common response)
  const sortedFreq = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
  if (sortedFreq.length > 0) {
    analysis.mode = sortedFreq[0]![0];
  }
  
  // For numeric responses, calculate mean and standard deviation
  const numericResponses = validResponses
    .map(r => Number(r))
    .filter(n => !isNaN(n));
  
  if (numericResponses.length > 0) {
    // Mean
    const sum = numericResponses.reduce((a, b) => a + b, 0);
    analysis.mean = sum / numericResponses.length;
    
    // Standard deviation
    const squaredDiffs = numericResponses.map(n => Math.pow(n - analysis.mean!, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / numericResponses.length;
    analysis.stdDev = Math.sqrt(variance);
  }
  
  return analysis;
}

/**
 * Generate simple interpretation text
 */
export function generateSimpleInterpretation(
  questionText: string,
  analysis: SimpleAnalysis,
  questionType: string
): string {
  let interpretation = `تحليل السؤال: "${questionText}"\n\n`;
  
  interpretation += `عدد الاستجابات: ${analysis.total}\n\n`;
  
  if (analysis.percentages) {
    interpretation += `توزيع الإجابات:\n`;
    const sorted = Object.entries(analysis.percentages)
      .sort((a, b) => b[1] - a[1]);
    
    sorted.forEach(([option, percentage]) => {
      interpretation += `- ${option}: ${percentage.toFixed(1)}%\n`;
    });
    interpretation += `\n`;
  }
  
  if (analysis.mean !== undefined) {
    interpretation += `المتوسط: ${analysis.mean.toFixed(2)}\n`;
  }
  
  if (analysis.stdDev !== undefined) {
    interpretation += `الانحراف المعياري: ${analysis.stdDev.toFixed(2)}\n`;
  }
  
  if (analysis.mode) {
    interpretation += `\nالإجابة الأكثر تكراراً: ${analysis.mode}\n`;
  }
  
  return interpretation;
}
