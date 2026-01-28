import { invokeLLM } from "./_core/llm";
import { QuestionStatistics } from "./analysis-engine";
import { Survey, School } from "../drizzle/schema";

export interface EducationalInterpretation {
  questionId: number;
  interpretation: string;
  pedagogicalInsights: string;
  impact: string;
}

export interface OverallAnalysis {
  overallSummary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

/**
 * Generate educational interpretations for all questions using LLM
 */
export async function generateEducationalInterpretations(
  survey: Survey,
  school: School,
  statistics: QuestionStatistics[]
): Promise<EducationalInterpretation[]> {
  const interpretations: EducationalInterpretation[] = [];

  for (const stat of statistics) {
    try {
      const interpretation = await interpretSingleQuestion(survey, school, stat);
      interpretations.push(interpretation);
    } catch (error) {
      console.error(`Failed to interpret question ${stat.questionId}:`, error);
      // Provide fallback interpretation
      interpretations.push({
        questionId: stat.questionId,
        interpretation: "تعذر إنشاء التفسير التلقائي لهذا السؤال.",
        pedagogicalInsights: "يرجى مراجعة النتائج الإحصائية يدوياً.",
        impact: "غير متوفر",
      });
    }
  }

  return interpretations;
}

/**
 * Interpret a single question using LLM
 */
async function interpretSingleQuestion(
  survey: Survey,
  school: School,
  statistics: QuestionStatistics
): Promise<EducationalInterpretation> {
  const prompt = buildQuestionInterpretationPrompt(survey, school, statistics);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `أنت محلل تربوي متخصص في تحليل نتائج الاستبيانات التعليمية. مهمتك هي تقديم تفسير تربوي احترافي ومفيد للنتائج الإحصائية.

يجب أن يكون تحليلك:
- تربوياً ومهنياً
- واضحاً ومباشراً
- داعماً وإيجابياً
- يركز على التحسين المستمر
- يقدم رؤى قابلة للتطبيق

قدم إجابتك بصيغة JSON بالشكل التالي:
{
  "interpretation": "قراءة دقيقة للنتائج وماذا تعني الأرقام",
  "pedagogicalInsights": "تفسير تربوي: ماذا تعني هذه النتيجة تربوياً وكيف تؤثر على جودة التعليم",
  "impact": "الأثر المتوقع على العملية التعليمية"
}`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "question_interpretation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            interpretation: {
              type: "string",
              description: "قراءة دقيقة للنتائج الإحصائية",
            },
            pedagogicalInsights: {
              type: "string",
              description: "التفسير التربوي والرؤى التعليمية",
            },
            impact: {
              type: "string",
              description: "الأثر على جودة التعليم",
            },
          },
          required: ["interpretation", "pedagogicalInsights", "impact"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No response from LLM");
  }

  const parsed = JSON.parse(content);

  return {
    questionId: statistics.questionId,
    interpretation: parsed.interpretation,
    pedagogicalInsights: parsed.pedagogicalInsights,
    impact: parsed.impact,
  };
}

/**
 * Generate overall analysis and recommendations
 */
