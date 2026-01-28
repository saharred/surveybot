import { Survey, School, Analysis } from "../drizzle/schema";
import { QuestionStatistics } from "./analysis-engine";

/**
 * Generate professional HTML presentation
 */
export function generateHTMLPresentation(
  school: School,
  survey: Survey,
  analysis: Analysis
): string {
  const stats = analysis.statisticalData || [];
  const interpretations = analysis.educationalInterpretation || [];

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${survey.title} - ${school.schoolName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Cairo', sans-serif;
      line-height: 1.8;
      color: #1a1a1a;
      background: #f8f9fa;
    }
    
    .slide {
      min-height: 100vh;
      padding: 60px 80px;
      page-break-after: always;
      background: white;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    
    .logo-placeholder {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 14px;
      text-align: center;
      padding: 10px;
    }
    
    .school-info {
      flex: 1;
      text-align: center;
      padding: 0 40px;
    }
    
    .school-name {
      font-size: 32px;
      font-weight: 800;
      color: #1e40af;
      margin-bottom: 10px;
    }
    
    .academic-year {
      font-size: 20px;
      color: #64748b;
      font-weight: 600;
    }
    
    .title-slide {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    }
    
    .main-title {
      font-size: 48px;
      font-weight: 800;
      color: #1e40af;
      margin-bottom: 30px;
      line-height: 1.3;
    }
    
    .subtitle {
      font-size: 24px;
      color: #475569;
      margin-bottom: 50px;
    }
    
    .management-team {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      margin-top: 40px;
      width: 100%;
      max-width: 800px;
    }
    
    .management-team h3 {
      font-size: 24px;
      color: #1e40af;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .management-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      text-align: center;
    }
    
    .management-item {
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
    }
    
    .management-role {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 8px;
    }
    
    .management-name {
      font-size: 18px;
      font-weight: 700;
      color: #1e40af;
    }
    
    .vision-box {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
      margin-top: 40px;
      width: 100%;
      max-width: 800px;
    }
    
    .vision-label {
      font-size: 20px;
      margin-bottom: 15px;
      opacity: 0.9;
    }
    
    .vision-text {
      font-size: 36px;
      font-weight: 800;
      line-height: 1.4;
    }
    
    h1 {
      font-size: 36px;
      color: #1e40af;
      margin-bottom: 30px;
      font-weight: 800;
    }
    
    h2 {
      font-size: 28px;
      color: #2563eb;
      margin-bottom: 20px;
      font-weight: 700;
    }
    
    h3 {
      font-size: 22px;
      color: #475569;
      margin-bottom: 15px;
      font-weight: 600;
    }
    
    .content-section {
      margin-bottom: 30px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    
    .stat-card {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      border-right: 4px solid #2563eb;
    }
    
    .stat-label {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 8px;
    }
    
    .stat-value {
      font-size: 32px;
      font-weight: 800;
      color: #1e40af;
    }
    
    .stat-unit {
      font-size: 16px;
      color: #64748b;
      margin-right: 5px;
    }
    
    .chart-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid #e2e8f0;
    }
    
    .bar-chart {
      margin: 20px 0;
    }
    
    .bar-item {
      margin-bottom: 15px;
    }
    
    .bar-label {
      font-size: 14px;
      color: #475569;
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
    }
    
    .bar-bg {
      background: #e2e8f0;
      height: 30px;
      border-radius: 6px;
      overflow: hidden;
    }
    
    .bar-fill {
      background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 10px;
      color: white;
      font-weight: 600;
      font-size: 14px;
      transition: width 0.3s ease;
    }
    
    .interpretation-box {
      background: #eff6ff;
      border-right: 4px solid #2563eb;
      padding: 25px;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .interpretation-box h4 {
      color: #1e40af;
      font-size: 18px;
      margin-bottom: 12px;
      font-weight: 700;
    }
    
    .interpretation-box p {
      color: #475569;
      font-size: 16px;
      line-height: 1.8;
      margin-bottom: 10px;
    }
    
    .list-section {
      margin: 20px 0;
    }
    
    .list-section ul {
      list-style: none;
      padding: 0;
    }
    
    .list-section li {
      background: #f8fafc;
      padding: 15px 20px;
      margin-bottom: 10px;
      border-radius: 6px;
      border-right: 3px solid #2563eb;
      font-size: 16px;
      color: #475569;
    }
    
    .list-section li::before {
      content: "✓";
      color: #2563eb;
      font-weight: bold;
      margin-left: 10px;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
      padding: 25px;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .highlight-box h3 {
      color: #92400e;
      margin-bottom: 15px;
    }
    
    .highlight-box p {
      color: #78350f;
      font-size: 16px;
      line-height: 1.8;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }
    
    @media print {
      .slide {
        margin-bottom: 0;
        box-shadow: none;
      }
      
      body {
        background: white;
      }
    }
  </style>
</head>
<body>

  <!-- Slide 1: Title -->
  <div class="slide title-slide">
    <div class="header">
      <div class="logo-placeholder">
        شعار وزارة<br>التربية والتعليم<br>والتعليم العالي
      </div>
      <div class="school-info">
        <div class="school-name">${school.schoolName}</div>
        <div class="academic-year">العام الأكاديمي ${school.academicYear}</div>
      </div>
      <div style="width: 120px;"></div>
    </div>
    
    <div class="main-title">${survey.title}</div>
    <div class="subtitle">تحليل شامل لنتائج الاستبيان</div>
    
    <div class="management-team">
      <h3>إدارة المدرسة</h3>
      <div class="management-grid">
        <div class="management-item">
          <div class="management-role">مديرة المدرسة</div>
          <div class="management-name">${school.principalName}</div>
        </div>
        <div class="management-item">
          <div class="management-role">النائبة الأكاديمية</div>
          <div class="management-name">${school.academicDeputyName}</div>
        </div>
        <div class="management-item">
          <div class="management-role">النائبة الإدارية</div>
          <div class="management-name">${school.administrativeDeputyName}</div>
        </div>
      </div>
    </div>
    
    <div class="vision-box">
      <div class="vision-label">الرؤية</div>
      <div class="vision-text">«متعلم ريادي لتنمية مستدامة»</div>
    </div>
  </div>

  <!-- Slide 2: Introduction -->
  <div class="slide">
    <div class="header">
      <div class="school-info">
        <div class="school-name">${school.schoolName}</div>
      </div>
    </div>
    
    <h1>مقدمة عن الاستبيان</h1>
    
    <div class="content-section">
      <h3>هدف الاستبيان</h3>
      <p style="font-size: 18px; color: #475569; line-height: 1.8;">
        ${survey.purpose || "قياس وتقييم جوانب مختلفة من العملية التعليمية للوصول إلى تحسين مستمر في جودة التعليم"}
      </p>
    </div>
    
    <div class="content-section">
      <h3>الفئة المستهدفة</h3>
      <p style="font-size: 18px; color: #475569;">
        ${getTargetAudienceLabel(survey.targetAudience)}
      </p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">عدد الأسئلة</div>
        <div class="stat-value">${stats.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">إجمالي المشاركين</div>
        <div class="stat-value">${stats[0]?.totalResponses || 0}</div>
      </div>
    </div>
  </div>

  <!-- Slide 3: Methodology -->
  <div class="slide">
    <div class="header">
      <div class="school-info">
        <div class="school-name">${school.schoolName}</div>
      </div>
    </div>
    
    <h1>منهجية التحليل</h1>
    
    <div class="content-section">
      <p style="font-size: 18px; color: #475569; line-height: 1.8; margin-bottom: 30px;">
        تم تحليل نتائج الاستبيان باستخدام أساليب إحصائية متقدمة وتفسير تربوي متخصص لضمان دقة النتائج وفائدتها العملية.
      </p>
      
      <h3>الأساليب الإحصائية المستخدمة:</h3>
      <div class="list-section">
        <ul>
          <li>حساب النسب المئوية لكل خيار من خيارات الإجابة</li>
          <li>حساب المتوسطات الحسابية للتقييمات الرقمية</li>
          <li>حساب الانحراف المعياري لقياس تشتت الإجابات</li>
          <li>تحديد توزيع التكرارات والإجابات الأكثر شيوعاً</li>
          <li>تحليل الاتجاهات العامة في البيانات</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Slide 4: Overall Summary -->
  <div class="slide">
    <div class="header">
      <div class="school-info">
        <div class="school-name">${school.schoolName}</div>
      </div>
    </div>
    
    <h1>ملخص عام للنتائج</h1>
    
    <div class="highlight-box">
      <p style="font-size: 18px; line-height: 1.8;">
        ${analysis.overallSummary || "تم تحليل جميع الإجابات بنجاح وتوليد التفسيرات التربوية المناسبة."}
      </p>
    </div>
  </div>

  ${generateQuestionSlides(stats, interpretations, school.schoolName)}

  <!-- Strengths Slide -->
  <div class="slide">
    <div class="header">
      <div class="school-info">
        <div class="school-name">${school.schoolName}</div>
      </div>
    </div>
    
    <h1>نقاط القوة</h1>
    
    <div class="list-section">
      <ul>
        ${(analysis.strengths || []).map(strength => `<li>${strength}</li>`).join("")}
      </ul>
    </div>
  </div>

  <!-- Improvements Slide -->
  <div class="slide">
    <div class="header">
      <div class="school-info">
        <div class="school-name">${school.schoolName}</div>
      </div>
    </div>
    
    <h1>نقاط التحسين والتحديات</h1>
    
    <div class="list-section">
      <ul>
        ${(analysis.improvements || []).map(improvement => `<li>${improvement}</li>`).join("")}
      </ul>
    </div>
  </div>

  <!-- Recommendations Slide -->
  <div class="slide">
    <div class="header">
      <div class="school-info">
        <div class="school-name">${school.schoolName}</div>
      </div>
    </div>
    
    <h1>التوصيات والمقترحات</h1>
    
    <div class="list-section">
      <ul>
        ${(analysis.recommendations || []).map(rec => `<li>${rec}</li>`).join("")}
      </ul>
    </div>
  </div>

  <!-- Final Slide -->
  <div class="slide title-slide">
    <div class="header">
      <div class="school-info">
        <div class="school-name">${school.schoolName}</div>
      </div>
    </div>
    
    <div class="main-title">شكراً لكم</div>
    <div class="subtitle">نحو تعليم أفضل ومستقبل أكثر إشراقاً</div>
    
    <div class="vision-box">
      <div class="vision-text">«متعلم ريادي لتنمية مستدامة»</div>
    </div>
  </div>

</body>
</html>`;
}

/**
 * Generate slides for each question
 */
function generateQuestionSlides(
  statistics: QuestionStatistics[],
  interpretations: Array<{ questionId: number; interpretation: string; pedagogicalInsights: string; impact: string }>,
  schoolName: string
): string {
  return statistics
    .map((stat, index) => {
      const interp = interpretations.find(i => i.questionId === stat.questionId);

      let chartHTML = "";

      // Generate chart based on question type
      if (stat.statistics.percentages) {
        chartHTML = `
          <div class="chart-container">
            <h3>توزيع الإجابات</h3>
            <div class="bar-chart">
              ${Object.entries(stat.statistics.percentages)
                .map(
                  ([option, percentage]) => `
                <div class="bar-item">
                  <div class="bar-label">
                    <span>${option}</span>
                    <span>${percentage.toFixed(1)}%</span>
                  </div>
                  <div class="bar-bg">
                    <div class="bar-fill" style="width: ${percentage}%">
                      ${percentage > 10 ? percentage.toFixed(1) + "%" : ""}
                    </div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `;
      }

      if (stat.statistics.average !== undefined) {
        chartHTML += `
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">المتوسط</div>
              <div class="stat-value">${stat.statistics.average.toFixed(2)}</div>
            </div>
            ${
              stat.statistics.standardDeviation !== undefined
                ? `
            <div class="stat-card">
              <div class="stat-label">الانحراف المعياري</div>
              <div class="stat-value">${stat.statistics.standardDeviation.toFixed(2)}</div>
            </div>
            `
                : ""
            }
          </div>
        `;
      }

      return `
  <!-- Question ${index + 1} Slide -->
  <div class="slide">
    <div class="header">
      <div class="school-info">
        <div class="school-name">${schoolName}</div>
      </div>
    </div>
    
    <h1>السؤال ${index + 1}</h1>
    <h2>${stat.questionText}</h2>
    
    <div class="content-section">
      <div class="stat-card" style="display: inline-block;">
        <div class="stat-label">عدد الإجابات</div>
        <div class="stat-value">${stat.totalResponses}</div>
      </div>
    </div>
    
    ${chartHTML}
    
    ${
      interp
        ? `
    <div class="interpretation-box">
      <h4>التفسير الإحصائي</h4>
      <p>${interp.interpretation}</p>
    </div>
    
    <div class="interpretation-box">
      <h4>التفسير التربوي</h4>
      <p>${interp.pedagogicalInsights}</p>
    </div>
    
    <div class="interpretation-box">
      <h4>الأثر على جودة التعليم</h4>
      <p>${interp.impact}</p>
    </div>
    `
        : ""
    }
  </div>
      `;
    })
    .join("");
}

/**
 * Get target audience label in Arabic
 */
function getTargetAudienceLabel(audience: string | null): string {
  const labels: Record<string, string> = {
    teachers: "المعلمون",
    students: "الطلاب",
    parents: "أولياء الأمور",
    staff: "الموظفون الإداريون",
    all: "جميع الفئات",
  };
  return labels[audience || ""] || "غير محدد";
}

/**
 * Generate detailed interpretive report
 */
export function generateDetailedReport(
  school: School,
  survey: Survey,
  analysis: Analysis
): string {
  const stats = analysis.statisticalData || [];
  const interpretations = analysis.educationalInterpretation || [];

  let report = `# تقرير تفسيري مفصل\n\n`;
  report += `## ${survey.title}\n\n`;
  report += `**المدرسة:** ${school.schoolName}\n`;
  report += `**العام الأكاديمي:** ${school.academicYear}\n`;
  report += `**المديرة:** ${school.principalName}\n`;
  report += `**النائبة الأكاديمية:** ${school.academicDeputyName}\n`;
  report += `**النائبة الإدارية:** ${school.administrativeDeputyName}\n\n`;
  report += `---\n\n`;

  report += `## الملخص التنفيذي\n\n`;
  report += `${analysis.overallSummary || "تم تحليل الاستبيان بنجاح."}\n\n`;

  report += `## التحليل التفصيلي لكل سؤال\n\n`;

  stats.forEach((stat, index) => {
    const interp = interpretations.find(i => i.questionId === stat.questionId);

    report += `### السؤال ${index + 1}: ${stat.questionText}\n\n`;
    report += `**نوع السؤال:** ${stat.questionType}\n`;
    report += `**عدد الإجابات:** ${stat.totalResponses}\n\n`;

    if (stat.statistics.percentages) {
      report += `#### النسب المئوية:\n\n`;
      Object.entries(stat.statistics.percentages).forEach(([option, percentage]) => {
        report += `- **${option}:** ${percentage.toFixed(1)}%\n`;
      });
      report += `\n`;
    }

    if (stat.statistics.average !== undefined) {
      report += `**المتوسط:** ${stat.statistics.average.toFixed(2)}\n`;
    }

    if (stat.statistics.standardDeviation !== undefined) {
      report += `**الانحراف المعياري:** ${stat.statistics.standardDeviation.toFixed(2)}\n`;
    }

    if (stat.statistics.mode) {
      report += `**الإجابة الأكثر تكراراً:** ${stat.statistics.mode}\n`;
    }

    report += `\n`;

    if (interp) {
      report += `#### التفسير الإحصائي\n\n`;
      report += `${interp.interpretation}\n\n`;

      report += `#### التفسير التربوي\n\n`;
      report += `${interp.pedagogicalInsights}\n\n`;

      report += `#### الأثر على جودة التعليم\n\n`;
      report += `${interp.impact}\n\n`;
    }

    report += `---\n\n`;
  });

  report += `## نقاط القوة\n\n`;
  (analysis.strengths || []).forEach((strength, i) => {
    report += `${i + 1}. ${strength}\n`;
  });
  report += `\n`;

  report += `## نقاط التحسين والتحديات\n\n`;
  (analysis.improvements || []).forEach((improvement, i) => {
    report += `${i + 1}. ${improvement}\n`;
  });
  report += `\n`;

  report += `## التوصيات والمقترحات العملية\n\n`;
  (analysis.recommendations || []).forEach((rec, i) => {
    report += `${i + 1}. ${rec}\n`;
  });
  report += `\n`;

  report += `---\n\n`;
  report += `*تم إنشاء هذا التقرير تلقائياً بواسطة منصة تحليل الاستبيانات التعليمية*\n`;

  return report;
}
