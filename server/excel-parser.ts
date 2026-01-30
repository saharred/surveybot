import * as XLSX from 'xlsx';

export interface ParsedQuestion {
  columnName: string;
  questionText: string;
  questionType: 'multiple_choice' | 'likert_scale' | 'rating' | 'text' | 'yes_no';
  responses: (string | number | null)[];
  uniqueValues: (string | number)[];
}

export interface ParsedExcelData {
  totalResponses: number;
  questions: ParsedQuestion[];
  metadata: {
    hasTimestamps: boolean;
    hasEmails: boolean;
    columns: string[];
  };
}

/**
 * Columns to ignore from MS Forms exports
 */
const IGNORED_COLUMNS = [
  'ID',
  'Start time',
  'Completion time',
  'Email',
  'Name',
  'Last modified time',
  'الوقت',
  'البريد الإلكتروني',
  'الاسم',
];

/**
 * Check if a column should be ignored
 */
function shouldIgnoreColumn(columnName: string): boolean {
  return IGNORED_COLUMNS.some(ignored => 
    columnName.toLowerCase().includes(ignored.toLowerCase())
  );
}

/**
 * Determine question type based on responses
 */
function determineQuestionType(responses: (string | number | null)[]): ParsedQuestion['questionType'] {
  const nonNullResponses = responses.filter(r => r !== null && r !== undefined && r !== '');
  
  if (nonNullResponses.length === 0) {
    return 'text';
  }

  // Get unique values
  const uniqueValues = Array.from(new Set(nonNullResponses.map(r => String(r).trim())));
  
  // Check if all responses are numbers
  const allNumbers = nonNullResponses.every(r => !isNaN(Number(r)));
  
  // Rating: numbers 1-5 or 1-10
  if (allNumbers) {
    const numbers = nonNullResponses.map(r => Number(r));
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    
    if (min >= 1 && max <= 5 && uniqueValues.length <= 5) {
      return 'rating';
    }
    if (min >= 1 && max <= 10 && uniqueValues.length <= 10) {
      return 'rating';
    }
  }
  
  // Yes/No questions
  const yesNoPatterns = ['نعم', 'لا', 'yes', 'no', 'احيانا', 'أحياناً', 'sometimes'];
  if (uniqueValues.length <= 3 && uniqueValues.every(v => 
    yesNoPatterns.some(pattern => String(v).toLowerCase().includes(pattern.toLowerCase()))
  )) {
    return 'yes_no';
  }
  
  // Likert scale: 5 options with agreement patterns
  const likertPatterns = ['موافق', 'غير موافق', 'محايد', 'agree', 'disagree', 'neutral'];
  if (uniqueValues.length >= 3 && uniqueValues.length <= 7 && 
      uniqueValues.some(v => likertPatterns.some(pattern => 
        String(v).toLowerCase().includes(pattern.toLowerCase())
      ))) {
    return 'likert_scale';
  }
  
  // Multiple choice: limited unique values (2-10)
  if (uniqueValues.length >= 2 && uniqueValues.length <= 10) {
    // Check if responses are short (not long text)
    const avgLength = uniqueValues.reduce((sum, v) => sum + String(v).length, 0) / uniqueValues.length;
    if (avgLength < 50) {
      return 'multiple_choice';
    }
  }
  
  // Default to text for long responses or many unique values
  return 'text';
}

/**
 * Parse Excel file from MS Forms
 */
export async function parseExcelFile(buffer: Buffer): Promise<ParsedExcelData> {
  try {
    // Read workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('No sheets found in Excel file');
    }
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    
    if (jsonData.length === 0) {
      throw new Error('No data found in Excel file');
    }
    
    // Get all column names
    const allColumns = Object.keys(jsonData[0] || {});
    
    // Filter out ignored columns
    const questionColumns = allColumns.filter(col => !shouldIgnoreColumn(col));
    
    if (questionColumns.length === 0) {
      throw new Error('No question columns found in Excel file');
    }
    
    // Parse questions
    const questions: ParsedQuestion[] = questionColumns.map(columnName => {
      // Extract responses for this column
      const responses = jsonData.map(row => {
        const value = row[columnName];
        if (value === null || value === undefined || value === '') {
          return null;
        }
        return value;
      });
      
      // Get unique non-null values
      const uniqueValues = Array.from(
        new Set(responses.filter(r => r !== null))
      );
      
      // Determine question type
      const questionType = determineQuestionType(responses);
      
      return {
        columnName,
        questionText: columnName,
        questionType,
        responses,
        uniqueValues,
      };
    });
    
    return {
      totalResponses: jsonData.length,
      questions,
      metadata: {
        hasTimestamps: allColumns.some(col => col.toLowerCase().includes('time') || col.includes('وقت')),
        hasEmails: allColumns.some(col => col.toLowerCase().includes('email') || col.includes('بريد')),
        columns: allColumns,
      },
    };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate Excel file
 */
export function validateExcelFile(buffer: Buffer): { valid: boolean; error?: string } {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    if (workbook.SheetNames.length === 0) {
      return { valid: false, error: 'No sheets found in Excel file' };
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName!];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      return { valid: false, error: 'Excel file is empty' };
    }
    
    if (jsonData.length < 5) {
      return { valid: false, error: 'Excel file must contain at least 5 responses for meaningful analysis' };
    }
    
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: `Invalid Excel file: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}
