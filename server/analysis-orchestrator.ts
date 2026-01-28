import * as db from "./db";
import { calculateSurveyStatistics } from "./analysis-engine";
import { generateEducationalInterpretations, generateOverallAnalysis } from "./interpretation-engine";
import { generateHTMLPresentation, generateDetailedReport } from "./presentation-generator";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";
import { nanoid } from "nanoid";

/**
 * Main orchestrator for complete survey analysis
 */
export async function performCompleteAnalysis(surveyId: number): Promise<void> {
  console.log(`[Analysis] Starting analysis for survey ${surveyId}`);

  try {
    // 1. Get survey and school data
    const survey = await db.getSurveyById(surveyId);
    if (!survey) {
      throw new Error("Survey not found");
    }

    const school = await db.getSchoolById(survey.schoolId);
    if (!school) {
      throw new Error("School not found");
    }

    // 2. Get questions and responses
    const questions = await db.getQuestionsBySurveyId(surveyId);
    const responses = await db.getResponsesBySurveyId(surveyId);

    if (responses.length === 0) {
      throw new Error("No responses found for this survey");
    }

    console.log(`[Analysis] Found ${questions.length} questions and ${responses.length} responses`);

    // 3. Calculate statistical analysis
    console.log(`[Analysis] Calculating statistics...`);
    const statistics = calculateSurveyStatistics(questions, responses);

    // 4. Generate educational interpretations using LLM
    console.log(`[Analysis] Generating educational interpretations...`);
    const interpretations = await generateEducationalInterpretations(survey, school, statistics);

    // 5. Generate overall analysis
    console.log(`[Analysis] Generating overall analysis...`);
    const overallAnalysis = await generateOverallAnalysis(survey, school, statistics, interpretations);

    // 6. Create or update analysis record
    let analysis = await db.getAnalysisBySurveyId(surveyId);
    
    if (!analysis) {
      analysis = await db.createAnalysis({
        surveyId,
        status: "processing",
        statisticalData: statistics,
        educationalInterpretation: interpretations,
        overallSummary: overallAnalysis.overallSummary,
        strengths: overallAnalysis.strengths,
        improvements: overallAnalysis.improvements,
        recommendations: overallAnalysis.recommendations,
      });
    } else {
      await db.updateAnalysis(surveyId, {
        statisticalData: statistics,
        educationalInterpretation: interpretations,
        overallSummary: overallAnalysis.overallSummary,
        strengths: overallAnalysis.strengths,
        improvements: overallAnalysis.improvements,
        recommendations: overallAnalysis.recommendations,
      });
      // Refresh analysis object
      analysis = await db.getAnalysisBySurveyId(surveyId);
      if (!analysis) throw new Error("Failed to refresh analysis");
    }

    // 7. Generate HTML presentation
    console.log(`[Analysis] Generating HTML presentation...`);
    const presentationHTML = generateHTMLPresentation(school, survey, analysis);

    // 8. Generate detailed report
    console.log(`[Analysis] Generating detailed report...`);
    const reportMarkdown = generateDetailedReport(school, survey, analysis);

    // 9. Upload to S3
    console.log(`[Analysis] Uploading files to S3...`);
    const timestamp = Date.now();
    const suffix = nanoid(8);

    // Upload presentation
    const presentationKey = `surveys/${surveyId}/presentation-${timestamp}-${suffix}.html`;
    const presentationResult = await storagePut(
      presentationKey,
      Buffer.from(presentationHTML, "utf-8"),
      "text/html; charset=utf-8"
    );

    // Upload report
    const reportKey = `surveys/${surveyId}/report-${timestamp}-${suffix}.md`;
    const reportResult = await storagePut(
      reportKey,
      Buffer.from(reportMarkdown, "utf-8"),
      "text/markdown; charset=utf-8"
    );

    // 10. Update analysis with file URLs
    await db.updateAnalysis(surveyId, {
      presentationUrl: presentationResult.url,
      presentationKey: presentationResult.key,
      reportUrl: reportResult.url,
      reportKey: reportResult.key,
      status: "completed",
      completedAt: new Date(),
    });

    console.log(`[Analysis] Analysis completed successfully for survey ${surveyId}`);

    // 11. Notify owner
    try {
      await notifyOwner({
        title: "اكتمل تحليل الاستبيان",
        content: `تم الانتهاء من تحليل استبيان "${survey.title}" لمدرسة ${school.schoolName}. العروض التقديمية والتقارير جاهزة للعرض.`,
      });
    } catch (error) {
      console.error("[Analysis] Failed to send notification:", error);
      // Don't fail the entire analysis if notification fails
    }

  } catch (error) {
    console.error(`[Analysis] Error during analysis:`, error);

    // Update analysis status to failed
    try {
      await db.updateAnalysis(surveyId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    } catch (updateError) {
      console.error("[Analysis] Failed to update error status:", updateError);
    }

    throw error;
  }
}

/**
 * Check if survey is ready for analysis
 */
export async function isSurveyReadyForAnalysis(surveyId: number): Promise<{
  ready: boolean;
  reason?: string;
}> {
  const survey = await db.getSurveyById(surveyId);
  if (!survey) {
    return { ready: false, reason: "Survey not found" };
  }

  if (survey.status !== "closed") {
    return { ready: false, reason: "Survey must be closed before analysis" };
  }

  const responseCount = await db.getResponseCountBySurveyId(surveyId);
  if (responseCount === 0) {
    return { ready: false, reason: "No responses found" };
  }

  return { ready: true };
}