export async function generateOverallAnalysis(
  survey: Survey,
  school: School,
  statistics: QuestionStatistics[],
  interpretations: EducationalInterpretation[]
): Promise<OverallAnalysis> {
  const prompt = buildOverallAnalysisPrompt(survey, school, statistics, interpretations);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `أنت محلل تربوي متخصص في تقييم الأداء التعليمي. مهمتك هي تقديم تحليل شامل للاستبيان يتضمن:

1. ملخص عام للنتائج
2. نقاط القوة (3-5 نقاط)
3. نقاط التحسين (3-5 نقاط)
4. توصيات عملية قابلة للتطبيق (5-7 توصيات)

يجب أن يكون أسلوبك:
- تربوياً احترافياً
- واضحاً ومباشراً
- داعماً وإيجابياً
- يركز على التحسين المستمر
- غير نقدي جارح

قدم إجابتك بصيغة JSON.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "overall_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            overallSummary: {
              type: "string",
              description: "ملخص عام شامل لنتائج الاستبيان",
            },
            strengths: {
              type: "array",
              description: "نقاط القوة التي أظهرتها النتائج",
              items: { type: "string" },
            },
            improvements: {
              type: "array",
              description: "نقاط التحسين والتحديات",
              items: { type: "string" },
            },
            recommendations: {
              type: "array",
              description: "توصيات عملية قابلة للتطبيق",
              items: { type: "string" },
            },
          },
          required: ["overallSummary", "strengths", "improvements", "recommendations"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No response from LLM");
  }

  return JSON.parse(content);
}

/**
 * Build prompt for single question interpretation
 */
function buildQuestionInterpretationPrompt(
  survey: Survey,
  school: School,
  statistics: QuestionStatistics
): string {
  let statsDescription = "";

  if (statistics.statistics.percentages) {
    statsDescription = "النسب المئوية:\n";
    Object.entries(statistics.statistics.percentages).forEach(([option, percentage]) => {
      statsDescription += `- ${option}: ${percentage.toFixed(1)}%\n`;
    });
  }

  if (statistics.statistics.average !== undefined) {
    statsDescription += `\nالمتوسط: ${statistics.statistics.average}\n`;
  }

  if (statistics.statistics.standardDeviation !== undefined) {
    statsDescription += `الانحراف المعياري: ${statistics.statistics.standardDeviation}\n`;
  }

  if (statistics.statistics.mode) {
    statsDescription += `الإجابة الأكثر تكراراً: ${statistics.statistics.mode}\n`;
  }

  return `
المدرسة: ${school.schoolName}
العام الأكاديمي: ${school.academicYear}
عنوان الاستبيان: ${survey.title}
الفئة المستهدفة: ${survey.targetAudience || "غير محدد"}

السؤال: ${statistics.questionText}
نوع السؤال: ${statistics.questionType}
عدد الإجابات: ${statistics.totalResponses}

النتائج الإحصائية:
${statsDescription}

قم بتحليل هذه النتائج تربوياً وقدم تفسيراً مهنياً.
`;
}

/**
 * Build prompt for overall analysis
 */
function buildOverallAnalysisPrompt(
  survey: Survey,
  school: School,
  statistics: QuestionStatistics[],
  interpretations: EducationalInterpretation[]
): string {
  let questionsOverview = "";
  statistics.forEach((stat, index) => {
    questionsOverview += `\n${index + 1}. ${stat.questionText}\n`;
    questionsOverview += `   - عدد الإجابات: ${stat.totalResponses}\n`;

    if (stat.statistics.average) {
      questionsOverview += `   - المتوسط: ${stat.statistics.average}\n`;
    }

    if (stat.statistics.mode) {
      questionsOverview += `   - الإجابة الأكثر تكراراً: ${stat.statistics.mode}\n`;
    }
  });

  return `
المدرسة: ${school.schoolName}
المديرة: ${school.principalName}
النائبة الأكاديمية: ${school.academicDeputyName}
النائبة الإدارية: ${school.administrativeDeputyName}
العام الأكاديمي: ${school.academicYear}

عنوان الاستبيان: ${survey.title}
${survey.description ? `الوصف: ${survey.description}` : ""}
${survey.purpose ? `الهدف: ${survey.purpose}` : ""}
الفئة المستهدفة: ${survey.targetAudience || "غير محدد"}

ملخص الأسئلة والنتائج:
${questionsOverview}

بناءً على هذه النتائج، قدم تحليلاً شاملاً يتضمن:
1. ملخص عام للنتائج
2. نقاط القوة (3-5 نقاط)
3. نقاط التحسين (3-5 نقاط)
4. توصيات عملية قابلة للتطبيق داخل المدرسة (5-7 توصيات)
`;
}
