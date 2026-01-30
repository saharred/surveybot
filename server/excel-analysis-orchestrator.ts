import { parseExcelFile, ParsedQuestion } from "./excel-parser";
import { analyzeResponses, generateSimpleInterpretation, SimpleAnalysis } from "./simple-analysis";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { generatePresentationImages } from "./qatari-image-generator";
import { generateSimplePresentation } from "./simple-presentation";
import { nanoid } from "nanoid";

/**
 * Quick educational interpretation using LLM
 */
async function generateQuickInterpretation(questionText: string, statisticalSummary: string): Promise<any> {
  try {
    const prompt = `أنت محلل تربوي متخصص. قم بتحليل نتائج السؤال التالي:

السؤال: ${questionText}

النتائج الإحصائية:
${statisticalSummary}

قدم:
1. تفسير تربوي للنتائج
2. نقاط القوة (إن وجدت)
3. نقاط التحسين (إن وجدت)
4. توصيات عملية

كن مختصراً ومهنياً.`;
    
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت محلل تربوي متخصص في تحليل الاستبيانات التعليمية." },
        { role: "user", content: prompt }
      ]
    });
    
    const content = response.choices[0]?.message?.content || "تعذر إنشاء التفسير";
    
    return {
      interpretation: content,
      strengths: [],
      improvements: [],
      recommendations: []
    };
  } catch (error) {
    console.error('Error generating interpretation:', error);
    return {
      interpretation: "تعذر إنشاء التفسير التلقائي",
      strengths: [],
      improvements: [],
      recommendations: []
    };
  }
}

export interface ExcelAnalysisResult {
  success: boolean;
  presentationUrl?: string;
  reportUrl?: string;
  summary?: string;
  error?: string;
}

/**
 * Orchestrate complete analysis from Excel file
 */
