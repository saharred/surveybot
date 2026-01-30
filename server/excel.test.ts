import { describe, expect, it } from "vitest";
import { parseExcelFile, validateExcelFile } from "./excel-parser";
import { analyzeResponses } from "./simple-analysis";
import * as fs from "fs";
import * as path from "path";

describe("Excel Analysis System", () => {
  const testFilePath = "/home/ubuntu/upload/استجاباتلطلابالفصلالأول.xlsx";
  
  it("should validate Excel file correctly", () => {
    const buffer = fs.readFileSync(testFilePath);
    const validation = validateExcelFile(buffer);
    
    expect(validation.valid).toBe(true);
    expect(validation.error).toBeUndefined();
  });
  
  it("should parse Excel file from MS Forms", async () => {
    const buffer = fs.readFileSync(testFilePath);
    const parsed = await parseExcelFile(buffer);
    
    expect(parsed.totalResponses).toBeGreaterThan(0);
    expect(parsed.questions.length).toBeGreaterThan(0);
    expect(parsed.metadata.hasTimestamps).toBe(true);
    
    console.log(`\n📊 Parsed ${parsed.questions.length} questions from ${parsed.totalResponses} responses`);
  });
  
  it("should identify question types correctly", async () => {
    const buffer = fs.readFileSync(testFilePath);
    const parsed = await parseExcelFile(buffer);
    
    const questionTypes = parsed.questions.map(q => q.questionType);
    const uniqueTypes = Array.from(new Set(questionTypes));
    
    expect(uniqueTypes.length).toBeGreaterThan(0);
    console.log(`\n📝 Question types found: ${uniqueTypes.join(', ')}`);
  });
  
  it("should analyze responses correctly", async () => {
    const buffer = fs.readFileSync(testFilePath);
    const parsed = await parseExcelFile(buffer);
    
    const firstQuestion = parsed.questions[0];
    if (!firstQuestion) {
      throw new Error('No questions found');
    }
    
    const analysis = analyzeResponses(
      firstQuestion.responses,
      firstQuestion.questionType
    );
    
    expect(analysis.total).toBeGreaterThan(0);
    expect(analysis.percentages).toBeDefined();
    
    console.log(`\n📈 Analysis of first question:`);
    console.log(`   Total responses: ${analysis.total}`);
    console.log(`   Percentages:`, analysis.percentages);
  });
  
  it("should filter out administrative columns", async () => {
    const buffer = fs.readFileSync(testFilePath);
    const parsed = await parseExcelFile(buffer);
    
    const columnNames = parsed.questions.map(q => q.columnName);
    
    // Should not include ID, Email, Time columns
    expect(columnNames.some(name => name === 'ID')).toBe(false);
    expect(columnNames.some(name => name.toLowerCase().includes('email'))).toBe(false);
    
    console.log(`\n✅ Successfully filtered out administrative columns`);
  });
});