export async function analyzeExcelFile(
  excelBuffer: Buffer
): Promise<ExcelAnalysisResult> {
  try {
    console.log('[Excel Analysis] Starting analysis...');
    
    // Step 1: Parse Excel file
    console.log('[Excel Analysis] Parsing Excel file...');
    const parsedData = await parseExcelFile(excelBuffer);
    console.log(`[Excel Analysis] Found ${parsedData.questions.length} questions and ${parsedData.totalResponses} responses`);
    
    // Step 2: Analyze each question
    console.log('[Excel Analysis] Analyzing questions...');
    const analyses: Array<SimpleAnalysis & { interpretation: any; questionText: string; questionType: string }> = [];
    
    for (const question of parsedData.questions) {
      try {
        // Statistical analysis
        const analysis = analyzeResponses(
          question.responses,
          question.questionType
        );
        
        // Educational interpretation using LLM
        const simpleInterp = generateSimpleInterpretation(question.questionText, analysis, question.questionType);
        const interpretation = await generateQuickInterpretation(question.questionText, simpleInterp);
        
        analyses.push({
          ...analysis,
          interpretation,
          questionText: question.questionText,
          questionType: question.questionType,
        });
        
        console.log(`[Excel Analysis] Analyzed: ${question.questionText.substring(0, 50)}...`);
      } catch (error) {
        console.error(`[Excel Analysis] Error analyzing question: ${question.questionText}`, error);
        // Continue with other questions even if one fails
      }
    }
    
    if (analyses.length === 0) {
      throw new Error('No questions could be analyzed');
    }
    
    // Step 3: Generate overall summary using LLM
    console.log('[Excel Analysis] Generating overall summary...');
    const overallSummary = await generateOverallSummary(analyses, parsedData.questions);
    
    // Step 4: Extract strengths and improvements
    const strengths = extractStrengths(analyses);
    const improvements = extractImprovements(analyses);
    const recommendations = extractRecommendations(analyses);
    
    // Step 5: Generate images with Qatari cultural context
    console.log('[Excel Analysis] Generating culturally appropriate images...');
    const images = await generatePresentationImages();
    console.log(`[Excel Analysis] Generated ${Object.keys(images).length} images`);
    
    // Step 6: Generate presentation
    console.log('[Excel Analysis] Creating presentation...');
    const presentationHTML = await generateSimplePresentation({
      surveyTitle: "تحليل الاستبيان",
      surveyDescription: `تحليل شامل لاستبيان يحتوي على ${parsedData.questions.length} سؤال و ${parsedData.totalResponses} استجابة`,
      schoolInfo: {
        schoolName: "المدرسة",
        principalName: "",
        academicDeputyName: "",
        administrativeDeputyName: "",
        academicYear: new Date().getFullYear().toString(),
      },
      questions: parsedData.questions.map((q, idx) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        analysis: analyses[idx],
      })),
      overallSummary,
      strengths,
      improvements,
      recommendations,
      images,
    });
    
    // Step 7: Upload presentation to S3
    console.log('[Excel Analysis] Uploading presentation...');
    const presentationKey = `presentations/analysis-${nanoid()}.html`;
    const { url: presentationUrl } = await storagePut(
      presentationKey,
      presentationHTML,
      "text/html"
    );
    
    // Step 8: Generate and upload report
    console.log('[Excel Analysis] Creating report...');
    const reportMarkdown = generateReportMarkdown({
      questions: parsedData.questions,
      analyses,
      overallSummary,
      strengths,
      improvements,
      recommendations,
    });
    
    const reportKey = `reports/analysis-${nanoid()}.md`;
    const { url: reportUrl } = await storagePut(
      reportKey,
      reportMarkdown,
      "text/markdown"
    );
    
    console.log('[Excel Analysis] Analysis complete!');
    
    return {
      success: true,
      presentationUrl,
      reportUrl,
      summary: overallSummary,
    };
  } catch (error) {
    console.error('[Excel Analysis] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate overall summary using LLM
 */
async function generateOverallSummary(
  analyses: any[],
  questions: ParsedQuestion[]
): Promise<string> {
  // For now, create a simple summary
  // TODO: Use LLM for more sophisticated summary
  const totalQuestions = questions.length;
  const avgPositiveRate = analyses.reduce((sum, a) => {
    if (a.percentages) {
      const positiveOptions = Object.entries(a.percentages)
        .filter(([key]) => key.includes('نعم') || key.includes('موافق') || key.includes('ممتاز'))
        .reduce((s, [, val]) => s + (val as number), 0);
      return sum + positiveOptions;
    }
    return sum;
  }, 0) / analyses.length;
  
  return `تم تحليل ${totalQuestions} سؤالاً بمشاركة واسعة من المستجيبين. تشير النتائج الإجمالية إلى مستوى إيجابي من الرضا بنسبة ${avgPositiveRate.toFixed(1)}%، مع وجود مجالات واضحة للتحسين والتطوير.`;
}

/**
 * Extract strengths from analyses
 */
function extractStrengths(analyses: any[]): string[] {
  const strengths: string[] = [];
  
  analyses.forEach((analysis, idx) => {
    if (analysis.interpretation?.strengths) {
      strengths.push(...analysis.interpretation.strengths);
    }
  });
  
  // Return top 5 unique strengths
  return Array.from(new Set(strengths)).slice(0, 5);
}

/**
 * Extract improvements from analyses
 */
function extractImprovements(analyses: any[]): string[] {
  const improvements: string[] = [];
  
  analyses.forEach((analysis) => {
    if (analysis.interpretation?.improvements) {
      improvements.push(...analysis.interpretation.improvements);
    }
  });
  
  // Return top 5 unique improvements
  return Array.from(new Set(improvements)).slice(0, 5);
}

/**
 * Extract recommendations from analyses
 */
function extractRecommendations(analyses: any[]): string[] {
  const recommendations: string[] = [];
  
  analyses.forEach((analysis) => {
    if (analysis.interpretation?.recommendations) {
      recommendations.push(...analysis.interpretation.recommendations);
    }
  });
  
  // Return top 7 unique recommendations
  return Array.from(new Set(recommendations)).slice(0, 7);
}

/**
 * Generate report in Markdown format
 */
function generateReportMarkdown(data: {
  questions: ParsedQuestion[];
  analyses: any[];
  overallSummary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}): string {
  let markdown = `# تقرير تحليل الاستبيان التعليمي\n\n`;
  markdown += `**التاريخ:** ${new Date().toLocaleDateString('ar-QA')}\n\n`;
  markdown += `---\n\n`;
  
  markdown += `## الملخص التنفيذي\n\n`;
  markdown += `${data.overallSummary}\n\n`;
  markdown += `---\n\n`;
  
  markdown += `## نقاط القوة\n\n`;
  data.strengths.forEach((strength, idx) => {
    markdown += `${idx + 1}. ${strength}\n`;
  });
  markdown += `\n---\n\n`;
  
  markdown += `## نقاط التحسين\n\n`;
  data.improvements.forEach((improvement, idx) => {
    markdown += `${idx + 1}. ${improvement}\n`;
  });
  markdown += `\n---\n\n`;
  
  markdown += `## التوصيات\n\n`;
  data.recommendations.forEach((recommendation, idx) => {
    markdown += `${idx + 1}. ${recommendation}\n`;
  });
  markdown += `\n---\n\n`;
  
  markdown += `## التحليل التفصيلي\n\n`;
  data.questions.forEach((question, idx) => {
    const analysis = data.analyses[idx];
    if (!analysis) return;
    
    markdown += `### السؤال ${idx + 1}: ${question.questionText}\n\n`;
    markdown += `**نوع السؤال:** ${question.questionType}\n\n`;
    
    if (analysis.percentages) {
      markdown += `**النسب المئوية:**\n`;
      Object.entries(analysis.percentages).forEach(([key, value]) => {
        markdown += `- ${key}: ${(value as number).toFixed(1)}%\n`;
      });
      markdown += `\n`;
    }
    
    if (analysis.mean !== undefined) {
      markdown += `**المتوسط:** ${analysis.mean.toFixed(2)}\n\n`;
    }
    
    if (analysis.interpretation) {
      markdown += `**التفسير التربوي:**\n${analysis.interpretation.interpretation || ''}\n\n`;
    }
    
    markdown += `---\n\n`;
  });
  
  return markdown;
}
